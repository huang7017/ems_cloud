package models

import "time"

type RolePowerModel struct {
	ID         uint      `gorm:"primaryKey"`
	RoleID     uint      `gorm:"not null"`
	MenuID     uint      `gorm:"not null"`
	PowerID    *uint     `gorm:"null"` // 可為空，表示只有菜單權限
	CreateID   uint      `gorm:"not null"`
	CreateTime time.Time `gorm:"not null"`
	ModifyID   uint      `gorm:"not null"`
	ModifyTime time.Time `gorm:"not null"`
}

func (RolePowerModel) TableName() string {
	return "role_power"
}
