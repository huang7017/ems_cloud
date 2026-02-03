package services

import (
	"ems_backend/internal/domain/power/entities"
	"ems_backend/internal/domain/power/repositories"
	"fmt"
)

type PowerService struct {
	powerRepo repositories.PowerRepository
}

func NewPowerService(powerRepo repositories.PowerRepository) *PowerService {
	return &PowerService{powerRepo: powerRepo}
}

// GetAll 獲取所有權限
func (s *PowerService) GetAll() ([]*entities.Power, error) {
	return s.powerRepo.GetAll()
}

// GetByID 根據ID獲取權限
func (s *PowerService) GetByID(id uint) (*entities.Power, error) {
	return s.powerRepo.GetByID(id)
}

// GetByMenuID 根據菜單ID獲取權限
func (s *PowerService) GetByMenuID(menuID uint) ([]*entities.Power, error) {
	return s.powerRepo.GetByMenuID(menuID)
}

// GetByRoleID 根據角色ID獲取該角色擁有的所有權限
func (s *PowerService) GetByRoleID(roleID uint) ([]*entities.Power, error) {
	return s.powerRepo.GetByRoleID(roleID)
}

// GetByRoleIDs 根據多個角色ID獲取所有權限（合併多角色權限）
func (s *PowerService) GetByRoleIDs(roleIDs []uint) ([]*entities.Power, error) {
	if len(roleIDs) == 0 {
		return []*entities.Power{}, nil
	}
	return s.powerRepo.GetByRoleIDs(roleIDs)
}

// Create 創建權限
func (s *PowerService) Create(power *entities.Power, memberID uint) error {
	// 驗證權限代碼格式 (例如: menu:create, user:delete)
	if err := s.validatePowerCode(power.Code); err != nil {
		return err
	}

	return s.powerRepo.Create(power, memberID)
}

// Update 更新權限
func (s *PowerService) Update(power *entities.Power, memberID uint) error {
	// 驗證權限代碼格式
	if err := s.validatePowerCode(power.Code); err != nil {
		return err
	}

	return s.powerRepo.Update(power, memberID)
}

// Delete 刪除權限
func (s *PowerService) Delete(id uint) error {
	return s.powerRepo.Delete(id)
}

// CheckPermission 檢查角色是否擁有某個權限代碼
func (s *PowerService) CheckPermission(roleID uint, code string) (bool, error) {
	return s.powerRepo.CheckPermission(roleID, code)
}

// CheckPermissionByRoleIDs 檢查多個角色是否擁有某個權限代碼（任意一個角色擁有即可）
func (s *PowerService) CheckPermissionByRoleIDs(roleIDs []uint, code string) (bool, error) {
	if len(roleIDs) == 0 {
		return false, nil
	}
	return s.powerRepo.CheckPermissionByRoleIDs(roleIDs, code)
}

// validatePowerCode 驗證權限代碼格式
func (s *PowerService) validatePowerCode(code string) error {
	if code == "" {
		return fmt.Errorf("power code cannot be empty")
	}

	// 權限代碼格式應為 "resource:action"，例如 "menu:create", "user:delete"
	// 可以根據需要添加更嚴格的驗證邏輯

	return nil
}
