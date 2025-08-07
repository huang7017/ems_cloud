package repositories

import (
	"ems_backend/internal/domain/member/entities"
	"ems_backend/internal/domain/member/value_objects"
	"ems_backend/internal/infrastructure/persistence/models"
	"fmt"

	"gorm.io/gorm"
)

type MemberRepository struct {
	db *gorm.DB
}

func NewMemberRepository(db *gorm.DB) *MemberRepository {
	return &MemberRepository{db: db}
}

func (r *MemberRepository) FindByID(id string) (*entities.Member, error) {
	var model models.MemberModel
	if err := r.db.Where("id = ?", id).First(&model).Error; err != nil {
		return nil, err
	}

	return r.mapToDomain(&model)
}

func (r *MemberRepository) FindByEmail(email string) (*entities.Member, error) {
	var model models.MemberModel
	if err := r.db.Where("email = ?", email).First(&model).Error; err != nil {
		return nil, err
	}
	fmt.Println(model)
	return r.mapToDomain(&model)
}

func (r *MemberRepository) Save(member *entities.Member) error {
	model := r.mapToModel(member)
	return r.db.Save(model).Error
}

func (r *MemberRepository) Update(member *entities.Member) error {
	model := r.mapToModel(member)
	return r.db.Save(model).Error
}

func (r *MemberRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.MemberModel{}).Error
}

func (r *MemberRepository) mapToDomain(model *models.MemberModel) (*entities.Member, error) {
	memberID, err := value_objects.NewMemberID(model.ID)
	if err != nil {
		return nil, err
	}

	email, err := value_objects.NewEmail(model.Email)
	if err != nil {
		return nil, err
	}

	name, err := value_objects.NewName(model.Name)
	if err != nil {
		return nil, err
	}

	return &entities.Member{
		ID:        memberID,
		Name:      name,
		Email:     email,
		IsEnable:  model.IsEnable,
		CreatedAt: model.CreateTime,
		UpdatedAt: model.ModifyTime,
	}, nil
}

func (r *MemberRepository) mapToModel(member *entities.Member) *models.MemberModel {
	// 這裡需要處理 ID 的轉換，暫時使用 0 作為新記錄
	var id uint = 0
	if member.ID.Value() != 0 {
		// 實際項目中需要正確的 ID 轉換邏輯
		id = 1 // 簡化處理
	}

	return &models.MemberModel{
		ID:         id,
		Name:       member.Name.String(),
		Email:      member.Email.String(),
		IsEnable:   member.IsEnable,
		CreateTime: member.CreatedAt,
		ModifyTime: member.UpdatedAt,
	}
}
