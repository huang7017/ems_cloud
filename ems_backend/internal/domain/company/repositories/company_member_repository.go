package repositories

import (
	"ems_backend/internal/domain/company/entities"
)

type CompanyMemberRepository interface {
	FindByCompanyID(companyID uint) ([]*entities.CompanyMember, error)
	FindByMemberID(memberID uint) ([]*entities.CompanyMember, error)
	FindByCompanyIDWithDetails(companyID uint) ([]*entities.CompanyMemberWithDetails, error)
	FindByCompanyAndMember(companyID, memberID uint) (*entities.CompanyMember, error)
	Save(companyMember *entities.CompanyMember) error
	Delete(id uint) error
	DeleteByCompanyAndMember(companyID, memberID uint) error
	ExistsByCompanyAndMember(companyID, memberID uint) (bool, error)
}
