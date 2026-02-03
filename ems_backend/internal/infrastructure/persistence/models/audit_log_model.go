package models

import (
	"time"
)

type AuditLogModel struct {
	ID           uint      `gorm:"primaryKey"`
	MemberID     uint      `gorm:"not null"`
	RoleID       uint      `gorm:"not null"`
	Action       string    `gorm:"not null;size:64"`
	ResourceType string    `gorm:"not null;size:64"`
	ResourceID   *uint     `gorm:"null"`
	Details      JSONB     `gorm:"type:jsonb"`
	IPAddress    string    `gorm:"size:45"`
	UserAgent    string    `gorm:"size:512"`
	Status       string    `gorm:"not null;size:32"`
	ErrorMessage string    `gorm:"type:text"`
	CreateTime   time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}

func (AuditLogModel) TableName() string {
	return "audit_log"
}
