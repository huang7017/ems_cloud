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

func (r *CompanyDeviceRepository) FindAll() ([]*entities.CompanyDevice, error) {
	var deviceModels []models.CompanyDeviceModel

	if err := r.db.Find(&deviceModels).Error; err != nil {
		return nil, err
	}

	devices := make([]*entities.CompanyDevice, 0, len(deviceModels))
	for _, model := range deviceModels {
		devices = append(devices, r.mapToDomain(&model))
	}

	return devices, nil
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

func (r *CompanyDeviceRepository) FindByCompanyIDs(companyIDs []uint) ([]*entities.CompanyDevice, error) {
	if len(companyIDs) == 0 {
		return []*entities.CompanyDevice{}, nil
	}

	var deviceModels []models.CompanyDeviceModel
	if err := r.db.Where("company_id IN ?", companyIDs).Find(&deviceModels).Error; err != nil {
		return nil, err
	}

	devices := make([]*entities.CompanyDevice, 0, len(deviceModels))
	for _, model := range deviceModels {
		devices = append(devices, r.mapToDomain(&model))
	}
	return devices, nil
}

func (r *CompanyDeviceRepository) FindByDeviceID(deviceID uint) (*entities.CompanyDevice, error) {
	var model models.CompanyDeviceModel
	if err := r.db.Where("device_id = ?", deviceID).First(&model).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(&model), nil
}

func (r *CompanyDeviceRepository) FindByCompanyAndDevice(companyID, deviceID uint) (*entities.CompanyDevice, error) {
	var model models.CompanyDeviceModel
	if err := r.db.Where("company_id = ? AND device_id = ?", companyID, deviceID).First(&model).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(&model), nil
}

func (r *CompanyDeviceRepository) Save(companyDevice *entities.CompanyDevice) error {
	model := &models.CompanyDeviceModel{
		CompanyID:  companyDevice.CompanyID,
		DeviceID:   companyDevice.DeviceID,
		Content:    models.JSONB(companyDevice.Content),
		CreateID:   companyDevice.CreateID,
		CreateTime: companyDevice.CreateTime,
		ModifyID:   companyDevice.ModifyID,
		ModifyTime: companyDevice.ModifyTime,
	}

	if err := r.db.Create(model).Error; err != nil {
		return err
	}

	companyDevice.ID = model.ID
	return nil
}

func (r *CompanyDeviceRepository) Update(companyDevice *entities.CompanyDevice) error {
	result := r.db.Model(&models.CompanyDeviceModel{}).
		Where("id = ?", companyDevice.ID).
		Select("company_id", "device_id", "content", "modify_id", "modify_time").
		Updates(map[string]interface{}{
			"company_id":  companyDevice.CompanyID,
			"device_id":   companyDevice.DeviceID,
			"content":     models.JSONB(companyDevice.Content),
			"modify_id":   companyDevice.ModifyID,
			"modify_time": companyDevice.ModifyTime,
		})

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *CompanyDeviceRepository) Delete(id uint) error {
	result := r.db.Delete(&models.CompanyDeviceModel{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *CompanyDeviceRepository) DeleteByCompanyAndDevice(companyID, deviceID uint) error {
	result := r.db.Where("company_id = ? AND device_id = ?", companyID, deviceID).Delete(&models.CompanyDeviceModel{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *CompanyDeviceRepository) ExistsByCompanyAndDevice(companyID, deviceID uint) (bool, error) {
	var count int64
	if err := r.db.Model(&models.CompanyDeviceModel{}).
		Where("company_id = ? AND device_id = ?", companyID, deviceID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
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
