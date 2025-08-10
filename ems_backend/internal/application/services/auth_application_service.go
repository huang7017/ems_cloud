package services

import (
	"ems_backend/internal/application/dto"
	"ems_backend/internal/domain/auth/services"
	"strconv"
)

type AuthApplicationService struct {
	authService *services.AuthService
}

func NewAuthApplicationService(authService *services.AuthService) *AuthApplicationService {
	return &AuthApplicationService{
		authService: authService,
	}
}

func (s *AuthApplicationService) Login(request *dto.LoginRequest) (*dto.APIResponse, error) {
	authResult, err := s.authService.Login(request.Account, request.Password)
	if err != nil {
		return &dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		}, nil
	}

	memberRoles := make([]dto.MemberRole, len(authResult.MemberRoles))
	for i, role := range authResult.MemberRoles {
		memberRoles[i] = dto.MemberRole{
			ID:   strconv.FormatUint(uint64(role.ID), 10),
			Name: role.RoleName,
		}
	}
	// 轉換為 DTO
	authResponse := &dto.AuthResponse{
		AccessToken:  authResult.AccessToken,
		RefreshToken: authResult.RefreshToken,
		Member: dto.MemberInfo{
			ID:   authResult.Member.ID,
			Name: authResult.Member.Name,
		},
		MemberRoles: memberRoles,
		ExpiresIn:   authResult.ExpiresIn,
		TokenType:   authResult.TokenType,
	}

	return &dto.APIResponse{
		Success: true,
		Data:    authResponse,
	}, nil
}

func (s *AuthApplicationService) RefreshToken(request *dto.RefreshTokenRequest) (*dto.APIResponse, error) {
	authResult, err := s.authService.RefreshToken(request.RefreshToken)
	if err != nil {
		return &dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		}, nil
	}

	memberRoles := make([]dto.MemberRole, len(authResult.MemberRoles))
	for i, role := range authResult.MemberRoles {
		memberRoles[i] = dto.MemberRole{
			ID:   strconv.FormatUint(uint64(role.ID), 10),
			Name: role.RoleName,
		}
	}
	// 轉換為 DTO
	authResponse := &dto.AuthResponse{
		AccessToken:  authResult.AccessToken,
		RefreshToken: authResult.RefreshToken,
		Member: dto.MemberInfo{
			ID:   authResult.Member.ID,
			Name: authResult.Member.Name,
		},
		MemberRoles: memberRoles,
		ExpiresIn:   authResult.ExpiresIn,
		TokenType:   authResult.TokenType,
	}

	return &dto.APIResponse{
		Success: true,
		Data:    authResponse,
	}, nil
}

func (s *AuthApplicationService) Logout(request *dto.LogoutRequest) (*dto.APIResponse, error) {
	err := s.authService.Logout(request.RefreshToken)
	if err != nil {
		return &dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		}, nil
	}

	return &dto.APIResponse{
		Success: true,
		Data:    map[string]string{"message": "logged out successfully"},
	}, nil
}
