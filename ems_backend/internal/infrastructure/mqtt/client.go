package mqtt

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

// Config holds MQTT connection configuration for AWS IoT Core
type Config struct {
	// AWS IoT Core endpoint (e.g., "xxxxx.iot.ap-northeast-1.amazonaws.com:8883")
	Endpoint string

	// Client ID (must be unique per connection, typically use device SN or UUID)
	ClientID string

	// Path to CA certificate file (AmazonRootCA1.pem)
	CACertPath string

	// Path to client certificate file (xxx-certificate.pem.crt)
	ClientCertPath string

	// Path to private key file (xxx-private.pem.key)
	PrivateKeyPath string
}

// Client wraps the Paho MQTT client for AWS IoT Core
type Client struct {
	client  mqtt.Client
	config  Config
	mu      sync.RWMutex
	isReady bool

	// Subscriptions to restore on reconnect
	subscriptions map[string]subscriptionInfo
	subMu         sync.RWMutex
}

type subscriptionInfo struct {
	qos     byte
	handler mqtt.MessageHandler
}

// NewClient creates a new MQTT client configured for AWS IoT Core
func NewClient(cfg Config) (*Client, error) {
	// Validate required fields
	if cfg.Endpoint == "" {
		return nil, fmt.Errorf("MQTT endpoint is required")
	}
	if cfg.ClientID == "" {
		return nil, fmt.Errorf("MQTT client ID is required")
	}
	if cfg.CACertPath == "" || cfg.ClientCertPath == "" || cfg.PrivateKeyPath == "" {
		return nil, fmt.Errorf("certificate paths are required for AWS IoT Core")
	}

	// Load TLS config for AWS IoT Core
	tlsConfig, err := newTLSConfig(cfg.CACertPath, cfg.ClientCertPath, cfg.PrivateKeyPath)
	if err != nil {
		return nil, fmt.Errorf("failed to load TLS config: %w", err)
	}

	// Build broker URL with ssl:// scheme
	brokerURL := fmt.Sprintf("ssl://%s", cfg.Endpoint)

	opts := mqtt.NewClientOptions().
		AddBroker(brokerURL).
		SetClientID(cfg.ClientID).
		SetTLSConfig(tlsConfig).
		SetAutoReconnect(true).
		SetConnectRetry(true).
		SetConnectRetryInterval(5 * time.Second).
		SetKeepAlive(60 * time.Second).
		SetPingTimeout(10 * time.Second).
		SetCleanSession(true).
		SetProtocolVersion(4) // MQTT 3.1.1

	c := &Client{
		config:        cfg,
		subscriptions: make(map[string]subscriptionInfo),
	}

	// Connection handler - resubscribe on connect/reconnect
	opts.SetOnConnectHandler(func(client mqtt.Client) {
		c.mu.Lock()
		c.isReady = true
		c.mu.Unlock()
		log.Printf("[MQTT] Connected to AWS IoT Core: %s (Client ID: %s)", cfg.Endpoint, cfg.ClientID)

		// Restore subscriptions on reconnect
		c.subMu.RLock()
		subCount := len(c.subscriptions)
		c.subMu.RUnlock()

		if subCount == 0 {
			log.Printf("[MQTT] No subscriptions to restore (first connection)")
		} else {
			log.Printf("[MQTT] Restoring %d subscriptions...", subCount)
			c.subMu.RLock()
			defer c.subMu.RUnlock()
			for topic, info := range c.subscriptions {
				token := client.Subscribe(topic, info.qos, info.handler)
				if token.Wait() && token.Error() != nil {
					log.Printf("[MQTT] Failed to resubscribe to %s: %v", topic, token.Error())
				} else {
					log.Printf("[MQTT] Resubscribed to topic: %s (QoS: %d)", topic, info.qos)
				}
			}
		}
	})

	// Connection lost handler
	opts.SetConnectionLostHandler(func(client mqtt.Client, err error) {
		c.mu.Lock()
		c.isReady = false
		c.mu.Unlock()
		log.Printf("[MQTT] Connection lost: %v", err)
	})

	// Reconnecting handler
	opts.SetReconnectingHandler(func(client mqtt.Client, opts *mqtt.ClientOptions) {
		log.Printf("[MQTT] Attempting to reconnect to AWS IoT Core...")
	})

	// Default message handler for debugging - catches messages on topics without specific handlers
	opts.SetDefaultPublishHandler(func(client mqtt.Client, msg mqtt.Message) {
		log.Printf("[MQTT] DEBUG: Received message on unhandled topic %s: %s", msg.Topic(), string(msg.Payload()))
	})

	c.client = mqtt.NewClient(opts)

	return c, nil
}

