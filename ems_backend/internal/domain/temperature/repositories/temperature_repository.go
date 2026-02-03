package repositories

import (
	"ems_backend/internal/domain/temperature/entities"
	"time"
)

type TemperatureRepository interface {
	Save(temperature *entities.Temperature) error
	Update(temperature *entities.Temperature) error
	Delete(id uint) error
	GetByTemperatureID(temperatureID string) (*entities.Temperature, error)
	GetLatestByTemperatureID(temperatureID string) (*entities.Temperature, error)
	GetLatestByTemperatureIDs(temperatureIDs []string) (map[string]*entities.Temperature, error)
	GetByTemperatureIDAndTimeRange(temperatureID string, startTime, endTime time.Time) ([]*entities.Temperature, error)
	GetByTemperatureIDsAndTimeRange(temperatureIDs []string, startTime, endTime time.Time) ([]*entities.Temperature, error)
}
