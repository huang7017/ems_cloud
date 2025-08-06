package repositories

import (
	member_value_objects "ems_backend/internal/domain/member/value_objects"
	"ems_backend/internal/domain/member_history/entities"
	"ems_backend/internal/infrastructure/persistence/models"

	"gorm.io/gorm"
)

type MemberHistoryRepository struct {
	db *gorm.DB
}

func NewMemberHistoryRepository(db *gorm.DB) *MemberHistoryRepository {
	return &MemberHistoryRepository{db: db}
}

func (r *MemberHistoryRepository) Save(member *entities.MemberHistory) error {
	model := r.mapToModel(member)
	return r.db.Save(model).Error
}

func (r *MemberHistoryRepository) Update(member *entities.MemberHistory) error {
	model := r.mapToModel(member)
	return r.db.Save(model).Error
}

func (r *MemberHistoryRepository) LastMemberHistory(memberID uint) (*entities.MemberHistory, error) {
	var model models.MemberHistoryModel
	if err := r.db.Where("member_id = ?", memberID).Order("create_time DESC").First(&model).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(&model)
}

func (r *MemberHistoryRepository) mapToModel(member *entities.MemberHistory) *models.MemberHistoryModel {
	// 這裡需要處理 ID 的轉換，暫時使用 0 作為新記錄
	var id uint = 0
	if member.ID != 0 {
		// 實際項目中需要正確的 ID 轉換邏輯
		id = member.ID // 簡化處理
	}

	return &models.MemberHistoryModel{
		ID:         id,
		MemberID:   member.MemberID.Value(),
		Salt:       member.Salt,
		Hash:       member.Hash,
		ErrorCount: member.ErrorCount,
		CreateID:   member.CreateID,
		CreateTime: member.CreateTime,
		ModifyID:   member.ModifyID,
		ModifyTime: member.ModifyTime,
	}
}

func (r *MemberHistoryRepository) mapToDomain(model *models.MemberHistoryModel) (*entities.MemberHistory, error) {
	memberID, err := member_value_objects.NewMemberID(model.MemberID)
	if err != nil {
		return nil, err
	}

	return &entities.MemberHistory{
		ID:         model.ID,
		MemberID:   memberID,
		Salt:       model.Salt,
		Hash:       model.Hash,
		ErrorCount: model.ErrorCount,
		CreateID:   model.CreateID,
		CreateTime: model.CreateTime,
		ModifyID:   model.ModifyID,
		ModifyTime: model.ModifyTime,
	}, nil
}
