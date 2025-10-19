package repositories

import (
	"ems_backend/internal/domain/meter/entities"
	"ems_backend/internal/domain/meter/repositories"
	"ems_backend/internal/infrastructure/persistence/models"
	"time"

	"gorm.io/gorm"
)

type MeterRepository struct {
	db *gorm.DB
}

func NewMeterRepository(db *gorm.DB) repositories.MeterRepository {
	return &MeterRepository{db: db}
}

func (r *MeterRepository) Save(meter *entities.Meter) error {
	model := &models.MeterModel{
		Timestamp: meter.Timestamp,
		MeterID:   meter.MeterID,
		KWh:       meter.KWh,
		KW:        meter.KW,
	}
	return r.db.Create(model).Error
}

func (r *MeterRepository) Update(meter *entities.Meter) error {
	model := &models.MeterModel{
		ID:        meter.ID,
		Timestamp: meter.Timestamp,
		MeterID:   meter.MeterID,
		KWh:       meter.KWh,
		KW:        meter.KW,
	}
	return r.db.Save(model).Error
}

func (r *MeterRepository) Delete(id uint) error {
	return r.db.Delete(&models.MeterModel{}, id).Error
}

func (r *MeterRepository) GetByMeterID(meterID string) (*entities.Meter, error) {
	var model models.MeterModel
	if err := r.db.Where("meter_id = ?", meterID).First(&model).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(&model)
}

func (r *MeterRepository) GetLatestByMeterID(meterID string) (*entities.Meter, error) {
	var model models.MeterModel
	if err := r.db.Where("meter_id = ?", meterID).Order("timestamp DESC").First(&model).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(&model)
}

func (r *MeterRepository) GetByMeterIDAndTimeRange(meterID string, startTime, endTime time.Time) ([]*entities.Meter, error) {
	var models []models.MeterModel
	if err := r.db.Where("meter_id = ? AND timestamp >= ? AND timestamp <= ?", meterID, startTime, endTime).
		Order("timestamp ASC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	meters := make([]*entities.Meter, 0, len(models))
	for _, model := range models {
		meter, err := r.mapToDomain(&model)
		if err != nil {
			return nil, err
		}
		meters = append(meters, meter)
	}
	return meters, nil
}

func (r *MeterRepository) GetByMeterIDsAndTimeRange(meterIDs []string, startTime, endTime time.Time) ([]*entities.Meter, error) {
	var models []models.MeterModel
	if err := r.db.Where("meter_id IN ? AND timestamp >= ? AND timestamp <= ?", meterIDs, startTime, endTime).
		Order("timestamp ASC").
		Find(&models).Error; err != nil {
		return nil, err
	}

	meters := make([]*entities.Meter, 0, len(models))
	for _, model := range models {
		meter, err := r.mapToDomain(&model)
		if err != nil {
			return nil, err
		}
		meters = append(meters, meter)
	}
	return meters, nil
}

func (r *MeterRepository) mapToDomain(model *models.MeterModel) (*entities.Meter, error) {
	return &entities.Meter{
		ID:        model.ID,
		Timestamp: model.Timestamp,
		MeterID:   model.MeterID,
		KWh:       model.KWh,
		KW:        model.KW,
	}, nil
}
