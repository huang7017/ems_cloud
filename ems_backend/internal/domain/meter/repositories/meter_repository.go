package repositories

import (
	"ems_backend/internal/domain/meter/entities"
	"time"
)

type MeterRepository interface {
	Save(meter *entities.Meter) error
	Update(meter *entities.Meter) error
	Delete(id uint) error
	GetByMeterID(meterID string) (*entities.Meter, error)
	GetLatestByMeterID(meterID string) (*entities.Meter, error)
	GetByMeterIDAndTimeRange(meterID string, startTime, endTime time.Time) ([]*entities.Meter, error)
	GetByMeterIDsAndTimeRange(meterIDs []string, startTime, endTime time.Time) ([]*entities.Meter, error)
}
