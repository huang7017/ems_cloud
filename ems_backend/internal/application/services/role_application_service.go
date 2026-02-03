package services

import (
	"ems_backend/internal/application/dto"
	"ems_backend/internal/domain/role/entities"
	"ems_backend/internal/domain/role/services"
)

type RoleApplicationService struct {
	roleService *services.RoleService
}

func NewRoleApplicationService(roleService *services.RoleService) *RoleApplicationService {
	return &RoleApplicationService{roleService: roleService}
}

// GetAll 獲取所有角色
func (s *RoleApplicationService) GetAll() ([]*dto.RoleResponse, error) {
	roles, err := s.roleService.GetAll()
	if err != nil {
		return nil, err
	}

	roleResponses := make([]*dto.RoleResponse, len(roles))
	for i, role := range roles {
		roleResponses[i] = &dto.RoleResponse{
			ID:          role.ID,
			Title:       role.Title,
			Description: role.Description,
			Sort:        role.Sort,
			IsEnable:    role.IsEnable,
		}
	}
	return roleResponses, nil
}

// GetByID 根據ID獲取角色
func (s *RoleApplicationService) GetByID(id uint) (*dto.RoleResponse, error) {
	role, err := s.roleService.GetByID(id)
	if err != nil {
		return nil, err
	}

	return &dto.RoleResponse{
		ID:          role.ID,
		Title:       role.Title,
		Description: role.Description,
		Sort:        role.Sort,
		IsEnable:    role.IsEnable,
	}, nil
}

// Create 創建角色
func (s *RoleApplicationService) Create(req *dto.RoleRequest, memberID uint) (*dto.APIResponse, error) {
	err := s.roleService.Create(&entities.Role{
		Title:       req.Title,
		Description: req.Description,
		Sort:        req.Sort,
		IsEnable:    req.IsEnable,
	}, memberID)

	if err != nil {
		return &dto.APIResponse{Success: false, Error: err.Error()}, err
	}
	return &dto.APIResponse{Success: true}, nil
}

// Update 更新角色
func (s *RoleApplicationService) Update(req *dto.RoleRequest, memberID uint) (*dto.APIResponse, error) {
	err := s.roleService.Update(&entities.Role{
		ID:          req.ID,
		Title:       req.Title,
		Description: req.Description,
		Sort:        req.Sort,
		IsEnable:    req.IsEnable,
	}, memberID)

	if err != nil {
		return &dto.APIResponse{Success: false, Error: err.Error()}, err
	}
	return &dto.APIResponse{Success: true}, nil
}

// Delete 刪除角色
func (s *RoleApplicationService) Delete(id uint) (*dto.APIResponse, error) {
	err := s.roleService.Delete(id)
	if err != nil {
		return &dto.APIResponse{Success: false, Error: err.Error()}, err
	}
	return &dto.APIResponse{Success: true}, nil
}

// AssignPowers 為角色分配權限
func (s *RoleApplicationService) AssignPowers(roleID uint, req *dto.AssignPowersRequest, memberID uint) (*dto.APIResponse, error) {
	err := s.roleService.AssignPowers(roleID, req.PowerIDs, memberID)
	if err != nil {
		return &dto.APIResponse{Success: false, Error: err.Error()}, err
	}
	return &dto.APIResponse{Success: true}, nil
}

// RemovePowers 移除角色的權限
func (s *RoleApplicationService) RemovePowers(roleID uint, req *dto.AssignPowersRequest) (*dto.APIResponse, error) {
	err := s.roleService.RemovePowers(roleID, req.PowerIDs)
	if err != nil {
		return &dto.APIResponse{Success: false, Error: err.Error()}, err
	}
	return &dto.APIResponse{Success: true}, nil
}

// AssignMembers 將角色分配給成員
func (s *RoleApplicationService) AssignMembers(roleID uint, req *dto.AssignMembersRequest, memberID uint) (*dto.APIResponse, error) {
	err := s.roleService.AssignMembers(roleID, req.MemberIDs, memberID)
	if err != nil {
		return &dto.APIResponse{Success: false, Error: err.Error()}, err
	}
	return &dto.APIResponse{Success: true}, nil
}

// RemoveMembers 從角色中移除成員
func (s *RoleApplicationService) RemoveMembers(roleID uint, req *dto.AssignMembersRequest) (*dto.APIResponse, error) {
	err := s.roleService.RemoveMembers(roleID, req.MemberIDs)
	if err != nil {
		return &dto.APIResponse{Success: false, Error: err.Error()}, err
	}
	return &dto.APIResponse{Success: true}, nil
}

// GetRoleMembers 獲取角色下的所有成員ID
func (s *RoleApplicationService) GetRoleMembers(roleID uint) (*dto.RoleMembersResponse, error) {
	memberIDs, err := s.roleService.GetRoleMembers(roleID)
	if err != nil {
		return nil, err
	}

	return &dto.RoleMembersResponse{
		RoleID:    roleID,
		MemberIDs: memberIDs,
	}, nil
}

// GetRolePowers 獲取角色擁有的所有權限（完整對象）
func (s *RoleApplicationService) GetRolePowers(roleID uint) ([]*dto.PowerResponse, error) {
	// 獲取角色的權限ID列表
	powerIDs, err := s.roleService.GetRolePowers(roleID)
	if err != nil {
		return nil, err
	}

	// 如果沒有權限，返回空列表
	if len(powerIDs) == 0 {
		return []*dto.PowerResponse{}, nil
	}

	// 獲取完整的權限對象
	powers, err := s.roleService.GetPowersByIDs(powerIDs)
	if err != nil {
		return nil, err
	}

	// 轉換為 DTO
	powerDTOs := make([]*dto.PowerResponse, 0, len(powers))
	for _, power := range powers {
		powerDTOs = append(powerDTOs, &dto.PowerResponse{
			ID:          power.ID,
			MenuID:      power.MenuID,
			Title:       power.Title,
			Code:        power.Code,
			Description: power.Description,
			Sort:        power.Sort,
			IsEnable:    power.IsEnable,
		})
	}

	return powerDTOs, nil
}
