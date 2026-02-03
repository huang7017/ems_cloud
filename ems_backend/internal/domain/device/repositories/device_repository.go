package repositories

import "ems_backend/internal/domain/device/entities"

// DeviceRepository 設備倉儲接口
type DeviceRepository interface {
	// FindAll 查找所有設備
	FindAll() ([]*entities.Device, error)

	// FindByID 根據 ID 查找設備
	FindByID(id uint) (*entities.Device, error)

	// FindBySN 根據 SN 查找設備
	FindBySN(sn string) (*entities.Device, error)

	// Create 創建設備
	Create(device *entities.Device) error

	// Update 更新設備
	Update(device *entities.Device) error

	// Delete 刪除設備
	Delete(id uint) error

	// ExistsBySN 檢查 SN 是否已存在
	ExistsBySN(sn string) (bool, error)

	// ExistsBySNExcludeID 檢查 SN 是否已存在（排除指定 ID）
	ExistsBySNExcludeID(sn string, excludeID uint) (bool, error)

	// FindUnassigned 查找未被綁定到任何公司的設備
	FindUnassigned() ([]*entities.Device, error)
}
