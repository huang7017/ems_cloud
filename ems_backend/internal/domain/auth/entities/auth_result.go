package entities

import (
	"ems_backend/internal/domain/member/entities"
	member_role_entities "ems_backend/internal/domain/member_role/entities"
)

// AuthResult - 認證結果
type AuthResult struct {
	AccessToken  string                             `json:"access_token"`
	RefreshToken string                             `json:"refresh_token"`
	Member       *entities.MemberPublicInfo         `json:"member"`
	MemberRoles  []*member_role_entities.MemberRole `json:"member_roles"`
	ExpiresIn    int64                              `json:"expires_in"`
	TokenType    string                             `json:"token_type"`
}

func NewAuthResult(accessToken, refreshToken string, member *entities.Member, memberRoles []*member_role_entities.MemberRole, expiresIn int64) *AuthResult {
	return &AuthResult{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		Member:       member.GetPublicInfo(),
		MemberRoles:  memberRoles,
		ExpiresIn:    expiresIn,
		TokenType:    "Bearer",
	}
}
