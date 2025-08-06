package repositories

import (
	"ems_backend/internal/domain/auth/entities"
	auth_value_objects "ems_backend/internal/domain/auth/value_objects"
	member_value_objects "ems_backend/internal/domain/member/value_objects"
	"ems_backend/internal/infrastructure/persistence/models"
	"errors"

	"gorm.io/gorm"
)

type AuthRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) *AuthRepository {
	return &AuthRepository{db: db}
}

func (r *AuthRepository) SaveSession(session *entities.AuthSession) error {
	// 檢查 memberID 是否有效
	if session.MemberID.Value() == 0 {
		return errors.New("member id cannot be empty")
	}

	model := &models.AccessTokenModel{
		MemberID:     session.MemberID.Value(),
		AccessToken:  session.AccessToken.String(),
		RefreshToken: session.RefreshToken.String(),
		CreateID:     session.CreateID,
		CreateTime:   session.CreateTime,
		ModifyID:     session.ModifyID,
		ModifyTime:   session.ModifyTime,
	}

	return r.db.Save(model).Error
}

func (r *AuthRepository) FindSessionByRefreshToken(refreshToken string) (*entities.AuthSession, error) {
	var model models.AccessTokenModel
	if err := r.db.Where("refresh_token = ? AND is_active = ?", refreshToken, true).First(&model).Error; err != nil {
		return nil, err
	}

	return r.mapToDomain(&model)
}

func (r *AuthRepository) FindSessionByMemberID(memberID uint) (*entities.AuthSession, error) {
	var model models.AccessTokenModel
	if err := r.db.Where("member_id = ? AND is_active = ?", memberID, true).First(&model).Error; err != nil {
		return nil, err
	}

	return r.mapToDomain(&model)
}

func (r *AuthRepository) InvalidateSession(sessionID uint) error {
	return r.db.Model(&models.AccessTokenModel{}).Where("id = ?", sessionID).Delete(&models.AccessTokenModel{}).Error
}

func (r *AuthRepository) InvalidateAllSessionsByMemberID(memberID uint) error {
	return r.db.Model(&models.AccessTokenModel{}).Where("member_id = ?", memberID).Update("is_active", false).Error
}

func (r *AuthRepository) mapToDomain(model *models.AccessTokenModel) (*entities.AuthSession, error) {
	memberID, err := member_value_objects.NewMemberID(model.MemberID)
	if err != nil {
		return nil, err
	}

	accessToken, err := auth_value_objects.NewJWTToken(model.AccessToken)
	if err != nil {
		return nil, err
	}

	refreshToken := auth_value_objects.NewRefreshToken(model.MemberID)

	return &entities.AuthSession{
		ID:           model.ID,
		MemberID:     memberID,
		AccessToken:  accessToken,
		RefreshToken: *refreshToken,
		CreateID:     model.CreateID,
		CreateTime:   model.CreateTime,
		ModifyID:     model.ModifyID,
		ModifyTime:   model.ModifyTime,
	}, nil
}
