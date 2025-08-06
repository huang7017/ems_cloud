package models

import (
	"time"
)

const (
	TableNameMember = "members"
)

type MemberModel struct {
	ID         uint      `gorm:"primaryKey"`
	Name       string    `gorm:"size:128;not null"`
	Email      string    `gorm:"size:128;not null"`
	Image      string    `gorm:"size:256"`
	Phone      string    `gorm:"size:16"`
	IsEnable   bool      `gorm:"not null"`
	CreateID   uint      `gorm:"not null"`
	CreateTime time.Time `gorm:"not null"`
	ModifyID   uint      `gorm:"not null"`
	ModifyTime time.Time `gorm:"not null"`
}

// TableName 返回表名
func (MemberModel) TableName() string {
	return TableNameMember
}
