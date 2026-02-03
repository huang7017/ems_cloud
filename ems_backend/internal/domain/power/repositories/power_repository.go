package repositories

import "ems_backend/internal/domain/power/entities"

type PowerRepository interface {
	// GetAll 獲取所有權限
	GetAll() ([]*entities.Power, error)

	// GetByID 根據ID獲取權限
	GetByID(id uint) (*entities.Power, error)

	// GetByMenuID 根據菜單ID獲取權限
	GetByMenuID(menuID uint) ([]*entities.Power, error)

	// GetByRoleID 根據角色ID獲取該角色擁有的所有權限
	GetByRoleID(roleID uint) ([]*entities.Power, error)

	// GetByRoleIDs 根據多個角色ID獲取所有權限（合併多角色權限）
	GetByRoleIDs(roleIDs []uint) ([]*entities.Power, error)

	// GetByCode 根據權限代碼獲取權限
	GetByCode(code string) (*entities.Power, error)

	// GetByCodes 根據多個權限代碼獲取權限
	GetByCodes(codes []string) ([]*entities.Power, error)

	// Create 創建權限
	Create(power *entities.Power, memberID uint) error

	// Update 更新權限
	Update(power *entities.Power, memberID uint) error

	// Delete 刪除權限
	Delete(id uint) error

	// CheckPermission 檢查角色是否擁有某個權限代碼
	CheckPermission(roleID uint, code string) (bool, error)

	// CheckPermissionByRoleIDs 檢查多個角色是否擁有某個權限代碼
	CheckPermissionByRoleIDs(roleIDs []uint, code string) (bool, error)
}
