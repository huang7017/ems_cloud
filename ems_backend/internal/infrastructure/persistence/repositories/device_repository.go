package repositories

import (
	"ems_backend/internal/domain/device/entities"
	"ems_backend/internal/domain/device/repositories"
	"ems_backend/internal/infrastructure/persistence/models"

	"gorm.io/gorm"
)

// deviceRepository 設備倉儲實現
type deviceRepository struct {
	db *gorm.DB
}

// NewDeviceRepository 創建設備倉儲
func NewDeviceRepository(db *gorm.DB) repositories.DeviceRepository {
	return &deviceRepository{db: db}
}

// FindAll 查找所有設備
func (r *deviceRepository) FindAll() ([]*entities.Device, error) {
	var models []models.DeviceModel
	if err := r.db.Order("id DESC").Find(&models).Error; err != nil {
		return nil, err
	}

	result := make([]*entities.Device, len(models))
	for i, m := range models {
		result[i] = m.ToEntity()
	}
	return result, nil
}

// FindByID 根據 ID 查找設備
func (r *deviceRepository) FindByID(id uint) (*entities.Device, error) {
	var model models.DeviceModel
	if err := r.db.First(&model, id).Error; err != nil {
		return nil, err
	}
	return model.ToEntity(), nil
}

// FindBySN 根據 SN 查找設備
func (r *deviceRepository) FindBySN(sn string) (*entities.Device, error) {
	var model models.DeviceModel
	if err := r.db.Where("sn = ?", sn).First(&model).Error; err != nil {
		return nil, err
	}
	return model.ToEntity(), nil
}

// Create 創建設備
func (r *deviceRepository) Create(device *entities.Device) error {
	model := models.DeviceModelFromEntity(device)
	if err := r.db.Create(model).Error; err != nil {
		return err
	}
	device.ID = model.ID
	return nil
}

// Update 更新設備
func (r *deviceRepository) Update(device *entities.Device) error {
	model := models.DeviceModelFromEntity(device)
	return r.db.Save(model).Error
}

// Delete 刪除設備
func (r *deviceRepository) Delete(id uint) error {
	return r.db.Delete(&models.DeviceModel{}, id).Error
}

// ExistsBySN 檢查 SN 是否已存在
func (r *deviceRepository) ExistsBySN(sn string) (bool, error) {
	var count int64
	if err := r.db.Model(&models.DeviceModel{}).Where("sn = ?", sn).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// ExistsBySNExcludeID 檢查 SN 是否已存在（排除指定 ID）
func (r *deviceRepository) ExistsBySNExcludeID(sn string, excludeID uint) (bool, error) {
	var count int64
	if err := r.db.Model(&models.DeviceModel{}).Where("sn = ? AND id != ?", sn, excludeID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// FindUnassigned 查找未被綁定到任何公司的設備
func (r *deviceRepository) FindUnassigned() ([]*entities.Device, error) {
	var deviceModels []models.DeviceModel

	// 使用子查詢找出未被綁定的設備
	// SELECT * FROM device WHERE id NOT IN (SELECT device_id FROM company_device)
	if err := r.db.Where("id NOT IN (?)",
		r.db.Table("company_device").Select("device_id"),
	).Order("id DESC").Find(&deviceModels).Error; err != nil {
		return nil, err
	}

	result := make([]*entities.Device, len(deviceModels))
	for i, m := range deviceModels {
		result[i] = m.ToEntity()
	}
	return result, nil
}
