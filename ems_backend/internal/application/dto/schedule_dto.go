package dto

import (
	"ems_backend/internal/domain/schedule/entities"
	"time"
)

// ============================================
// Request DTOs (matches ems_vrv MQTT format)
// ============================================

// ScheduleRequest - 排程請求 (matches ems_vrv)
type ScheduleRequest struct {
	CompanyDeviceID uint                          `json:"company_device_id" binding:"required"`
	Command         string                        `json:"command"` // typically "schedule"
	Data            map[string]*DailyRuleRequest  `json:"data"`    // Keyed by day name (Monday-Sunday)
	Exceptions      []string                      `json:"exceptions,omitempty"` // YYYY-MM-DD format
}

// DailyRuleRequest - 每日規則請求
type DailyRuleRequest struct {
	RunPeriod *TimePeriodRequest `json:"runPeriod,omitempty"`
	Actions   []*ActionRequest   `json:"actions,omitempty"`
}

// TimePeriodRequest - 時段請求
type TimePeriodRequest struct {
	Start string `json:"start" binding:"required"` // HH:MM
	End   string `json:"end" binding:"required"`   // HH:MM
}

// ActionRequest - 動作請求
type ActionRequest struct {
	Type string `json:"type" binding:"required"` // closeOnce, skip, forceCloseAfter
	Time string `json:"time,omitempty"`          // HH:MM (optional for "skip")
}

// ============================================
// Response DTOs
// ============================================

// ScheduleResponse - 排程響應
type ScheduleResponse struct {
	ID              uint                          `json:"id"`
	CompanyDeviceID uint                          `json:"company_device_id"`
	ScheduleID      string                        `json:"schedule_id"`
	Command         string                        `json:"command"`
	DailyRules      map[string]*DailyRuleResponse `json:"daily_rules"`
	Exceptions      []string                      `json:"exceptions"`
	Version         int                           `json:"version"`
	SyncStatus      string                        `json:"sync_status"`
	SyncedAt        *string                       `json:"synced_at,omitempty"`
	CreatedAt       string                        `json:"created_at"`
	UpdatedAt       string                        `json:"updated_at"`
}

// DailyRuleResponse - 每日規則響應
type DailyRuleResponse struct {
	ID        uint                `json:"id"`
	DayOfWeek string              `json:"day_of_week"`
	RunPeriod *TimePeriodResponse `json:"run_period,omitempty"`
	Actions   []*ActionResponse   `json:"actions"`
	CreatedAt string              `json:"created_at"`
	UpdatedAt string              `json:"updated_at"`
}

