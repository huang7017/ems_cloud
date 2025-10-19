package models

import "time"

type MeterModel struct {
	ID        uint
	Timestamp time.Time
	MeterID   string
	KWh       float64
	KW        float64
}

func (MeterModel) TableName() string {
	return "meters"
}
