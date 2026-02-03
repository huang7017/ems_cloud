package dto

import "time"

// AuditLogResponse 審計日誌響應
type AuditLogResponse struct {
	ID           uint                   `json:"id"`
	MemberID     uint                   `json:"member_id"`
	RoleID       uint                   `json:"role_id"`
	Action       string                 `json:"action"`
	ResourceType string                 `json:"resource_type"`
	ResourceID   *uint                  `json:"resource_id"`
	Details      map[string]interface{} `json:"details"`
	IPAddress    string                 `json:"ip_address"`
	UserAgent    string                 `json:"user_agent"`
	Status       string                 `json:"status"`
	ErrorMessage string                 `json:"error_message"`
	CreateTime   time.Time              `json:"create_time"`
}

// AuditLogQueryRequest 審計日誌查詢請求
type AuditLogQueryRequest struct {
	MemberID     *uint     `json:"member_id" form:"member_id"`
	RoleID       *uint     `json:"role_id" form:"role_id"`
	Action       string    `json:"action" form:"action"`
	ResourceType string    `json:"resource_type" form:"resource_type"`
	Status       string    `json:"status" form:"status"`
	StartTime    time.Time `json:"start_time" form:"start_time"`
	EndTime      time.Time `json:"end_time" form:"end_time"`
	Limit        int       `json:"limit" form:"limit"`
	Offset       int       `json:"offset" form:"offset"`
}

// AuditLogListResponse 審計日誌列表響應
type AuditLogListResponse struct {
	Total int64               `json:"total"`
	Logs  []AuditLogResponse  `json:"logs"`
}
