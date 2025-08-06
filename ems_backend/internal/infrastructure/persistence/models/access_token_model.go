package models

import (
	"time"
)

const (
	TableNameAccessToken = "access_token"
)

type AccessTokenModel struct {
	ID           uint      `gorm:"primaryKey"`
	MemberID     uint      `gorm:"not null;index"`
	AccessToken  string    `gorm:"size:256"`
	RefreshToken string    `gorm:"uniqueIndex;size:256"`
	CreateID     uint      `gorm:"not null"`
	CreateTime   time.Time `gorm:"not null"`
	ModifyID     uint      `gorm:"not null"`
	ModifyTime   time.Time `gorm:"not null"`
}

// TableName 返回表名
func (AccessTokenModel) TableName() string {
	return TableNameAccessToken
}
