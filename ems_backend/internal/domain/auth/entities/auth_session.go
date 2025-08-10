package entities

import (
	auth_value_objects "ems_backend/internal/domain/auth/value_objects"
	member_value_objects "ems_backend/internal/domain/member/value_objects"
	"time"
)

// AuthSession - 認證會話
type AuthSession struct {
	ID           uint
	MemberID     member_value_objects.MemberID
	AccessToken  auth_value_objects.JWTToken
	RefreshToken auth_value_objects.JWTToken
	CreateID     uint
	CreateTime   time.Time
	ModifyID     uint
	ModifyTime   time.Time
}

func NewAuthSession(memberID member_value_objects.MemberID, accessToken auth_value_objects.JWTToken, refreshToken auth_value_objects.JWTToken) *AuthSession {
	return &AuthSession{
		MemberID:     memberID,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		CreateTime:   time.Now(),
		ModifyTime:   time.Now(),
		CreateID:     memberID.Value(),
		ModifyID:     memberID.Value(),
	}
}
