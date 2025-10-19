package repositories

import (
	"ems_backend/internal/domain/company_device/entities"
	"ems_backend/internal/domain/company_device/repositories"
	"ems_backend/internal/infrastructure/persistence/models"
	"encoding/json"

	"gorm.io/gorm"
)

type CompanyDeviceRepository struct {
	db *gorm.DB
}

func NewCompanyDeviceRepository(db *gorm.DB) repositories.CompanyDeviceRepository {
	return &CompanyDeviceRepository{db: db}
}

func (r *CompanyDeviceRepository) FindByCompanyID(companyID uint) ([]*entities.CompanyDevice, error) {
	var deviceModels []models.CompanyDeviceModel

	if err := r.db.Where("company_id = ?", companyID).Find(&deviceModels).Error; err != nil {
		return nil, err
	}

	devices := make([]*entities.CompanyDevice, 0, len(deviceModels))
	for _, model := range deviceModels {
		devices = append(devices, r.mapToDomain(&model))
	}

	return devices, nil
}

func (r *CompanyDeviceRepository) FindByID(id uint) (*entities.CompanyDevice, error) {
	var model models.CompanyDeviceModel
	if err := r.db.Where("id = ?", id).First(&model).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(&model), nil
}

func (r *CompanyDeviceRepository) mapToDomain(model *models.CompanyDeviceModel) *entities.CompanyDevice {
	return &entities.CompanyDevice{
		ID:         model.ID,
		CompanyID:  model.CompanyID,
		DeviceID:   model.DeviceID,
		Content:    json.RawMessage(model.Content),
		CreateID:   model.CreateID,
		CreateTime: model.CreateTime,
		ModifyID:   model.ModifyID,
		ModifyTime: model.ModifyTime,
	}
}
