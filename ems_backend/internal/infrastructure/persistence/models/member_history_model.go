package models

import (
	"time"
)

const (
	TableNameMemberHistory = "member_history"
)

type MemberHistoryModel struct {
	ID         uint      `gorm:"primaryKey"`
	MemberID   uint      `gorm:"not null"`
	Salt       string    `gorm:"not null"`
	Hash       string    `gorm:"not null"`
	ErrorCount int       `gorm:"not null"`
	CreateID   uint      `gorm:"not null"`
	CreateTime time.Time `gorm:"not null"`
	ModifyID   uint      `gorm:"not null"`
	ModifyTime time.Time `gorm:"not null"`
}

func (MemberHistoryModel) TableName() string {
	return TableNameMemberHistory
}