// TimePeriodResponse - 時段響應
type TimePeriodResponse struct {
	ID        uint   `json:"id"`
	Start     string `json:"start"`
	End       string `json:"end"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// ActionResponse - 動作響應
type ActionResponse struct {
	ID          uint   `json:"id"`
	Type        string `json:"type"`
	Time        string `json:"time,omitempty"`
	Description string `json:"description"` // Chinese description
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

// ============================================
// Conversion functions
// ============================================

// ToScheduleResponse - 轉換完整排程為響應
func ToScheduleResponse(fullSchedule *entities.ScheduleWithRules) *ScheduleResponse {
	if fullSchedule == nil || fullSchedule.Schedule == nil {
		return nil
	}

	resp := &ScheduleResponse{
		ID:              fullSchedule.Schedule.ID,
		CompanyDeviceID: fullSchedule.Schedule.CompanyDeviceID,
		ScheduleID:      fullSchedule.Schedule.ScheduleID,
		Command:         fullSchedule.Schedule.Command,
		DailyRules:      make(map[string]*DailyRuleResponse),
		Exceptions:      fullSchedule.Exceptions,
		Version:         fullSchedule.Schedule.Version,
		SyncStatus:      fullSchedule.Schedule.SyncStatus,
		CreatedAt:       fullSchedule.Schedule.CreatedAt.Format(time.RFC3339),
		UpdatedAt:       fullSchedule.Schedule.ModifiedAt.Format(time.RFC3339),
	}

	if fullSchedule.Schedule.SyncedAt != nil {
		formatted := fullSchedule.Schedule.SyncedAt.Format(time.RFC3339)
		resp.SyncedAt = &formatted
	}

	// Convert daily rules
	for dayName, ruleDetails := range fullSchedule.DailyRules {
		ruleResp := &DailyRuleResponse{
			ID:        ruleDetails.DailyRule.ID,
			DayOfWeek: ruleDetails.DailyRule.DayOfWeek,
			Actions:   make([]*ActionResponse, 0),
			CreatedAt: ruleDetails.DailyRule.CreatedAt.Format(time.RFC3339),
			UpdatedAt: ruleDetails.DailyRule.UpdatedAt.Format(time.RFC3339),
		}

		// Convert time period
		if ruleDetails.RunPeriod != nil {
			ruleResp.RunPeriod = &TimePeriodResponse{
				ID:        ruleDetails.RunPeriod.ID,
				Start:     ruleDetails.RunPeriod.Start,
				End:       ruleDetails.RunPeriod.End,
				CreatedAt: ruleDetails.RunPeriod.CreatedAt.Format(time.RFC3339),
				UpdatedAt: ruleDetails.RunPeriod.UpdatedAt.Format(time.RFC3339),
			}
		}

		// Convert actions
		for _, action := range ruleDetails.Actions {
			actionResp := &ActionResponse{
				ID:          action.ID,
				Type:        action.Type,
				Time:        action.Time,
				Description: getActionDescription(action.Type),
				CreatedAt:   action.CreatedAt.Format(time.RFC3339),
				UpdatedAt:   action.UpdatedAt.Format(time.RFC3339),
			}
			ruleResp.Actions = append(ruleResp.Actions, actionResp)
		}

		resp.DailyRules[dayName] = ruleResp
	}

	return resp
}

// RequestToFullSchedule - 轉換請求為完整排程實體
func RequestToFullSchedule(req *ScheduleRequest, scheduleID string, memberID uint) *entities.ScheduleWithRules {
	schedule := entities.NewSchedule(req.CompanyDeviceID, scheduleID, memberID)
	if req.Command != "" {
		schedule.Command = req.Command
	}

	fullSchedule := &entities.ScheduleWithRules{
		Schedule:   schedule,
		DailyRules: make(map[string]*entities.DailyRuleWithDetails),
		Exceptions: req.Exceptions,
	}

	// Convert daily rules
	for dayName, ruleReq := range req.Data {
		if ruleReq == nil {
			continue
		}

		if !entities.IsValidDayOfWeek(dayName) {
			continue
		}

		ruleDetails := &entities.DailyRuleWithDetails{
			DailyRule: entities.NewDailyRule(0, dayName), // ScheduleID will be set later
		}

		// Convert time period
		if ruleReq.RunPeriod != nil {
			ruleDetails.RunPeriod = entities.NewTimePeriod(0, ruleReq.RunPeriod.Start, ruleReq.RunPeriod.End)
		}

		// Convert actions
		for _, actionReq := range ruleReq.Actions {
			if !entities.IsValidActionType(actionReq.Type) {
				continue
			}
			action := entities.NewAction(0, actionReq.Type, actionReq.Time)
			ruleDetails.Actions = append(ruleDetails.Actions, action)
		}

		fullSchedule.DailyRules[dayName] = ruleDetails
	}

	return fullSchedule
}

// getActionDescription - 獲取動作描述
func getActionDescription(actionType string) string {
	switch actionType {
	case entities.ActionTypeCloseOnce:
		return "單次關閉"
	case entities.ActionTypeSkip:
		return "跳過當日"
	case entities.ActionTypeForceCloseAfter:
		return "時間後強制關閉"
	default:
		return actionType
	}
}
