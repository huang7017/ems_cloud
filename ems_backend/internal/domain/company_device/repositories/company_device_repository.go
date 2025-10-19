package repositories

import (
	"ems_backend/internal/domain/company_device/entities"
)

type CompanyDeviceRepository interface {
	FindByCompanyID(companyID uint) ([]*entities.CompanyDevice, error)
	FindByID(id uint) (*entities.CompanyDevice, error)
}
