package entities

import "time"

type Meter struct {
	ID        uint
	Timestamp time.Time
	MeterID   string
	KWh       float64
	KW        float64
}