// newTLSConfig creates a TLS configuration for AWS IoT Core mutual TLS authentication
func newTLSConfig(caPath, certPath, keyPath string) (*tls.Config, error) {
	// Load CA certificate
	caCert, err := os.ReadFile(caPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read CA certificate: %w", err)
	}

	caCertPool := x509.NewCertPool()
	if !caCertPool.AppendCertsFromPEM(caCert) {
		return nil, fmt.Errorf("failed to parse CA certificate")
	}

	// Load client certificate and private key
	clientCert, err := tls.LoadX509KeyPair(certPath, keyPath)
	if err != nil {
		return nil, fmt.Errorf("failed to load client certificate: %w", err)
	}

	return &tls.Config{
		RootCAs:      caCertPool,
		Certificates: []tls.Certificate{clientCert},
		MinVersion:   tls.VersionTLS12,
	}, nil
}

// Connect establishes connection to AWS IoT Core
func (c *Client) Connect() error {
	log.Printf("[MQTT] Attempting to connect to AWS IoT Core...")
	token := c.client.Connect()
	if token.Wait() && token.Error() != nil {
		return fmt.Errorf("failed to connect to AWS IoT Core: %w", token.Error())
	}

	// Wait a bit for connection to stabilize
	time.Sleep(500 * time.Millisecond)

	// Start connection monitor
	go c.monitorConnection()

	return nil
}

// monitorConnection periodically logs connection status for debugging
func (c *Client) monitorConnection() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		c.mu.RLock()
		isReady := c.isReady
		c.mu.RUnlock()

		isConnected := c.client.IsConnected()

		c.subMu.RLock()
		subCount := len(c.subscriptions)
		var topics []string
		for topic := range c.subscriptions {
			topics = append(topics, topic)
		}
		c.subMu.RUnlock()

		log.Printf("[MQTT] Status: connected=%v, ready=%v, subscriptions=%d %v",
			isConnected, isReady, subCount, topics)

		// If disconnected but was ready, try to reconnect
		if !isConnected && isReady {
			log.Printf("[MQTT] Connection lost, auto-reconnect should handle this...")
		}
	}
}

// Disconnect cleanly disconnects from AWS IoT Core
func (c *Client) Disconnect() {
	c.mu.Lock()
	c.isReady = false
	c.mu.Unlock()
	c.client.Disconnect(250)
	log.Println("[MQTT] Disconnected from AWS IoT Core")
}

// IsConnected returns true if the client is connected
func (c *Client) IsConnected() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.isReady && c.client.IsConnected()
}

// Publish sends a message to the specified topic
// AWS IoT Core requires QoS 0 or 1 (QoS 2 is not supported)
func (c *Client) Publish(topic string, qos byte, retained bool, payload []byte) error {
	if !c.IsConnected() {
		return fmt.Errorf("MQTT client is not connected")
	}

	// AWS IoT Core doesn't support QoS 2
	if qos > 1 {
		qos = 1
	}

	token := c.client.Publish(topic, qos, retained, payload)
	if token.Wait() && token.Error() != nil {
		return fmt.Errorf("failed to publish message: %w", token.Error())
	}

	log.Printf("[MQTT] Published to %s: %s", topic, string(payload))
	return nil
}

// Subscribe subscribes to a topic with the given handler
func (c *Client) Subscribe(topic string, qos byte, handler mqtt.MessageHandler) error {
	log.Printf("[MQTT] Attempting to subscribe to topic: %s (QoS: %d)", topic, qos)

	if !c.IsConnected() {
		return fmt.Errorf("MQTT client is not connected")
	}

	// AWS IoT Core doesn't support QoS 2
	if qos > 1 {
		qos = 1
		log.Printf("[MQTT] QoS downgraded to 1 (AWS IoT Core limit)")
	}

	// Wrap handler with logging
	wrappedHandler := func(client mqtt.Client, msg mqtt.Message) {
		log.Printf("[MQTT] >>> Message received on topic: %s (payload len: %d)", msg.Topic(), len(msg.Payload()))
		handler(client, msg)
	}

	token := c.client.Subscribe(topic, qos, wrappedHandler)
	if token.Wait() && token.Error() != nil {
		log.Printf("[MQTT] Subscription FAILED for topic %s: %v", topic, token.Error())
		return fmt.Errorf("failed to subscribe to topic: %w", token.Error())
	}

	// Save subscription for reconnect (save wrapped handler)
	c.subMu.Lock()
	c.subscriptions[topic] = subscriptionInfo{qos: qos, handler: wrappedHandler}
	c.subMu.Unlock()

	log.Printf("[MQTT] Subscribed successfully to topic: %s", topic)
	return nil
}

// Unsubscribe unsubscribes from a topic
func (c *Client) Unsubscribe(topics ...string) error {
	token := c.client.Unsubscribe(topics...)
	if token.Wait() && token.Error() != nil {
		return fmt.Errorf("failed to unsubscribe: %w", token.Error())
	}

	// Remove from saved subscriptions
	c.subMu.Lock()
	for _, topic := range topics {
		delete(c.subscriptions, topic)
	}
	c.subMu.Unlock()

	return nil
}
