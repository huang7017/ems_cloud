package repositories

import (
	"ems_backend/internal/domain/company/entities"
	"ems_backend/internal/domain/company/repositories"
	"ems_backend/internal/infrastructure/persistence/models"

	"gorm.io/gorm"
)

type CompanyRepository struct {
	db *gorm.DB
}

func NewCompanyRepository(db *gorm.DB) repositories.CompanyRepository {
	return &CompanyRepository{db: db}
}

func (r *CompanyRepository) FindByID(id uint) (*entities.Company, error) {
	var model models.CompanyModel
	if err := r.db.Where("id = ?", id).First(&model).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(&model), nil
}

func (r *CompanyRepository) FindByMemberID(memberID uint) ([]*entities.Company, error) {
	var companyModels []models.CompanyModel

	// 通過 company_member 表關聯查詢
	err := r.db.
		Joins("JOIN company_member ON company.id = company_member.company_id").
		Where("company_member.member_id = ?", memberID).
		Find(&companyModels).Error

	if err != nil {
		return nil, err
	}

	companies := make([]*entities.Company, 0, len(companyModels))
	for _, model := range companyModels {
		companies = append(companies, r.mapToDomain(&model))
	}

	return companies, nil
}

func (r *CompanyRepository) mapToDomain(model *models.CompanyModel) *entities.Company {
	return &entities.Company{
		ID:            model.ID,
		Name:          model.Name,
		Address:       model.Address,
		ContactPerson: model.ContactPerson,
		ContactPhone:  model.ContactPhone,
		IsActive:      model.IsActive,
		ParentID:      model.ParentID,
		CreateID:      model.CreateID,
		CreateTime:    model.CreateTime,
		ModifyID:      model.ModifyID,
		ModifyTime:    model.ModifyTime,
	}
}
