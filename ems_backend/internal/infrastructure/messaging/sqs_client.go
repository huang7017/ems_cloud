package messaging

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

// SQSClient SQS客户端封装
type SQSClient struct {
	client *sqs.Client
	region string
}

// NewSQSClient 创建新的SQS客户端
func NewSQSClient(ctx context.Context, region string) (*SQSClient, error) {
	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(region))
	if err != nil {
		return nil, err
	}

	return &SQSClient{
		client: sqs.NewFromConfig(cfg),
		region: region,
	}, nil
}

// GetQueueURL 获取队列URL
func (c *SQSClient) GetQueueURL(ctx context.Context, queueName string) (string, error) {
	result, err := c.client.GetQueueUrl(ctx, &sqs.GetQueueUrlInput{
		QueueName: &queueName,
	})
	if err != nil {
		return "", err
	}
	return *result.QueueUrl, nil
}

// ReceiveMessages 接收消息
func (c *SQSClient) ReceiveMessages(ctx context.Context, queueURL string, maxMessages int32, visibilityTimeout int32) ([]SQSMessage, error) {
	result, err := c.client.ReceiveMessage(ctx, &sqs.ReceiveMessageInput{
		QueueUrl:            &queueURL,
		MaxNumberOfMessages: maxMessages,
		VisibilityTimeout:   visibilityTimeout,
		WaitTimeSeconds:     20, // 长轮询
	})
	if err != nil {
		return nil, err
	}

	messages := make([]SQSMessage, 0, len(result.Messages))
	for _, msg := range result.Messages {
		messages = append(messages, SQSMessage{
			MessageID:     *msg.MessageId,
			ReceiptHandle: *msg.ReceiptHandle,
			Body:          *msg.Body,
		})
	}
	return messages, nil
}

// DeleteMessage 删除消息
func (c *SQSClient) DeleteMessage(ctx context.Context, queueURL, receiptHandle string) error {
	_, err := c.client.DeleteMessage(ctx, &sqs.DeleteMessageInput{
		QueueUrl:      &queueURL,
		ReceiptHandle: &receiptHandle,
	})
	return err
}

// SQSMessage SQS消息结构
type SQSMessage struct {
	MessageID     string
	ReceiptHandle string
	Body          string
}
