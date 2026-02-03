package models

import (
	"time"
)

// ScheduleModel - 排程資料庫模型 (matches ems_vrv)
type ScheduleModel struct {
	ID              uint       `gorm:"primaryKey"`
	CompanyDeviceID uint       `gorm:"not null;uniqueIndex"`
	ScheduleID      string     `gorm:"type:varchar(64);not null;uniqueIndex:idx_schedule_uuid"`
	Command         string     `gorm:"type:varchar(32);default:'schedule'"`
	Version         int        `gorm:"default:1"`
	SyncStatus      string     `gorm:"type:varchar(32);default:'pending'"`
	SyncedAt        *time.Time `gorm:"type:timestamp"`
	CreatedBy       uint       `gorm:"not null"`
	CreatedAt       time.Time  `gorm:"not null"`
	ModifiedBy      uint       `gorm:"not null"`
	ModifiedAt      time.Time  `gorm:"not null"`
}

func (ScheduleModel) TableName() string {
	return "schedules"
}

// DailyRuleModel - 每日規則資料庫模型
type DailyRuleModel struct {
	ID         uint      `gorm:"primaryKey"`
	ScheduleID uint      `gorm:"not null;index"`
	DayOfWeek  string    `gorm:"type:varchar(16);not null"` // Monday, Tuesday, etc.
	CreatedAt  time.Time `gorm:"not null"`
	UpdatedAt  time.Time `gorm:"not null"`
}

func (DailyRuleModel) TableName() string {
	return "daily_rules"
}

// TimePeriodModel - 時段資料庫模型
type TimePeriodModel struct {
	ID          uint      `gorm:"primaryKey"`
	DailyRuleID uint      `gorm:"not null;uniqueIndex"` // One period per rule
	Start       string    `gorm:"type:varchar(8);not null"` // HH:MM
	End         string    `gorm:"type:varchar(8);not null"` // HH:MM
	CreatedAt   time.Time `gorm:"not null"`
	UpdatedAt   time.Time `gorm:"not null"`
}

func (TimePeriodModel) TableName() string {
	return "time_periods"
}

// ActionModel - 動作資料庫模型
type ActionModel struct {
	ID          uint      `gorm:"primaryKey"`
	DailyRuleID uint      `gorm:"not null;index"`
	Type        string    `gorm:"type:varchar(32);not null"` // closeOnce, skip, forceCloseAfter
	Time        string    `gorm:"type:varchar(8)"`           // HH:MM (optional for "skip")
	CreatedAt   time.Time `gorm:"not null"`
	UpdatedAt   time.Time `gorm:"not null"`
}

func (ActionModel) TableName() string {
	return "actions"
}

// ScheduleExceptionModel - 例外日期資料庫模型
type ScheduleExceptionModel struct {
	ID         uint      `gorm:"primaryKey"`
	ScheduleID uint      `gorm:"not null;index"`
	Date       string    `gorm:"type:varchar(16);not null"` // YYYY-MM-DD
	CreatedAt  time.Time `gorm:"not null"`
	UpdatedAt  time.Time `gorm:"not null"`
}

func (ScheduleExceptionModel) TableName() string {
	return "schedule_exceptions"
}
