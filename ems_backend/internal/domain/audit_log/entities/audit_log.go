package entities

import "time"

// AuditLog - 審計日誌
type AuditLog struct {
	ID           uint                   `json:"id"`
	MemberID     uint                   `json:"member_id"`
	RoleID       uint                   `json:"role_id"`
	Action       string                 `json:"action"`        // CREATE, UPDATE, DELETE, LOGIN, LOGOUT等
	ResourceType string                 `json:"resource_type"` // MENU, ROLE, POWER, USER等
	ResourceID   *uint                  `json:"resource_id"`   // 受影響資源的ID（可為空）
	Details      map[string]interface{} `json:"details"`       // 額外的上下文信息
	IPAddress    string                 `json:"ip_address"`
	UserAgent    string                 `json:"user_agent"`
	Status       string                 `json:"status"`        // SUCCESS 或 FAILURE
	ErrorMessage string                 `json:"error_message"` // 如果失敗，記錄錯誤信息
	CreateTime   time.Time              `json:"create_time"`
}

// AuditLogFilter - 審計日誌查詢過濾器
type AuditLogFilter struct {
	MemberID     *uint     `json:"member_id"`
	RoleID       *uint     `json:"role_id"`
	Action       string    `json:"action"`
	ResourceType string    `json:"resource_type"`
	Status       string    `json:"status"`
	StartTime    time.Time `json:"start_time"`
	EndTime      time.Time `json:"end_time"`
	Limit        int       `json:"limit"`
	Offset       int       `json:"offset"`
}
