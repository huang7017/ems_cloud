package entities

import "time"

type Temperature struct {
	ID            uint
	Timestamp     time.Time
	TemperatureID string
	Temperature   float64
	Humidity      float64
}
