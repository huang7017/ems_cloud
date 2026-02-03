package mqtt

import (
	"encoding/json"
	"log"
	"strings"
	"sync"
	"time"

	companyDeviceRepos "ems_backend/internal/domain/company_device/repositories"
	deviceRepos "ems_backend/internal/domain/device/repositories"
	scheduleEntities "ems_backend/internal/domain/schedule/entities"
	scheduleRepos "ems_backend/internal/domain/schedule/repositories"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

// DeviceUpdateEvent represents an event sent to SSE clients
type DeviceUpdateEvent struct {
	DeviceSN  string          `json:"device_sn"`
	CompanyID uint            `json:"company_id"`
	DeviceID  uint            `json:"device_id"`
	Content   json.RawMessage `json:"content"`
	UpdatedAt string          `json:"updated_at"`
}

// SSEClient represents a connected SSE client
type SSEClient struct {
	ID       string
	Channel  chan DeviceUpdateEvent
	CompanyID uint // Filter events by company (0 = all)
}

// DeviceResponseHandler handles incoming device responses via MQTT
type DeviceResponseHandler struct {
	client            *Client
	companyDeviceRepo companyDeviceRepos.CompanyDeviceRepository
	deviceRepo        deviceRepos.DeviceRepository
	scheduleRepo      scheduleRepos.ScheduleRepository

	// SSE clients management
	sseClients map[string]*SSEClient
	sseMutex   sync.RWMutex
}

// Global instance for SSE access from handlers
var globalHandler *DeviceResponseHandler

// NewDeviceResponseHandler creates a new handler for device responses
func NewDeviceResponseHandler(
	client *Client,
	companyDeviceRepo companyDeviceRepos.CompanyDeviceRepository,
	deviceRepo deviceRepos.DeviceRepository,
) *DeviceResponseHandler {
	h := &DeviceResponseHandler{
		client:            client,
		companyDeviceRepo: companyDeviceRepo,
		deviceRepo:        deviceRepo,
		sseClients:        make(map[string]*SSEClient),
	}
	globalHandler = h
	return h
}

// GetGlobalHandler returns the global device response handler instance
func GetGlobalHandler() *DeviceResponseHandler {
	return globalHandler
}

// SetScheduleRepository sets the schedule repository for saving schedule data from device
func (h *DeviceResponseHandler) SetScheduleRepository(scheduleRepo scheduleRepos.ScheduleRepository) {
	h.scheduleRepo = scheduleRepo
}

// Start subscribes to device response topics and begins processing
func (h *DeviceResponseHandler) Start() error {
	if h.client == nil {
		log.Printf("[MQTT] Warning: DeviceResponseHandler.Start() called but client is nil")
		return nil
	}

	topic := GetReturnTopicWildcard() // ac/return/+
	log.Printf("[MQTT] DeviceResponseHandler subscribing to: %s", topic)

	err := h.client.Subscribe(topic, 1, h.handleMessage)
	if err != nil {
		log.Printf("[MQTT] DeviceResponseHandler subscription FAILED: %v", err)
		return err
	}

	log.Printf("[MQTT] DeviceResponseHandler subscription SUCCESS - ready to receive device messages")
	return nil
}

// RegisterSSEClient adds a new SSE client
func (h *DeviceResponseHandler) RegisterSSEClient(client *SSEClient) {
	h.sseMutex.Lock()
	defer h.sseMutex.Unlock()
	h.sseClients[client.ID] = client
	log.Printf("[SSE] Client registered: %s (company: %d)", client.ID, client.CompanyID)
}

// UnregisterSSEClient removes an SSE client
func (h *DeviceResponseHandler) UnregisterSSEClient(clientID string) {
	h.sseMutex.Lock()
	defer h.sseMutex.Unlock()
	if client, ok := h.sseClients[clientID]; ok {
		close(client.Channel)
		delete(h.sseClients, clientID)
		log.Printf("[SSE] Client unregistered: %s", clientID)
	}
}

// broadcastToSSEClients sends an event to all relevant SSE clients
func (h *DeviceResponseHandler) broadcastToSSEClients(event DeviceUpdateEvent) {
	h.sseMutex.RLock()
	defer h.sseMutex.RUnlock()

	for _, client := range h.sseClients {
		// Send to all clients or filter by company
		if client.CompanyID == 0 || client.CompanyID == event.CompanyID {
			select {
			case client.Channel <- event:
			default:
				// Channel full, skip
				log.Printf("[SSE] Channel full for client %s, skipping event", client.ID)
			}
		}
	}
}

// handleMessage processes incoming MQTT messages from devices
func (h *DeviceResponseHandler) handleMessage(client mqtt.Client, msg mqtt.Message) {
	topic := msg.Topic()
	payload := msg.Payload()

	log.Printf("[MQTT] ============================================")
	log.Printf("[MQTT] HANDLER INVOKED - Received message!")
	log.Printf("[MQTT] Topic: %s", topic)
	log.Printf("[MQTT] Payload length: %d bytes", len(payload))
	log.Printf("[MQTT] Payload: %s", string(payload))
	log.Printf("[MQTT] ============================================")

	// Extract device SN from topic: ac/return/{device_sn}
	parts := strings.Split(topic, "/")
	if len(parts) < 3 {
		log.Printf("[MQTT] Invalid topic format: %s", topic)
		return
	}
	deviceSN := parts[2]

	// Parse the response to extract 'data' field
	var response struct {
		Success bool            `json:"success"`
		Data    json.RawMessage `json:"data"`
	}
	if err := json.Unmarshal(payload, &response); err != nil {
		log.Printf("[MQTT] Failed to parse device response: %v", err)
		return
	}

	// Only process if success and data exists
	if !response.Success || len(response.Data) == 0 {
		log.Printf("[MQTT] Response not successful or no data for device %s", deviceSN)
		return
	}

	// Check if this is a getSchedule response (has schedule_id and daily_rules)
	var scheduleData struct {
		ScheduleID string                 `json:"schedule_id"`
		Command    string                 `json:"command"`
		DailyRules map[string]interface{} `json:"daily_rules"`
		Exceptions []string               `json:"exceptions"`
	}
	if err := json.Unmarshal(response.Data, &scheduleData); err != nil {
		log.Printf("[MQTT] Failed to parse schedule data: %v", err)
	} else {
		log.Printf("[MQTT] Parsed schedule data - ScheduleID: %s, DailyRules: %v", scheduleData.ScheduleID, scheduleData.DailyRules != nil)
	}

	if scheduleData.ScheduleID != "" && scheduleData.DailyRules != nil {
		// This is a getSchedule response, save to schedules table
		log.Printf("[MQTT] Detected getSchedule response for device %s", deviceSN)
		if h.scheduleRepo == nil {
			log.Printf("[MQTT] Warning: scheduleRepo is nil, cannot save schedule")
		} else if err := h.saveScheduleFromDevice(deviceSN, response.Data); err != nil {
			log.Printf("[MQTT] Failed to save schedule for %s: %v", deviceSN, err)
		} else {
			log.Printf("[MQTT] Successfully saved schedule from device %s", deviceSN)
		}
	}

	// Update company_device content with only the 'data' portion
	companyID, deviceID, err := h.updateDeviceContent(deviceSN, response.Data)
	if err != nil {
		log.Printf("[MQTT] Failed to update device content for %s: %v", deviceSN, err)
		return
	}

	log.Printf("[MQTT] Successfully updated content for device %s", deviceSN)

	// Broadcast to SSE clients
	event := DeviceUpdateEvent{
		DeviceSN:  deviceSN,
		CompanyID: companyID,
		DeviceID:  deviceID,
		Content:   response.Data,
		UpdatedAt: time.Now().Format(time.RFC3339),
	}
	h.broadcastToSSEClients(event)
}

// updateDeviceContent finds the company_device by device SN and updates its content
func (h *DeviceResponseHandler) updateDeviceContent(deviceSN string, newData []byte) (uint, uint, error) {
	// Find device by SN
	device, err := h.deviceRepo.FindBySN(deviceSN)
	if err != nil {
		return 0, 0, err
	}

	// Find company_device by device ID
	companyDevice, err := h.companyDeviceRepo.FindByDeviceID(device.ID)
	if err != nil {
		return 0, 0, err
	}

	// Parse existing content
	existingContent := make(map[string]interface{})
	if len(companyDevice.Content) > 0 {
		json.Unmarshal(companyDevice.Content, &existingContent)
	}

	// Parse new data (only the 'data' portion from the response)
	var newDataMap map[string]interface{}
	if err := json.Unmarshal(newData, &newDataMap); err != nil {
		return 0, 0, err
	}

	// Merge new data into existing content
	for k, v := range newDataMap {
		existingContent[k] = v
	}

	// Update metadata
	existingContent["last_sync_at"] = time.Now().Format(time.RFC3339)
	if version, ok := existingContent["version"].(float64); ok {
		existingContent["version"] = int(version) + 1
	} else {
		existingContent["version"] = 1
	}

	// Marshal and save
	mergedContent, err := json.Marshal(existingContent)
	if err != nil {
		return 0, 0, err
	}

	companyDevice.Content = mergedContent
	companyDevice.ModifyTime = time.Now()

	if err := h.companyDeviceRepo.Update(companyDevice); err != nil {
		return 0, 0, err
	}

	return companyDevice.CompanyID, companyDevice.DeviceID, nil
}

// DeviceScheduleResponse represents the schedule data from device
type DeviceScheduleResponse struct {
	ScheduleID string                        `json:"schedule_id"`
	Command    string                        `json:"command"`
	DailyRules map[string]*DeviceDailyRule   `json:"daily_rules"`
	Exceptions []string                      `json:"exceptions"`
	CreatedAt  string                        `json:"created_at"`
	UpdatedAt  string                        `json:"updated_at"`
}

// DeviceDailyRule represents a daily rule from device
type DeviceDailyRule struct {
	DayOfWeek string             `json:"day_of_week"`
	RunPeriod *DeviceTimePeriod  `json:"run_period"`
	Actions   []DeviceAction     `json:"actions"`
}

// DeviceTimePeriod represents a time period from device
type DeviceTimePeriod struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

// DeviceAction represents an action from device
type DeviceAction struct {
	Type string `json:"type"`
	Time string `json:"time"`
}

// saveScheduleFromDevice saves the schedule from device to database
func (h *DeviceResponseHandler) saveScheduleFromDevice(deviceSN string, data []byte) error {
	if h.scheduleRepo == nil {
		return nil // Schedule repo not configured, skip
	}

	// Parse schedule data
	var scheduleData DeviceScheduleResponse
	if err := json.Unmarshal(data, &scheduleData); err != nil {
		return err
	}

	// Find device by SN
	device, err := h.deviceRepo.FindBySN(deviceSN)
	if err != nil {
		return err
	}

	// Find company_device by device ID
	companyDevice, err := h.companyDeviceRepo.FindByDeviceID(device.ID)
	if err != nil {
		return err
	}

	// Build full schedule structure
	fullSchedule := &scheduleEntities.ScheduleWithRules{
		Schedule: &scheduleEntities.Schedule{
			CompanyDeviceID: companyDevice.ID,
			ScheduleID:      scheduleData.ScheduleID,
			Command:         scheduleData.Command,
			Version:         1,
			SyncStatus:      scheduleEntities.SyncStatusSynced,
			CreatedBy:       0, // From device
			CreatedAt:       time.Now(),
			ModifiedBy:      0,
			ModifiedAt:      time.Now(),
		},
		DailyRules: make(map[string]*scheduleEntities.DailyRuleWithDetails),
		Exceptions: scheduleData.Exceptions,
	}

	// Check if schedule already exists
	existing, _ := h.scheduleRepo.FindByCompanyDeviceID(companyDevice.ID)
	if existing != nil {
		fullSchedule.Schedule.ID = existing.ID
		fullSchedule.Schedule.Version = existing.Version + 1
		fullSchedule.Schedule.CreatedBy = existing.CreatedBy
		fullSchedule.Schedule.CreatedAt = existing.CreatedAt
	}

	// Convert daily rules
	for dayName, rule := range scheduleData.DailyRules {
		if rule == nil {
			continue
		}

		ruleDetails := &scheduleEntities.DailyRuleWithDetails{
			DailyRule: scheduleEntities.NewDailyRule(0, dayName),
		}

		// Convert time period
		if rule.RunPeriod != nil {
			ruleDetails.RunPeriod = scheduleEntities.NewTimePeriod(0, rule.RunPeriod.Start, rule.RunPeriod.End)
		}

		// Convert actions
		for _, action := range rule.Actions {
			ruleDetails.Actions = append(ruleDetails.Actions, scheduleEntities.NewAction(0, action.Type, action.Time))
		}

		fullSchedule.DailyRules[dayName] = ruleDetails
	}

	// Save to database
	return h.scheduleRepo.SaveFullSchedule(fullSchedule)
}
