package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"ems_backend/internal/infrastructure/mqtt"
	"ems_backend/internal/infrastructure/sse"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// SSEHandler handles Server-Sent Events for real-time updates
type SSEHandler struct{}

// NewSSEHandler creates a new SSE handler
func NewSSEHandler() *SSEHandler {
	return &SSEHandler{}
}

// Dashboard handles SSE connections for dashboard real-time updates (AC status, temperature, meter)
// GET /sse/dashboard?company_id=1
func (h *SSEHandler) Dashboard(c *gin.Context) {
	// Get member ID from context
	memberIDValue, _ := c.Get("member_id")
	memberID, _ := memberIDValue.(uint)

	// Get company ID filter (optional)
	companyIDStr := c.Query("company_id")
	var companyID uint
	if companyIDStr != "" {
		id, err := strconv.ParseUint(companyIDStr, 10, 32)
		if err == nil {
			companyID = uint(id)
		}
	}

	// Set SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("X-Accel-Buffering", "no")

	// Create SSE client
	clientID := uuid.New().String()
	client := &sse.Client{
		ID:        clientID,
		MemberID:  memberID,
		CompanyID: companyID,
		Channel:   make(chan []byte, 50),
	}

	// Register client with hub
	hub := sse.GetHub()
	hub.Register(client)

	// Ensure cleanup on disconnect
	defer hub.Unregister(clientID)

	// Get the underlying response writer
	w := c.Writer

	// Send initial connection message
	fmt.Fprintf(w, "event: connected\ndata: {\"client_id\":\"%s\",\"company_id\":%d}\n\n", clientID, companyID)
	w.Flush()

	log.Printf("[SSE Dashboard] Client %s connected (member: %d, company: %d)", clientID, memberID, companyID)

	// Listen for events or client disconnect
	clientGone := c.Request.Context().Done()
	for {
		select {
		case <-clientGone:
			log.Printf("[SSE Dashboard] Client %s disconnected", clientID)
			return
		case data, ok := <-client.Channel:
			if !ok {
				return
			}
			// Parse event to get type
			var event sse.Event
			if err := json.Unmarshal(data, &event); err == nil {
				fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event.Type, string(data))
			} else {
				fmt.Fprintf(w, "event: message\ndata: %s\n\n", string(data))
			}
			w.Flush()
		}
	}
}

// DeviceUpdates handles SSE connections for device content updates
// GET /sse/devices?company_id=1
func (h *SSEHandler) DeviceUpdates(c *gin.Context) {
	// Get company ID filter (optional)
	companyIDStr := c.Query("company_id")
	var companyID uint
	if companyIDStr != "" {
		id, err := strconv.ParseUint(companyIDStr, 10, 32)
		if err == nil {
			companyID = uint(id)
		}
	}

	// Get the global device response handler
	handler := mqtt.GetGlobalHandler()
	if handler == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"success": false,
			"error":   "SSE not available - MQTT not configured",
		})
		return
	}

	// Set SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("X-Accel-Buffering", "no") // Disable nginx buffering

	// Create SSE client
	clientID := uuid.New().String()
	client := &mqtt.SSEClient{
		ID:        clientID,
		Channel:   make(chan mqtt.DeviceUpdateEvent, 10),
		CompanyID: companyID,
	}

	// Register client
	handler.RegisterSSEClient(client)

	// Ensure cleanup on disconnect
	defer handler.UnregisterSSEClient(clientID)

	// Get the underlying response writer for flushing
	w := c.Writer

	// Send initial connection message
	fmt.Fprintf(w, "event: connected\ndata: {\"client_id\":\"%s\"}\n\n", clientID)
	w.Flush()

	log.Printf("[SSE] Client %s connected (company: %d)", clientID, companyID)

	// Listen for events or client disconnect
	clientGone := c.Request.Context().Done()
	for {
		select {
		case <-clientGone:
			log.Printf("[SSE] Client %s disconnected", clientID)
			return
		case event, ok := <-client.Channel:
			if !ok {
				return
			}
			// Send event
			data := fmt.Sprintf(`{"device_sn":"%s","company_id":%d,"device_id":%d,"updated_at":"%s"}`,
				event.DeviceSN, event.CompanyID, event.DeviceID, event.UpdatedAt)
			fmt.Fprintf(w, "event: device_update\ndata: %s\n\n", data)
			w.Flush()
		}
	}
}
