package repositories

import (
	"ems_backend/internal/domain/company/entities"
	"ems_backend/internal/domain/company/repositories"
	"ems_backend/internal/infrastructure/persistence/models"

	"gorm.io/gorm"
)

type CompanyMemberRepository struct {
	db *gorm.DB
}

func NewCompanyMemberRepository(db *gorm.DB) repositories.CompanyMemberRepository {
	return &CompanyMemberRepository{db: db}
}

func (r *CompanyMemberRepository) FindByCompanyID(companyID uint) ([]*entities.CompanyMember, error) {
	var memberModels []models.CompanyMemberModel
	if err := r.db.Where("company_id = ?", companyID).Find(&memberModels).Error; err != nil {
		return nil, err
	}

	members := make([]*entities.CompanyMember, 0, len(memberModels))
	for _, model := range memberModels {
		members = append(members, r.mapToDomain(&model))
	}
	return members, nil
}

func (r *CompanyMemberRepository) FindByMemberID(memberID uint) ([]*entities.CompanyMember, error) {
	var memberModels []models.CompanyMemberModel
	if err := r.db.Where("member_id = ?", memberID).Find(&memberModels).Error; err != nil {
		return nil, err
	}

	members := make([]*entities.CompanyMember, 0, len(memberModels))
	for _, model := range memberModels {
		members = append(members, r.mapToDomain(&model))
	}
	return members, nil
}

func (r *CompanyMemberRepository) FindByCompanyIDWithDetails(companyID uint) ([]*entities.CompanyMemberWithDetails, error) {
	var results []*entities.CompanyMemberWithDetails

	query := `
		SELECT
			cm.id,
			cm.company_id,
			cm.member_id,
			m.name as member_name,
			m.email,
			COALESCE(r.title, '') as role_title
		FROM company_member cm
		JOIN member m ON cm.member_id = m.id
		LEFT JOIN member_role mr ON m.id = mr.member_id
		LEFT JOIN role r ON mr.role_id = r.id
		WHERE cm.company_id = ? AND m.is_enable = true
		ORDER BY m.name
	`

	if err := r.db.Raw(query, companyID).Scan(&results).Error; err != nil {
		return nil, err
	}

	return results, nil
}

func (r *CompanyMemberRepository) FindByCompanyAndMember(companyID, memberID uint) (*entities.CompanyMember, error) {
	var model models.CompanyMemberModel
	if err := r.db.Where("company_id = ? AND member_id = ?", companyID, memberID).First(&model).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(&model), nil
}

func (r *CompanyMemberRepository) Save(companyMember *entities.CompanyMember) error {
	model := &models.CompanyMemberModel{
		CompanyID:  companyMember.CompanyID,
		MemberID:   companyMember.MemberID,
		CreateID:   companyMember.CreateID,
		CreateTime: companyMember.CreateTime,
		ModifyID:   companyMember.ModifyID,
		ModifyTime: companyMember.ModifyTime,
	}

	if err := r.db.Create(model).Error; err != nil {
		return err
	}

	companyMember.ID = model.ID
	return nil
}

func (r *CompanyMemberRepository) Delete(id uint) error {
	result := r.db.Delete(&models.CompanyMemberModel{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *CompanyMemberRepository) DeleteByCompanyAndMember(companyID, memberID uint) error {
	result := r.db.Where("company_id = ? AND member_id = ?", companyID, memberID).Delete(&models.CompanyMemberModel{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *CompanyMemberRepository) ExistsByCompanyAndMember(companyID, memberID uint) (bool, error) {
	var count int64
	if err := r.db.Model(&models.CompanyMemberModel{}).
		Where("company_id = ? AND member_id = ?", companyID, memberID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *CompanyMemberRepository) mapToDomain(model *models.CompanyMemberModel) *entities.CompanyMember {
	return &entities.CompanyMember{
		ID:         model.ID,
		CompanyID:  model.CompanyID,
		MemberID:   model.MemberID,
		CreateID:   model.CreateID,
		CreateTime: model.CreateTime,
		ModifyID:   model.ModifyID,
		ModifyTime: model.ModifyTime,
	}
}
