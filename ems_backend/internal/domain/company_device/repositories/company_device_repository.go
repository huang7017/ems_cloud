package repositories

import (
	"ems_backend/internal/domain/company_device/entities"
)

type CompanyDeviceRepository interface {
	FindAll() ([]*entities.CompanyDevice, error)
	FindByCompanyID(companyID uint) ([]*entities.CompanyDevice, error)
	FindByCompanyIDs(companyIDs []uint) ([]*entities.CompanyDevice, error)
	FindByID(id uint) (*entities.CompanyDevice, error)
	FindByDeviceID(deviceID uint) (*entities.CompanyDevice, error)
	FindByCompanyAndDevice(companyID, deviceID uint) (*entities.CompanyDevice, error)
	Save(companyDevice *entities.CompanyDevice) error
	Update(companyDevice *entities.CompanyDevice) error
	Delete(id uint) error
	DeleteByCompanyAndDevice(companyID, deviceID uint) error
	ExistsByCompanyAndDevice(companyID, deviceID uint) (bool, error)
}
