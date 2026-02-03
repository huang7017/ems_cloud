package dto

import (
	"time"

	"ems_backend/internal/domain/device/entities"
)

// DeviceResponse 設備響應 DTO
type DeviceResponse struct {
	ID         uint      `json:"id"`
	SN         string    `json:"sn"`
	CreateID   uint      `json:"create_id"`
	CreateTime time.Time `json:"create_time"`
	ModifyID   uint      `json:"modify_id"`
	ModifyTime time.Time `json:"modify_time"`
}

// DeviceCreateRequest 創建設備請求 DTO
type DeviceCreateRequest struct {
	SN string `json:"sn" binding:"required"`
}

// DeviceUpdateRequest 更新設備請求 DTO
type DeviceUpdateRequest struct {
	SN string `json:"sn" binding:"required"`
}

// NewDeviceResponse 從實體創建響應 DTO
func NewDeviceResponse(e *entities.Device) *DeviceResponse {
	return &DeviceResponse{
		ID:         e.ID,
		SN:         e.SN,
		CreateID:   e.CreateID,
		CreateTime: e.CreateTime,
		ModifyID:   e.ModifyID,
		ModifyTime: e.ModifyTime,
	}
}

// NewDeviceResponseList 從實體列表創建響應 DTO 列表
func NewDeviceResponseList(devices []*entities.Device) []*DeviceResponse {
	result := make([]*DeviceResponse, len(devices))
	for i, d := range devices {
		result[i] = NewDeviceResponse(d)
	}
	return result
}
