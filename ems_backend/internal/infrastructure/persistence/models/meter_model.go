package models

import "time"

type MeterModel struct {
	ID        uint      `gorm:"primaryKey"`
	Timestamp time.Time `gorm:"column:timestamp"`
	MeterID   string    `gorm:"column:meter_id"`
	KWh       float64   `gorm:"column:k_wh"`
	KW        float64   `gorm:"column:kw"`
}

func (MeterModel) TableName() string {
	return "meters"
}
