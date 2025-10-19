package models

import "time"

type TemperatureModel struct {
	ID            uint
	Timestamp     time.Time
	TemperatureID string
	Temperature   float64
	Humidity      float64
}

func (TemperatureModel) TableName() string {
	return "temperatures"
}
