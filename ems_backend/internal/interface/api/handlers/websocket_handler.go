package handlers

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"ems_backend/internal/infrastructure/websocket"

	"github.com/gin-gonic/gin"
	ws "github.com/gorilla/websocket"
	"github.com/google/uuid"
)

var upgrader = ws.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // 允許所有來源（生產環境應該限制）
	},
}

// WebSocketHandler handles WebSocket connections
type WebSocketHandler struct{}

// NewWebSocketHandler creates a new WebSocket handler
func NewWebSocketHandler() *WebSocketHandler {
	return &WebSocketHandler{}
}

// Dashboard handles WebSocket connections for dashboard real-time updates
// GET /ws/dashboard?company_id=1
func (h *WebSocketHandler) Dashboard(c *gin.Context) {
	log.Printf("[WebSocket] Dashboard request from %s, Headers: Upgrade=%s, Connection=%s",
		c.ClientIP(), c.GetHeader("Upgrade"), c.GetHeader("Connection"))

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

	log.Printf("[WebSocket] Attempting upgrade for member %d, company %d", memberID, companyID)

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[WebSocket] Failed to upgrade connection: %v", err)
		// Don't send JSON response here - upgrader already handled the error response
		return
	}

	// Create client
	clientID := uuid.New().String()
	client := &websocket.Client{
		ID:        clientID,
		MemberID:  memberID,
		CompanyID: companyID,
		Conn:      conn,
		Send:      make(chan []byte, 256),
	}

	// Register client with hub
	hub := websocket.GetHub()
	hub.Register(client)

	log.Printf("[WebSocket] Client %s connected (member: %d, company: %d)", clientID, memberID, companyID)

	// Start goroutines for reading and writing
	go h.writePump(client, hub)
	go h.readPump(client, hub)
}

// writePump pumps messages from the hub to the WebSocket connection
func (h *WebSocketHandler) writePump(client *websocket.Client, hub *websocket.Hub) {
	ticker := time.NewTicker(30 * time.Second) // Ping interval
	defer func() {
		ticker.Stop()
		client.Conn.Close()
		hub.Unregister(client)
	}()

	for {
		select {
		case message, ok := <-client.Send:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				// Hub closed the channel
				client.Conn.WriteMessage(ws.CloseMessage, []byte{})
				return
			}

			if err := client.Conn.WriteMessage(ws.TextMessage, message); err != nil {
				log.Printf("[WebSocket] Write error for client %s: %v", client.ID, err)
				return
			}

		case <-ticker.C:
			client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := client.Conn.WriteMessage(ws.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// readPump pumps messages from the WebSocket connection to the hub
func (h *WebSocketHandler) readPump(client *websocket.Client, hub *websocket.Hub) {
	defer func() {
		hub.Unregister(client)
		client.Conn.Close()
	}()

	client.Conn.SetReadLimit(512)
	client.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	client.Conn.SetPongHandler(func(string) error {
		client.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, _, err := client.Conn.ReadMessage()
		if err != nil {
			if ws.IsUnexpectedCloseError(err, ws.CloseGoingAway, ws.CloseAbnormalClosure) {
				log.Printf("[WebSocket] Read error for client %s: %v", client.ID, err)
			}
			break
		}
		// We don't process incoming messages for now, just keep connection alive
	}
}
