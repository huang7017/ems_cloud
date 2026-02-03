package handlers

import (
	"context"
	deviceRepo "ems_backend/internal/domain/company_device/repositories"
	"ems_backend/internal/infrastructure/cache"
	"ems_backend/internal/infrastructure/messaging"
	"ems_backend/internal/infrastructure/websocket"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

// MessageType - 用於解析訊息類型
type MessageType struct {
	Type string `json:"type"`
}

// PackageACStatusData - Package AC 狀態消息數據結構
type PackageACStatusData struct {
	Topic          string `json:"topic"`
	PackageID      string `json:"package_id"`
	PackageName    string `json:"package_name"`
	CompressorID   string `json:"compressor_id"`
	CompressorAddr int    `json:"compressor_addr"`
	RunStatus      bool   `json:"run_status"`
	ErrorStatus    bool   `json:"error_status"`
	RuntimeSeconds int64  `json:"runtime_seconds"`
	StartsInHour   int    `json:"starts_in_hour"`
	Type           string `json:"type"`
	Timestamp      string `json:"timestamp"`
	TsMs           int64  `json:"ts_ms"`
	ClientID       string `json:"client_id"`
}

// VRFStatusData - VRF 狀態消息數據結構
type VRFStatusData struct {
	Topic      string `json:"topic"`
	VRFID      string `json:"vrf_id"`
	VRFAddress string `json:"vrf_address"`
	ACNumber   int    `json:"ac_number"`
	Status     int    `json:"status"`
	Type       string `json:"type"`
	TsMs       int64  `json:"ts_ms"`
	ClientID   string `json:"client_id"`
}

// ACStatusHandler - 統一的 AC 狀態消息處理器（處理 package_ac_status 和 vrf_status）
type ACStatusHandler struct {
	companyDeviceRepo deviceRepo.CompanyDeviceRepository
	deviceCache       *cache.DeviceCache
	wsHub             *websocket.Hub
}

func NewACStatusHandler(companyDeviceRepo deviceRepo.CompanyDeviceRepository, deviceCache *cache.DeviceCache) *ACStatusHandler {
	return &ACStatusHandler{
		companyDeviceRepo: companyDeviceRepo,
		deviceCache:       deviceCache,
		wsHub:             websocket.GetHub(),
	}
}

func (h *ACStatusHandler) HandleMessage(ctx context.Context, queueName string, message messaging.SQSMessage) error {
	// 先解析 type 欄位
	var msgType MessageType
	if err := json.Unmarshal([]byte(message.Body), &msgType); err != nil {
		return fmt.Errorf("failed to parse message type: %w", err)
	}

	log.Printf("[ACStatus] Received message type: %s", msgType.Type)

	// 根據 type 分發處理
	switch msgType.Type {
	case "package_ac_status":
		return h.handlePackageACStatus(message.Body)
	case "vrf_status":
		return h.handleVRFStatus(message.Body)
	default:
		log.Printf("[ACStatus] Unknown message type: %s", msgType.Type)
		return nil // 不返回錯誤，避免訊息重試
	}
}

// handlePackageACStatus - 處理 Package AC 狀態
func (h *ACStatusHandler) handlePackageACStatus(body string) error {
	var data PackageACStatusData
	if err := json.Unmarshal([]byte(body), &data); err != nil {
		return fmt.Errorf("failed to parse package ac status: %w", err)
	}

	// 解析時間戳
	var timestampStr string
	if data.TsMs > 0 {
		timestamp := time.Unix(data.TsMs/1000, (data.TsMs%1000)*int64(time.Millisecond)).UTC()
		timestampStr = timestamp.Format(time.RFC3339)
	} else if data.Timestamp != "" {
		timestampStr = data.Timestamp
	} else {
		timestampStr = time.Now().UTC().Format(time.RFC3339)
	}

	// 從快取中查找設備
	device, found := h.deviceCache.GetDeviceByCompressorID(data.CompressorID)
	if !found {
		device, found = h.deviceCache.GetDeviceByPackageID(data.PackageID)
	}

	if !found {
		log.Printf("[PackageACStatus] Warning: Device not found for Package=%s, Compressor=%s",
			data.PackageID, data.CompressorID)
		return nil
	}

	// 解析並更新 content
	content, err := device.ParseContent()
	if err != nil {
		return fmt.Errorf("failed to parse device content: %w", err)
	}

	updated := false
	for i, pkg := range content.Packages {
		if pkg.ID == data.PackageID {
			for j, comp := range pkg.Compressors {
				if comp.ID == data.CompressorID {
					content.Packages[i].Compressors[j].RunStatus = data.RunStatus
					content.Packages[i].Compressors[j].ErrorStatus = data.ErrorStatus
					content.Packages[i].Compressors[j].RuntimeSeconds = data.RuntimeSeconds
					content.Packages[i].Compressors[j].StartsInHour = data.StartsInHour
					content.Packages[i].Compressors[j].LastSwitchAt = &timestampStr
					updated = true
					break
				}
			}
			if updated {
				break
			}
		}
	}

	if updated {
		newContent, err := json.Marshal(content)
		if err != nil {
			return fmt.Errorf("failed to marshal content: %w", err)
		}
		device.Content = newContent
		device.ModifyTime = time.Now()

		if err := h.companyDeviceRepo.Update(device); err != nil {
			return fmt.Errorf("failed to update device: %w", err)
		}

		h.deviceCache.UpdateDevice(device)

		// 廣播 WebSocket 事件
		h.wsHub.BroadcastACStatus(device.CompanyID, websocket.ACStatusUpdate{
			PackageID:      data.PackageID,
			PackageName:    data.PackageName,
			CompressorID:   data.CompressorID,
			CompressorAddr: data.CompressorAddr,
			RunStatus:      data.RunStatus,
			ErrorStatus:    data.ErrorStatus,
			RuntimeSeconds: data.RuntimeSeconds,
			StartsInHour:   data.StartsInHour,
			Timestamp:      timestampStr,
		})

		log.Printf("[PackageACStatus] Updated & Broadcasted: Package=%s, Compressor=%s, Running=%v",
			data.PackageID, data.CompressorID, data.RunStatus)
	}

	return nil
}

// handleVRFStatus - 處理 VRF 狀態
func (h *ACStatusHandler) handleVRFStatus(body string) error {
	var data VRFStatusData
	if err := json.Unmarshal([]byte(body), &data); err != nil {
		return fmt.Errorf("failed to parse vrf status: %w", err)
	}

	// 解析時間戳
	var timestampStr string
	if data.TsMs > 0 {
		timestamp := time.Unix(data.TsMs/1000, (data.TsMs%1000)*int64(time.Millisecond)).UTC()
		timestampStr = timestamp.Format(time.RFC3339)
	} else {
		timestampStr = time.Now().UTC().Format(time.RFC3339)
	}

	// 從快取中查找設備
	device, found := h.deviceCache.GetDeviceByVRFID(data.VRFID)
	if !found {
		log.Printf("[VRFStatus] Warning: Device not found for VRF=%s", data.VRFID)
		return nil
	}

	// 解析並更新 content
	content, err := device.ParseContent()
	if err != nil {
		return fmt.Errorf("failed to parse device content: %w", err)
	}

	updated := false
	for i, vrf := range content.VRFs {
		if vrf.ID == data.VRFID {
			if len(content.VRFs[i].ACs) > 0 {
				for j, unit := range content.VRFs[i].ACs {
					if unit.Number != nil && *unit.Number == data.ACNumber {
						content.VRFs[i].ACs[j].Status = data.Status
						updated = true
						break
					}
				}
			} else if len(content.VRFs[i].ACUnits) > 0 {
				for j, unit := range content.VRFs[i].ACUnits {
					if unit.Number != nil && *unit.Number == data.ACNumber {
						content.VRFs[i].ACUnits[j].Status = data.Status
						updated = true
						break
					}
				}
			}
			if updated {
				break
			}
		}
	}

	if updated {
		newContent, err := json.Marshal(content)
		if err != nil {
			return fmt.Errorf("failed to marshal content: %w", err)
		}
		device.Content = newContent
		device.ModifyTime = time.Now()

		if err := h.companyDeviceRepo.Update(device); err != nil {
			return fmt.Errorf("failed to update device: %w", err)
		}

		h.deviceCache.UpdateDevice(device)

		// 廣播 WebSocket 事件
		h.wsHub.BroadcastVRFStatus(device.CompanyID, websocket.VRFStatusUpdate{
			VRFID:      data.VRFID,
			VRFAddress: data.VRFAddress,
			ACNumber:   data.ACNumber,
			Status:     data.Status,
			Timestamp:  timestampStr,
		})

		log.Printf("[VRFStatus] Updated & Broadcasted: VRF=%s, ACNumber=%d, Status=%d",
			data.VRFID, data.ACNumber, data.Status)
	}

	return nil
}

// 保留舊的 handler 名稱以保持向後兼容
type PackageACStatusHandler = ACStatusHandler

func NewPackageACStatusHandler(companyDeviceRepo deviceRepo.CompanyDeviceRepository, deviceCache *cache.DeviceCache) *PackageACStatusHandler {
	return NewACStatusHandler(companyDeviceRepo, deviceCache)
}

// VRFStatusHandler - 保留舊的類型別名
type VRFStatusHandler = ACStatusHandler

func NewVRFStatusHandler(companyDeviceRepo deviceRepo.CompanyDeviceRepository, deviceCache *cache.DeviceCache) *VRFStatusHandler {
	return NewACStatusHandler(companyDeviceRepo, deviceCache)
}
