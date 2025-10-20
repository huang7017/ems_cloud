package handlers

import (
	"context"
	"ems_backend/internal/application/services"
	"ems_backend/internal/infrastructure/messaging"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

// MeterData 電表消息数据结构
type MeterData struct {
	MeterID   string  `json:"meter_id"`
	KWh       float64 `json:"kWh"`
	KW        float64 `json:"kW"`
	Timestamp int64   `json:"ts_ms"`
}

// MeterHandler 電表队列消息处理器
type MeterHandler struct {
	meterAppService *services.MeterApplicationService
}

// NewMeterHandler 创建電表处理器
func NewMeterHandler(meterAppService *services.MeterApplicationService) *MeterHandler {
	return &MeterHandler{
		meterAppService: meterAppService,
	}
}

// HandleMessage 处理消息
func (h *MeterHandler) HandleMessage(ctx context.Context, queueName string, message messaging.SQSMessage) error {
	log.Printf("=== Processing Message from Queue: %s ===", queueName)
	log.Printf("MessageID: %s", message.MessageID)
	log.Printf("Body: %s", message.Body)

	// 1. 解析消息内容
	var data MeterData
	if err := json.Unmarshal([]byte(message.Body), &data); err != nil {
		return fmt.Errorf("failed to parse message: %w", err)
	}

	// 2. 解析时间戳（从毫秒转换为 time.Time）
	var timestamp time.Time
	if data.Timestamp > 0 {
		// 将毫秒时间戳转换为秒和纳秒，并确保使用 UTC 时区
		timestamp = time.Unix(data.Timestamp/1000, (data.Timestamp%1000)*int64(time.Millisecond)).UTC()
		log.Printf("Parsed timestamp: %s", timestamp.Format(time.RFC3339))
	} else {
		log.Printf("⚠️  Invalid timestamp, using current time")
		timestamp = time.Now().UTC()
	}

	// 3. 调用 Application Service 保存数据
	if err := h.meterAppService.SaveMeterData(
		data.MeterID,
		data.KWh,
		data.KW,
		timestamp,
	); err != nil {
		return fmt.Errorf("failed to save meter data: %w", err)
	}

	log.Printf("✅ Meter data saved: MeterID=%s, kWh=%.2f, kW=%.2f",
		data.MeterID, data.KWh, data.KW)
	return nil
}
