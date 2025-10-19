package messaging

import "context"

// MessageHandler 消息处理器接口
// 为每个队列实现这个接口来处理不同的消息
type MessageHandler interface {
	// HandleMessage 处理单条消息
	// queueName: 队列名称
	// message: SQS消息
	// 返回 error: 如果返回error，消息不会被删除，会重新进入队列
	HandleMessage(ctx context.Context, queueName string, message SQSMessage) error
}
