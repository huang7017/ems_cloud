package models

import "time"

type RoleModel struct {
	ID          uint      `gorm:"primaryKey"`
	Title       string    `gorm:"not null"`
	Description string    `gorm:"null"`
	Sort        int       `gorm:"null"`
	IsEnable    bool      `gorm:"not null"`
	CreateID    uint      `gorm:"not null"`
	CreateTime  time.Time `gorm:"not null"`
	ModifyID    uint      `gorm:"not null"`
	ModifyTime  time.Time `gorm:"not null"`
}

func (RoleModel) TableName() string {
	return "role"
}
