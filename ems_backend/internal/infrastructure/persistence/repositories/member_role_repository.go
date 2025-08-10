package repositories

import (
	"ems_backend/internal/domain/member_role/entities"
	"ems_backend/internal/infrastructure/persistence/models"

	"gorm.io/gorm"
)

type MemberRoleRepository struct {
	db *gorm.DB
}

func NewMemberRoleRepository(db *gorm.DB) *MemberRoleRepository {
	return &MemberRoleRepository{db: db}
}

func (r *MemberRoleRepository) GetByMemberID(memberID uint) ([]*entities.MemberRole, error) {
	var models []*models.VMemberRoleModel
	if err := r.db.Where("member_id = ?", memberID).Find(&models).Error; err != nil {
		return nil, err
	}

	return r.mapToDomain(models), nil
}

func (r *MemberRoleRepository) mapToDomain(models []*models.VMemberRoleModel) []*entities.MemberRole {
	memberRoles := make([]*entities.MemberRole, len(models))
	for i, model := range models {
		memberRoles[i] = &entities.MemberRole{
			ID:         model.ID,
			MemberID:   model.MemberID,
			MemberName: model.MemberName,
			RoleID:     model.RoleID,
			RoleName:   model.RoleTitle,
		}
	}
	return memberRoles
}
