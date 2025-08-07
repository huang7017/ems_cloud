package services

import (
	"ems_backend/internal/domain/auth/entities"
	auth_repositories "ems_backend/internal/domain/auth/repositories"
	auth_value_objects "ems_backend/internal/domain/auth/value_objects"
	"ems_backend/internal/domain/member/repositories"
	member_history_repositories "ems_backend/internal/domain/member_history/repositories"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AuthService struct {
	memberRepo        repositories.MemberRepository
	memberHistoryRepo member_history_repositories.MemberHistoryRepository
	authRepo          auth_repositories.AuthRepository
	jwtSecret         string
}

func NewAuthService(memberRepo repositories.MemberRepository, memberHistoryRepo member_history_repositories.MemberHistoryRepository, authRepo auth_repositories.AuthRepository, jwtSecret string) *AuthService {
	return &AuthService{
		memberRepo:        memberRepo,
		memberHistoryRepo: memberHistoryRepo,
		authRepo:          authRepo,
		jwtSecret:         jwtSecret,
	}
}

func (s *AuthService) Login(email, password string) (*entities.AuthResult, error) {
	// 1. 查找會員
	member, err := s.memberRepo.FindByEmail(email)
	if err != nil {
		return nil, errors.New("invalid password")
	}

	// 2. 尋找歷時密碼
	memberHistory, err := s.memberHistoryRepo.LastMemberHistory(member.ID.Value())
	if err != nil {
		return nil, errors.New("invalid password")
	}

	fmt.Println(memberHistory)
	// 2. 驗證憑證
	verify := memberHistory.ValidatePassword(password, memberHistory.Salt, memberHistory.Hash)
	if !verify {
		return nil, errors.New("invalid password")
	}

	// 3. 生成 JWT Access Token
	accessToken, err := s.generateAccessToken(member.ID.String(), member.Name.String())
	if err != nil {
		return nil, err
	}

	// 4. 生成 Refresh Token
	refreshToken := s.generateRefreshToken(member.ID.Value())

	// 5. 創建會話
	accessTokenVO, err := s.createJWTToken(accessToken)
	if err != nil {
		return nil, err
	}

	session := entities.NewAuthSession(member.ID, accessTokenVO, *refreshToken)

	// 6. 保存會話
	if err := s.authRepo.SaveSession(session); err != nil {
		return nil, err
	}

	// 7. 返回認證結果
	return entities.NewAuthResult(
		accessToken,
		refreshToken.String(),
		member,
		int64(24*time.Hour.Seconds()), // 24小時
	), nil
}

func (s *AuthService) RefreshToken(refreshToken string) (*entities.AuthResult, error) {
	// 1. 查找會話
	session, err := s.authRepo.FindSessionByRefreshToken(refreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	if session.IsExpired() {
		return nil, errors.New("refresh token expired")
	}

	// 2. 查找會員
	member, err := s.memberRepo.FindByID(session.MemberID.String())
	if err != nil {
		return nil, errors.New("member not found")
	}

	// 3. 生成新的 Access Token
	newAccessToken, err := s.generateAccessToken(member.ID.String(), member.Name.String())
	if err != nil {
		return nil, err
	}

	// 4. 更新會話
	newAccessTokenVO, err := s.createJWTToken(newAccessToken)
	if err != nil {
		return nil, err
	}

	session.AccessToken = newAccessTokenVO
	if err := s.authRepo.SaveSession(session); err != nil {
		return nil, err
	}

	// 5. 返回新的認證結果
	return entities.NewAuthResult(
		newAccessToken,
		session.RefreshToken.String(),
		member,
		int64(24*time.Hour.Seconds()),
	), nil
}

func (s *AuthService) Logout(refreshToken string) error {
	session, err := s.authRepo.FindSessionByRefreshToken(refreshToken)
	if err != nil {
		return errors.New("invalid refresh token")
	}

	return s.authRepo.InvalidateSession(session.ID)
}

func (s *AuthService) ValidateToken(tokenString string) (*auth_value_objects.JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &auth_value_objects.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*auth_value_objects.JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func (s *AuthService) generateAccessToken(memberID, username string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := s.createJWTClaims(memberID, username, expirationTime)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *AuthService) generateRefreshToken(memberID uint) *auth_value_objects.RefreshToken {
	return auth_value_objects.NewRefreshToken(memberID)
}

func (s *AuthService) createJWTToken(value string) (auth_value_objects.JWTToken, error) {
	return auth_value_objects.NewJWTToken(value)
}

func (s *AuthService) createJWTClaims(memberID, username string, expirationTime time.Time) *auth_value_objects.JWTClaims {
	return auth_value_objects.NewJWTClaims(memberID, username, expirationTime)
}
