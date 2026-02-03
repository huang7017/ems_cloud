package sse

import (
	"encoding/json"
	"log"
	"sync"
)

// EventType - SSE 事件類型
type EventType string

const (
	EventACStatus    EventType = "ac_status"
	EventVRFStatus   EventType = "vrf_status"
	EventTemperature EventType = "temperature"
	EventMeter       EventType = "meter"
	EventAlert       EventType = "alert"
)

// Event - SSE 事件
type Event struct {
	Type      EventType   `json:"type"`
	CompanyID uint        `json:"company_id,omitempty"`
	Data      interface{} `json:"data"`
}

// Client - SSE 客戶端連線
type Client struct {
	ID        string
	MemberID  uint
	CompanyID uint // 如果設定，只接收該公司的事件
	Channel   chan []byte
}

// Hub - SSE 廣播中心
type Hub struct {
	mu      sync.RWMutex
	clients map[string]*Client
}

// Global hub instance
var globalHub *Hub
var hubOnce sync.Once

// GetHub - 獲取全域 Hub 實例
func GetHub() *Hub {
	hubOnce.Do(func() {
		globalHub = &Hub{
			clients: make(map[string]*Client),
		}
		log.Println("[SSE Hub] Initialized")
	})
	return globalHub
}

// Register - 註冊客戶端
func (h *Hub) Register(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	h.clients[client.ID] = client
	log.Printf("[SSE Hub] Client registered: %s (MemberID: %d, CompanyID: %d)", client.ID, client.MemberID, client.CompanyID)
}

// Unregister - 取消註冊客戶端
func (h *Hub) Unregister(clientID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if client, exists := h.clients[clientID]; exists {
		close(client.Channel)
		delete(h.clients, clientID)
		log.Printf("[SSE Hub] Client unregistered: %s", clientID)
	}
}

// Broadcast - 廣播事件給所有客戶端
func (h *Hub) Broadcast(event Event) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("[SSE Hub] Failed to marshal event: %v", err)
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, client := range h.clients {
		// 如果客戶端指定了 CompanyID，只發送該公司的事件
		if client.CompanyID > 0 && event.CompanyID > 0 && client.CompanyID != event.CompanyID {
			continue
		}

		select {
		case client.Channel <- data:
		default:
			// Channel 已滿，跳過此客戶端
			log.Printf("[SSE Hub] Client %s channel full, skipping", client.ID)
		}
	}
}

// BroadcastToCompany - 廣播事件給指定公司的客戶端
func (h *Hub) BroadcastToCompany(companyID uint, event Event) {
	event.CompanyID = companyID
	h.Broadcast(event)
}

// GetClientCount - 獲取連線客戶端數量
func (h *Hub) GetClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// ACStatusUpdate - AC 狀態更新資料
type ACStatusUpdate struct {
	PackageID      string `json:"package_id,omitempty"`
	PackageName    string `json:"package_name,omitempty"`
	CompressorID   string `json:"compressor_id,omitempty"`
	CompressorAddr int    `json:"compressor_addr,omitempty"`
	RunStatus      bool   `json:"run_status"`
	ErrorStatus    bool   `json:"error_status"`
	RuntimeSeconds int64  `json:"runtime_seconds,omitempty"`
	StartsInHour   int    `json:"starts_in_hour,omitempty"`
	Timestamp      string `json:"timestamp"`
}

// VRFStatusUpdate - VRF 狀態更新資料
type VRFStatusUpdate struct {
	VRFID      string `json:"vrf_id"`
	VRFAddress string `json:"vrf_address,omitempty"`
	ACNumber   int    `json:"ac_number"`
	Status     int    `json:"status"`
	Timestamp  string `json:"timestamp"`
}

// BroadcastACStatus - 廣播 AC 狀態更新
func (h *Hub) BroadcastACStatus(companyID uint, update ACStatusUpdate) {
	h.BroadcastToCompany(companyID, Event{
		Type: EventACStatus,
		Data: update,
	})
}

// BroadcastVRFStatus - 廣播 VRF 狀態更新
func (h *Hub) BroadcastVRFStatus(companyID uint, update VRFStatusUpdate) {
	h.BroadcastToCompany(companyID, Event{
		Type: EventVRFStatus,
		Data: update,
	})
}
