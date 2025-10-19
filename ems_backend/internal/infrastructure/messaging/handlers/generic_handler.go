package handlers

import (
	"context"
	"ems_backend/internal/infrastructure/messaging"
	"fmt"
	"log"
)

// GenericHandler 通用消息处理器
// 可以作为新队列处理器的模板
type GenericHandler struct {
	queueName string
	// 添加你需要的依赖
}

// NewGenericHandler 创建通用处理器
func NewGenericHandler(queueName string) *GenericHandler {
	return &GenericHandler{
		queueName: queueName,
	}
}

// HandleMessage 处理消息
func (h *GenericHandler) HandleMessage(ctx context.Context, queueName string, message messaging.SQSMessage) error {
	log.Printf("=== Processing Message from Queue: %s ===", queueName)
	log.Printf("MessageID: %s", message.MessageID)
	log.Printf("Body: %s", message.Body)

	// TODO: 添加你的处理逻辑

	fmt.Println("✅ Message processed successfully")
	return nil
}
