package repositories

import (
	"ems_backend/internal/domain/company/entities"
)

type CompanyRepository interface {
	FindByID(id uint) (*entities.Company, error)
	FindByMemberID(memberID uint) ([]*entities.Company, error)
	FindAll() ([]*entities.Company, error)
	FindByParentID(parentID *uint) ([]*entities.Company, error)
	FindDescendants(companyID uint) ([]*entities.Company, error)
	FindWithDescendants(companyID uint) ([]*entities.Company, error)
	Save(company *entities.Company) error
	Update(company *entities.Company) error
	Delete(id uint) error
	ExistsByID(id uint) (bool, error)
}
