package services

import (
	powerEntities "ems_backend/internal/domain/power/entities"
	powerRepos "ems_backend/internal/domain/power/repositories"
	"ems_backend/internal/domain/role/entities"
	"ems_backend/internal/domain/role/repositories"
	"fmt"
)

type RoleService struct {
	roleRepo  repositories.RoleRepository
	powerRepo powerRepos.PowerRepository
}

func NewRoleService(roleRepo repositories.RoleRepository, powerRepo powerRepos.PowerRepository) *RoleService {
	return &RoleService{
		roleRepo:  roleRepo,
		powerRepo: powerRepo,
	}
}

// GetAll 獲取所有角色
func (s *RoleService) GetAll() ([]*entities.Role, error) {
	return s.roleRepo.GetAll()
}

// GetByID 根據ID獲取角色
func (s *RoleService) GetByID(id uint) (*entities.Role, error) {
	return s.roleRepo.GetByID(id)
}

// GetByMemberID 根據成員ID獲取該成員的所有角色
func (s *RoleService) GetByMemberID(memberID uint) ([]*entities.Role, error) {
	return s.roleRepo.GetByMemberID(memberID)
}

// Create 創建角色
func (s *RoleService) Create(role *entities.Role, memberID uint) error {
	// 驗證角色標題
	if role.Title == "" {
		return fmt.Errorf("role title cannot be empty")
	}

	return s.roleRepo.Create(role, memberID)
}

// Update 更新角色
func (s *RoleService) Update(role *entities.Role, memberID uint) error {
	// 驗證角色標題
	if role.Title == "" {
		return fmt.Errorf("role title cannot be empty")
	}

	return s.roleRepo.Update(role, memberID)
}

// Delete 刪除角色
func (s *RoleService) Delete(id uint) error {
	return s.roleRepo.Delete(id)
}

// AssignPowers 為角色分配權限
func (s *RoleService) AssignPowers(roleID uint, powerIDs []uint, memberID uint) error {
	if roleID == 0 {
		return fmt.Errorf("invalid role ID")
	}
	if len(powerIDs) == 0 {
		return fmt.Errorf("no power IDs provided")
	}

	return s.roleRepo.AssignPowers(roleID, powerIDs, memberID)
}

// RemovePowers 移除角色的權限
func (s *RoleService) RemovePowers(roleID uint, powerIDs []uint) error {
	if roleID == 0 {
		return fmt.Errorf("invalid role ID")
	}
	if len(powerIDs) == 0 {
		return fmt.Errorf("no power IDs provided")
	}

	return s.roleRepo.RemovePowers(roleID, powerIDs)
}

// AssignMembers 將角色分配給成員
func (s *RoleService) AssignMembers(roleID uint, memberIDs []uint, memberID uint) error {
	if roleID == 0 {
		return fmt.Errorf("invalid role ID")
	}
	if len(memberIDs) == 0 {
		return fmt.Errorf("no member IDs provided")
	}

	return s.roleRepo.AssignMembers(roleID, memberIDs, memberID)
}

// RemoveMembers 從角色中移除成員
func (s *RoleService) RemoveMembers(roleID uint, memberIDs []uint) error {
	if roleID == 0 {
		return fmt.Errorf("invalid role ID")
	}
	if len(memberIDs) == 0 {
		return fmt.Errorf("no member IDs provided")
	}

	return s.roleRepo.RemoveMembers(roleID, memberIDs)
}

// GetRoleMembers 獲取角色下的所有成員ID
func (s *RoleService) GetRoleMembers(roleID uint) ([]uint, error) {
	return s.roleRepo.GetRoleMembers(roleID)
}

// GetRolePowers 獲取角色擁有的所有權限ID
func (s *RoleService) GetRolePowers(roleID uint) ([]uint, error) {
	return s.roleRepo.GetRolePowers(roleID)
}

// GetPowersByIDs 根據權限ID列表獲取完整的權限對象
func (s *RoleService) GetPowersByIDs(powerIDs []uint) ([]*powerEntities.Power, error) {
	if len(powerIDs) == 0 {
		return []*powerEntities.Power{}, nil
	}

	powers := make([]*powerEntities.Power, 0, len(powerIDs))
	for _, id := range powerIDs {
		power, err := s.powerRepo.GetByID(id)
		if err != nil {
			// 如果某個權限不存在，跳過
			continue
		}
		powers = append(powers, power)
	}

	return powers, nil
}
