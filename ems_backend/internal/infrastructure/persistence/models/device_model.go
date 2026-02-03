package models

import (
	"time"

	"ems_backend/internal/domain/device/entities"
)

// DeviceModel 設備數據模型
type DeviceModel struct {
	ID         uint      `gorm:"column:id;primaryKey;autoIncrement"`
	SN         string    `gorm:"column:sn;type:varchar(256);not null"`
	CreateID   uint      `gorm:"column:create_id;not null"`
	CreateTime time.Time `gorm:"column:create_time;not null"`
	ModifyID   uint      `gorm:"column:modify_id;not null"`
	ModifyTime time.Time `gorm:"column:modify_time;not null"`
}

// TableName 返回表名
func (DeviceModel) TableName() string {
	return "device"
}

// ToEntity 轉換為領域實體
func (m *DeviceModel) ToEntity() *entities.Device {
	return &entities.Device{
		ID:         m.ID,
		SN:         m.SN,
		CreateID:   m.CreateID,
		CreateTime: m.CreateTime,
		ModifyID:   m.ModifyID,
		ModifyTime: m.ModifyTime,
	}
}

// FromEntity 從領域實體創建模型
func DeviceModelFromEntity(e *entities.Device) *DeviceModel {
	return &DeviceModel{
		ID:         e.ID,
		SN:         e.SN,
		CreateID:   e.CreateID,
		CreateTime: e.CreateTime,
		ModifyID:   e.ModifyID,
		ModifyTime: e.ModifyTime,
	}
}
