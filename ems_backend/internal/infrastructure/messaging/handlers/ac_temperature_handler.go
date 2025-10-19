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

// ACTemperatureData AC温度消息数据结构
type ACTemperatureData struct {
	Temperature   float64 `json:"temperature"`
	Humidity      float64 `json:"humidity"`
	TemperatureID string  `json:"temp_id"`
	Timestamp     int64   `json:"ts_ms"`
}

// ACTemperatureHandler AC温度队列消息处理器
type ACTemperatureHandler struct {
	tempAppService *services.TemperatureApplicationService
}

// NewACTemperatureHandler 创建AC温度处理器
func NewACTemperatureHandler(tempAppService *services.TemperatureApplicationService) *ACTemperatureHandler {
	return &ACTemperatureHandler{
		tempAppService: tempAppService,
	}
}

// HandleMessage 处理消息
func (h *ACTemperatureHandler) HandleMessage(ctx context.Context, queueName string, message messaging.SQSMessage) error {
	log.Printf("=== Processing Message from Queue: %s ===", queueName)
	log.Printf("MessageID: %s", message.MessageID)
	log.Printf("Body: %s", message.Body)

	// 1. 解析消息内容
	var data ACTemperatureData
	if err := json.Unmarshal([]byte(message.Body), &data); err != nil {
		return fmt.Errorf("failed to parse message: %w", err)
	}

	// 2. 解析时间戳（从毫秒转换为 time.Time）
	var timestamp time.Time
	if data.Timestamp > 0 {
		// 将毫秒时间戳转换为秒和纳秒
		timestamp = time.Unix(data.Timestamp/1000, (data.Timestamp%1000)*int64(time.Millisecond))
		log.Printf("Parsed timestamp: %s", timestamp.Format(time.RFC3339))
	} else {
		log.Printf("⚠️  Invalid timestamp, using current time")
		timestamp = time.Now()
	}

	// 3. 调用 Application Service 保存数据
	// 使用 MessageID 作为唯一标识，保证幂等性
	if err := h.tempAppService.SaveTemperatureData(
		data.TemperatureID, // 使用 MessageID 作为 TemperatureID
		data.Temperature,
		data.Humidity,
		timestamp,
	); err != nil {
		return fmt.Errorf("failed to save temperature data: %w", err)
	}

	log.Printf("✅ Temperature data saved: Device=%s, Temp=%.2f°C, Humidity=%.2f%%",
		data.TemperatureID, data.Temperature, data.Humidity)
	return nil
}
