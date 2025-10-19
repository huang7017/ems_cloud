package messaging

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"
)

// QueueConfig 队列配置
type QueueConfig struct {
	QueueName         string        // 队列名称
	MaxMessages       int32         // 每次最多接收的消息数 (1-10)
	VisibilityTimeout int32         // 消息可见性超时（秒）
	PollInterval      time.Duration // 轮询间隔
}

// QueueListener 队列监听器
type QueueListener struct {
	sqsClient *SQSClient
	handler   MessageHandler
	config    QueueConfig
	queueURL  string
	running   bool
	stopChan  chan struct{}
	wg        sync.WaitGroup
	mu        sync.RWMutex
}

// NewQueueListener 创建新的队列监听器
func NewQueueListener(
	sqsClient *SQSClient,
	handler MessageHandler,
	config QueueConfig,
) (*QueueListener, error) {
	// 设置默认值
	if config.MaxMessages == 0 {
		config.MaxMessages = 10
	}
	if config.VisibilityTimeout == 0 {
		config.VisibilityTimeout = 30
	}
	if config.PollInterval == 0 {
		config.PollInterval = 1 * time.Second
	}

	// 获取队列URL
	ctx := context.Background()
	queueURL, err := sqsClient.GetQueueURL(ctx, config.QueueName)
	if err != nil {
		return nil, fmt.Errorf("failed to get queue URL for %s: %w", config.QueueName, err)
	}

	return &QueueListener{
		sqsClient: sqsClient,
		handler:   handler,
		config:    config,
		queueURL:  queueURL,
		stopChan:  make(chan struct{}),
	}, nil
}

// Start 启动监听
func (l *QueueListener) Start(ctx context.Context) error {
	l.mu.Lock()
	if l.running {
		l.mu.Unlock()
		return fmt.Errorf("listener for queue %s is already running", l.config.QueueName)
	}
	l.running = true
	l.mu.Unlock()

	log.Printf("[QueueListener] Starting listener for queue: %s", l.config.QueueName)

	l.wg.Add(1)
	go l.listen(ctx)

	return nil
}

// Stop 停止监听
func (l *QueueListener) Stop() error {
	l.mu.Lock()
	if !l.running {
		l.mu.Unlock()
		return fmt.Errorf("listener for queue %s is not running", l.config.QueueName)
	}
	l.mu.Unlock()

	log.Printf("[QueueListener] Stopping listener for queue: %s", l.config.QueueName)
	close(l.stopChan)
	l.wg.Wait()

	l.mu.Lock()
	l.running = false
	l.mu.Unlock()

	log.Printf("[QueueListener] Stopped listener for queue: %s", l.config.QueueName)
	return nil
}

// IsRunning 是否正在运行
func (l *QueueListener) IsRunning() bool {
	l.mu.RLock()
	defer l.mu.RUnlock()
	return l.running
}

// listen 监听队列
func (l *QueueListener) listen(ctx context.Context) {
	defer l.wg.Done()

	ticker := time.NewTicker(l.config.PollInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Printf("[QueueListener] Context cancelled, stopping listener for queue: %s", l.config.QueueName)
			return
		case <-l.stopChan:
			log.Printf("[QueueListener] Stop signal received, stopping listener for queue: %s", l.config.QueueName)
			return
		case <-ticker.C:
			l.poll(ctx)
		}
	}
}

// poll 轮询消息
func (l *QueueListener) poll(ctx context.Context) {
	messages, err := l.sqsClient.ReceiveMessages(ctx, l.queueURL, l.config.MaxMessages, l.config.VisibilityTimeout)
	if err != nil {
		log.Printf("[QueueListener] Error receiving messages from queue %s: %v", l.config.QueueName, err)
		return
	}

	if len(messages) == 0 {
		return
	}

	log.Printf("[QueueListener] Received %d message(s) from queue: %s", len(messages), l.config.QueueName)

	// 处理每条消息
	for _, msg := range messages {
		if err := l.processMessage(ctx, msg); err != nil {
			log.Printf("[QueueListener] Error processing message %s from queue %s: %v", msg.MessageID, l.config.QueueName, err)
			// 不删除消息，让其重新可见后重试
			continue
		}

		// 成功处理后删除消息
		if err := l.sqsClient.DeleteMessage(ctx, l.queueURL, msg.ReceiptHandle); err != nil {
			log.Printf("[QueueListener] Error deleting message %s from queue %s: %v", msg.MessageID, l.config.QueueName, err)
		}
	}
}

// processMessage 处理单条消息
func (l *QueueListener) processMessage(ctx context.Context, msg SQSMessage) error {
	return l.handler.HandleMessage(ctx, l.config.QueueName, msg)
}
