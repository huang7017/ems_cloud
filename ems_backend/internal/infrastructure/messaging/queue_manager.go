package messaging

import (
	"context"
	"fmt"
	"log"
	"sync"
)

// QueueManager 队列管理器 - 管理多个队列监听器
type QueueManager struct {
	sqsClient *SQSClient
	listeners map[string]*QueueListener
	mu        sync.RWMutex
}

// NewQueueManager 创建队列管理器
func NewQueueManager(sqsClient *SQSClient) *QueueManager {
	return &QueueManager{
		sqsClient: sqsClient,
		listeners: make(map[string]*QueueListener),
	}
}

// RegisterQueue 注册队列
func (m *QueueManager) RegisterQueue(handler MessageHandler, config QueueConfig) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.listeners[config.QueueName]; exists {
		return fmt.Errorf("queue %s already registered", config.QueueName)
	}

	listener, err := NewQueueListener(m.sqsClient, handler, config)
	if err != nil {
		return fmt.Errorf("failed to create listener for queue %s: %w", config.QueueName, err)
	}

	m.listeners[config.QueueName] = listener
	log.Printf("[QueueManager] Registered queue: %s", config.QueueName)
	return nil
}

// StartAll 启动所有队列监听器
func (m *QueueManager) StartAll(ctx context.Context) error {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for queueName, listener := range m.listeners {
		if err := listener.Start(ctx); err != nil {
			log.Printf("[QueueManager] Failed to start listener for queue %s: %v", queueName, err)
			return err
		}
	}

	log.Printf("[QueueManager] Started %d queue listener(s)", len(m.listeners))
	return nil
}

// StopAll 停止所有队列监听器
func (m *QueueManager) StopAll() error {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for queueName, listener := range m.listeners {
		if err := listener.Stop(); err != nil {
			log.Printf("[QueueManager] Failed to stop listener for queue %s: %v", queueName, err)
		}
	}

	log.Printf("[QueueManager] Stopped all queue listeners")
	return nil
}

// GetListener 获取指定队列的监听器
func (m *QueueManager) GetListener(queueName string) (*QueueListener, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	listener, exists := m.listeners[queueName]
	return listener, exists
}

// ListQueues 列出所有注册的队列
func (m *QueueManager) ListQueues() []string {
	m.mu.RLock()
	defer m.mu.RUnlock()

	queues := make([]string, 0, len(m.listeners))
	for queueName := range m.listeners {
		queues = append(queues, queueName)
	}
	return queues
}
