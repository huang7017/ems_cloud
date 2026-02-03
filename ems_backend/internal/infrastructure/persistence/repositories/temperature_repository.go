package repositories

import (
	"ems_backend/internal/domain/temperature/entities"
	"ems_backend/internal/domain/temperature/repositories"
	"ems_backend/internal/infrastructure/persistence/models"
	"time"

	"gorm.io/gorm"
)

type TemperatureRepository struct {
	db *gorm.DB
}

func NewTemperatureRepository(db *gorm.DB) repositories.TemperatureRepository {
	return &TemperatureRepository{db: db}
}

func (r *TemperatureRepository) Save(temperature *entities.Temperature) error {
	return r.db.Create(temperature).Error
}

func (r *TemperatureRepository) Update(temperature *entities.Temperature) error {
	return r.db.Save(temperature).Error
}

func (r *TemperatureRepository) Delete(id uint) error {
	return r.db.Delete(&models.TemperatureModel{}, id).Error
}

func (r *TemperatureRepository) GetByTemperatureID(temperatureID string) (*entities.Temperature, error) {
	var model models.TemperatureModel
	if err := r.db.Where("temperature_id = ?", temperatureID).First(&model).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(&model)
}

func (r *TemperatureRepository) GetLatestByTemperatureID(temperatureID string) (*entities.Temperature, error) {
	var model models.TemperatureModel
	if err := r.db.Where("temperature_id = ?", temperatureID).Order("timestamp DESC").First(&model).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(&model)
}

// GetLatestByTemperatureIDs - 批量獲取多個感測器的最新數據（使用 DISTINCT ON 優化）
func (r *TemperatureRepository) GetLatestByTemperatureIDs(temperatureIDs []string) (map[string]*entities.Temperature, error) {
	if len(temperatureIDs) == 0 {
		return make(map[string]*entities.Temperature), nil
	}

	var modelList []models.TemperatureModel
	// 使用 PostgreSQL 的 DISTINCT ON 語法，一次查詢獲取所有感測器的最新數據
	err := r.db.Raw(`
		SELECT DISTINCT ON (temperature_id) *
		FROM temperatures
		WHERE temperature_id IN ?
		ORDER BY temperature_id, timestamp DESC
	`, temperatureIDs).Scan(&modelList).Error

	if err != nil {
		return nil, err
	}

	result := make(map[string]*entities.Temperature, len(modelList))
	for _, model := range modelList {
		temp, err := r.mapToDomain(&model)
		if err != nil {
			continue
		}
		result[model.TemperatureID] = temp
	}

	return result, nil
}

func (r *TemperatureRepository) GetByTemperatureIDAndTimeRange(temperatureID string, startTime, endTime time.Time) ([]*entities.Temperature, error) {
	var models []models.TemperatureModel
	if err := r.db.Where("temperature_id = ? AND timestamp >= ? AND timestamp <= ?", temperatureID, startTime, endTime).
		Order("timestamp ASC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	temperatures := make([]*entities.Temperature, 0, len(models))
	for _, model := range models {
		temp, err := r.mapToDomain(&model)
		if err != nil {
			return nil, err
		}
		temperatures = append(temperatures, temp)
	}
	return temperatures, nil
}

func (r *TemperatureRepository) GetByTemperatureIDsAndTimeRange(temperatureIDs []string, startTime, endTime time.Time) ([]*entities.Temperature, error) {
	var models []models.TemperatureModel
	if err := r.db.Where("temperature_id IN ? AND timestamp >= ? AND timestamp <= ?", temperatureIDs, startTime, endTime).
		Order("timestamp ASC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	temperatures := make([]*entities.Temperature, 0, len(models))
	for _, model := range models {
		temp, err := r.mapToDomain(&model)
		if err != nil {
			return nil, err
		}
		temperatures = append(temperatures, temp)
	}
	return temperatures, nil
}

func (r *TemperatureRepository) mapToDomain(model *models.TemperatureModel) (*entities.Temperature, error) {
	return &entities.Temperature{
		ID:            model.ID,
		Timestamp:     model.Timestamp,
		TemperatureID: model.TemperatureID,
		Temperature:   model.Temperature,
		Humidity:      model.Humidity,
	}, nil
}
