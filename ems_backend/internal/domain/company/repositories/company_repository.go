package repositories

import (
	"ems_backend/internal/domain/company/entities"
)

type CompanyRepository interface {
	FindByID(id uint) (*entities.Company, error)
	FindByMemberID(memberID uint) ([]*entities.Company, error)
}
