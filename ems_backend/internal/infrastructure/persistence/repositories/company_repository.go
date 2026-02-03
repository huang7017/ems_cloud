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

func (r *CompanyRepository) FindAll() ([]*entities.Company, error) {
	var companyModels []models.CompanyModel
	if err := r.db.Where("is_active = ?", true).Order("name").Find(&companyModels).Error; err != nil {
		return nil, err
	}

	companies := make([]*entities.Company, 0, len(companyModels))
	for _, model := range companyModels {
		companies = append(companies, r.mapToDomain(&model))
	}
	return companies, nil
}

func (r *CompanyRepository) FindByParentID(parentID *uint) ([]*entities.Company, error) {
	var companyModels []models.CompanyModel
	query := r.db.Where("is_active = ?", true)
	if parentID == nil {
		query = query.Where("parent_id IS NULL")
	} else {
		query = query.Where("parent_id = ?", *parentID)
	}
	if err := query.Order("name").Find(&companyModels).Error; err != nil {
		return nil, err
	}

	companies := make([]*entities.Company, 0, len(companyModels))
	for _, model := range companyModels {
		companies = append(companies, r.mapToDomain(&model))
	}
	return companies, nil
}

func (r *CompanyRepository) FindDescendants(companyID uint) ([]*entities.Company, error) {
	var companyModels []models.CompanyModel

	// PostgreSQL recursive CTE to find all descendants
	query := `
		WITH RECURSIVE company_tree AS (
			SELECT * FROM company WHERE parent_id = ? AND is_active = true
			UNION ALL
			SELECT c.* FROM company c
			INNER JOIN company_tree ct ON c.parent_id = ct.id
			WHERE c.is_active = true
		)
		SELECT * FROM company_tree ORDER BY name
	`

	if err := r.db.Raw(query, companyID).Scan(&companyModels).Error; err != nil {
		return nil, err
	}

	companies := make([]*entities.Company, 0, len(companyModels))
	for _, model := range companyModels {
		companies = append(companies, r.mapToDomain(&model))
	}
	return companies, nil
}

func (r *CompanyRepository) FindWithDescendants(companyID uint) ([]*entities.Company, error) {
	var companyModels []models.CompanyModel

	// PostgreSQL recursive CTE to find company and all descendants
	query := `
		WITH RECURSIVE company_tree AS (
			SELECT * FROM company WHERE id = ? AND is_active = true
			UNION ALL
			SELECT c.* FROM company c
			INNER JOIN company_tree ct ON c.parent_id = ct.id
			WHERE c.is_active = true
		)
		SELECT * FROM company_tree ORDER BY name
	`

	if err := r.db.Raw(query, companyID).Scan(&companyModels).Error; err != nil {
		return nil, err
	}

	companies := make([]*entities.Company, 0, len(companyModels))
	for _, model := range companyModels {
		companies = append(companies, r.mapToDomain(&model))
	}
	return companies, nil
}

func (r *CompanyRepository) Save(company *entities.Company) error {
	model := &models.CompanyModel{
		Name:          company.Name,
		Address:       company.Address,
		ContactPerson: company.ContactPerson,
		ContactPhone:  company.ContactPhone,
		IsActive:      company.IsActive,
		ParentID:      company.ParentID,
		CreateID:      company.CreateID,
		CreateTime:    company.CreateTime,
		ModifyID:      company.ModifyID,
		ModifyTime:    company.ModifyTime,
	}

	if err := r.db.Create(model).Error; err != nil {
		return err
	}

	company.ID = model.ID
	return nil
}

func (r *CompanyRepository) Update(company *entities.Company) error {
	result := r.db.Model(&models.CompanyModel{}).
		Where("id = ?", company.ID).
		Select("name", "address", "contact_person", "contact_phone", "is_active", "parent_id", "modify_id", "modify_time").
		Updates(map[string]interface{}{
			"name":           company.Name,
			"address":        company.Address,
			"contact_person": company.ContactPerson,
			"contact_phone":  company.ContactPhone,
			"is_active":      company.IsActive,
			"parent_id":      company.ParentID,
			"modify_id":      company.ModifyID,
			"modify_time":    company.ModifyTime,
		})

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *CompanyRepository) Delete(id uint) error {
	result := r.db.Delete(&models.CompanyModel{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *CompanyRepository) ExistsByID(id uint) (bool, error) {
	var count int64
	if err := r.db.Model(&models.CompanyModel{}).Where("id = ? AND is_active = ?", id, true).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
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
