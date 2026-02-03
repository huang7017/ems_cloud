package models

import "time"

type TemperatureModel struct {
	ID            uint      `gorm:"primaryKey"`
	Timestamp     time.Time `gorm:"column:timestamp"`
	TemperatureID string    `gorm:"column:temperature_id"`
	Temperature   float64   `gorm:"column:temperature"`
	Humidity      float64   `gorm:"column:humidity"`
}

func (TemperatureModel) TableName() string {
	return "temperatures"
}
