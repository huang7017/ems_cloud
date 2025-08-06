package entities

import (
	"ems_backend/internal/domain/member/entities"
)

// AuthResult - 認證結果
type AuthResult struct {
	AccessToken  string                     `json:"access_token"`
	RefreshToken string                     `json:"refresh_token"`
	Member       *entities.MemberPublicInfo `json:"member"`
	ExpiresIn    int64                      `json:"expires_in"`
	TokenType    string                     `json:"token_type"`
}

func NewAuthResult(accessToken, refreshToken string, member *entities.Member, expiresIn int64) *AuthResult {
	return &AuthResult{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		Member:       member.GetPublicInfo(),
		ExpiresIn:    expiresIn,
		TokenType:    "Bearer",
	}
}
