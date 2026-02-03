package services

import (
	"ems_backend/internal/application/dto"
	"ems_backend/internal/domain/power/entities"
	"ems_backend/internal/domain/power/services"
)

type PowerApplicationService struct {
	powerService *services.PowerService
}

func NewPowerApplicationService(powerService *services.PowerService) *PowerApplicationService {
	return &PowerApplicationService{powerService: powerService}
}

// GetAll 獲取所有權限
func (s *PowerApplicationService) GetAll() ([]*dto.PowerResponse, error) {
	powers, err := s.powerService.GetAll()
	if err != nil {
		return nil, err
	}

	powerResponses := make([]*dto.PowerResponse, len(powers))
	for i, power := range powers {
		powerResponses[i] = &dto.PowerResponse{
			ID:          power.ID,
			MenuID:      power.MenuID,
			Title:       power.Title,
			Code:        power.Code,
			Description: power.Description,
			Sort:        power.Sort,
			IsEnable:    power.IsEnable,
		}
	}
	return powerResponses, nil
}

// GetByID 根據ID獲取權限
func (s *PowerApplicationService) GetByID(id uint) (*dto.PowerResponse, error) {
	power, err := s.powerService.GetByID(id)
	if err != nil {
		return nil, err
	}

	return &dto.PowerResponse{
		ID:          power.ID,
		MenuID:      power.MenuID,
		Title:       power.Title,
		Code:        power.Code,
		Description: power.Description,
		Sort:        power.Sort,
		IsEnable:    power.IsEnable,
	}, nil
}

// GetByMenuID 根據菜單ID獲取權限
func (s *PowerApplicationService) GetByMenuID(menuID uint) ([]*dto.PowerResponse, error) {
	powers, err := s.powerService.GetByMenuID(menuID)
	if err != nil {
		return nil, err
	}

	powerResponses := make([]*dto.PowerResponse, len(powers))
	for i, power := range powers {
		powerResponses[i] = &dto.PowerResponse{
			ID:          power.ID,
			MenuID:      power.MenuID,
			Title:       power.Title,
			Code:        power.Code,
			Description: power.Description,
			Sort:        power.Sort,
			IsEnable:    power.IsEnable,
		}
	}
	return powerResponses, nil
}

// GetByRoleID 根據角色ID獲取該角色擁有的所有權限
func (s *PowerApplicationService) GetByRoleID(roleID uint) (*dto.PowersByRoleResponse, error) {
	powers, err := s.powerService.GetByRoleID(roleID)
	if err != nil {
		return nil, err
	}

	powerResponses := make([]dto.PowerResponse, len(powers))
	for i, power := range powers {
		powerResponses[i] = dto.PowerResponse{
			ID:          power.ID,
			MenuID:      power.MenuID,
			Title:       power.Title,
			Code:        power.Code,
			Description: power.Description,
			Sort:        power.Sort,
			IsEnable:    power.IsEnable,
		}
	}

	return &dto.PowersByRoleResponse{
		RoleID: roleID,
		Powers: powerResponses,
	}, nil
}

// Create 創建權限
func (s *PowerApplicationService) Create(req *dto.PowerRequest, memberID uint) (*dto.APIResponse, error) {
	err := s.powerService.Create(&entities.Power{
		MenuID:      req.MenuID,
		Title:       req.Title,
		Code:        req.Code,
		Description: req.Description,
		Sort:        req.Sort,
		IsEnable:    req.IsEnable,
	}, memberID)

	if err != nil {
		return &dto.APIResponse{Success: false, Error: err.Error()}, err
	}
	return &dto.APIResponse{Success: true}, nil
}

// Update 更新權限
func (s *PowerApplicationService) Update(req *dto.PowerRequest, memberID uint) (*dto.APIResponse, error) {
	err := s.powerService.Update(&entities.Power{
		ID:          req.ID,
		MenuID:      req.MenuID,
		Title:       req.Title,
		Code:        req.Code,
		Description: req.Description,
		Sort:        req.Sort,
		IsEnable:    req.IsEnable,
	}, memberID)

	if err != nil {
		return &dto.APIResponse{Success: false, Error: err.Error()}, err
	}
	return &dto.APIResponse{Success: true}, nil
}

// Delete 刪除權限
func (s *PowerApplicationService) Delete(id uint) (*dto.APIResponse, error) {
	err := s.powerService.Delete(id)
	if err != nil {
		return &dto.APIResponse{Success: false, Error: err.Error()}, err
	}
	return &dto.APIResponse{Success: true}, nil
}
