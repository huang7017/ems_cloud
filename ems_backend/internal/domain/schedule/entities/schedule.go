package entities

import (
	"time"
)

// Schedule - 排程實體 (matches ems_vrv schedule format)
type Schedule struct {
	ID              uint
	CompanyDeviceID uint
	ScheduleID      string // UUID for sync
	Command         string // typically "schedule"
	Version         int
	SyncStatus      string // pending, synced, failed
	SyncedAt        *time.Time
	CreatedBy       uint
	CreatedAt       time.Time
	ModifiedBy      uint
	ModifiedAt      time.Time
}

// DailyRule - 每日排程規則
type DailyRule struct {
	ID         uint
	ScheduleID uint
	DayOfWeek  string // Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// TimePeriod - 運行時段 (效率模式)
type TimePeriod struct {
	ID          uint
	DailyRuleID uint
	Start       string // HH:MM format
	End         string // HH:MM format
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// Action - 排程動作
type Action struct {
	ID          uint
	DailyRuleID uint
	Type        string // closeOnce, skip, forceCloseAfter
	Time        string // HH:MM format (optional for "skip")
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// ScheduleException - 排程例外日期
type ScheduleException struct {
	ID         uint
	ScheduleID uint
	Date       string // YYYY-MM-DD format
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// ScheduleWithRules - 完整排程資料 (含所有關聯)
type ScheduleWithRules struct {
	Schedule   *Schedule
	DailyRules map[string]*DailyRuleWithDetails // Keyed by day name
	Exceptions []string
}

// DailyRuleWithDetails - 完整每日規則 (含時段和動作)
type DailyRuleWithDetails struct {
	DailyRule *DailyRule
	RunPeriod *TimePeriod
	Actions   []*Action
}

// SyncStatus constants
const (
	SyncStatusPending = "pending"
	SyncStatusSynced  = "synced"
	SyncStatusFailed  = "failed"
)

// ActionType constants (matches ems_vrv)
const (
	ActionTypeCloseOnce       = "closeOnce"
	ActionTypeSkip            = "skip"
	ActionTypeForceCloseAfter = "forceCloseAfter"
)

// DayOfWeek valid values
var ValidDaysOfWeek = []string{
	"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
}

// NewSchedule - 創建新排程
func NewSchedule(companyDeviceID uint, scheduleID string, createdBy uint) *Schedule {
	now := time.Now()
	return &Schedule{
		CompanyDeviceID: companyDeviceID,
		ScheduleID:      scheduleID,
		Command:         "schedule",
		Version:         1,
		SyncStatus:      SyncStatusPending,
		CreatedBy:       createdBy,
		CreatedAt:       now,
		ModifiedBy:      createdBy,
		ModifiedAt:      now,
	}
}

// NewDailyRule - 創建每日規則
func NewDailyRule(scheduleID uint, dayOfWeek string) *DailyRule {
	now := time.Now()
	return &DailyRule{
		ScheduleID: scheduleID,
		DayOfWeek:  dayOfWeek,
		CreatedAt:  now,
		UpdatedAt:  now,
	}
}

// NewTimePeriod - 創建時段
func NewTimePeriod(dailyRuleID uint, start, end string) *TimePeriod {
	now := time.Now()
	return &TimePeriod{
		DailyRuleID: dailyRuleID,
		Start:       start,
		End:         end,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// NewAction - 創建動作
func NewAction(dailyRuleID uint, actionType, actionTime string) *Action {
	now := time.Now()
	return &Action{
		DailyRuleID: dailyRuleID,
		Type:        actionType,
		Time:        actionTime,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// NewScheduleException - 創建例外日期
func NewScheduleException(scheduleID uint, date string) *ScheduleException {
	now := time.Now()
	return &ScheduleException{
		ScheduleID: scheduleID,
		Date:       date,
		CreatedAt:  now,
		UpdatedAt:  now,
	}
}

// MarkSynced - 標記為已同步
func (s *Schedule) MarkSynced() {
	now := time.Now()
	s.SyncStatus = SyncStatusSynced
	s.SyncedAt = &now
}

// MarkFailed - 標記為同步失敗
func (s *Schedule) MarkFailed() {
	s.SyncStatus = SyncStatusFailed
}

// IncrementVersion - 增加版本號
func (s *Schedule) IncrementVersion() {
	s.Version++
	s.SyncStatus = SyncStatusPending
}

// IsValidDayOfWeek - 驗證星期幾
func IsValidDayOfWeek(day string) bool {
	for _, valid := range ValidDaysOfWeek {
		if valid == day {
			return true
		}
	}
	return false
}

// IsValidActionType - 驗證動作類型
func IsValidActionType(actionType string) bool {
	return actionType == ActionTypeCloseOnce ||
		actionType == ActionTypeSkip ||
		actionType == ActionTypeForceCloseAfter
}
