package repositories

import "ems_backend/internal/domain/role/entities"

type RoleRepository interface {
	// GetAll 獲取所有角色
	GetAll() ([]*entities.Role, error)

	// GetByID 根據ID獲取角色
	GetByID(id uint) (*entities.Role, error)

	// GetByMemberID 根據成員ID獲取該成員的所有角色
	GetByMemberID(memberID uint) ([]*entities.Role, error)

	// Create 創建角色
	Create(role *entities.Role, memberID uint) error

	// Update 更新角色
	Update(role *entities.Role, memberID uint) error

	// Delete 刪除角色
	Delete(id uint) error

	// AssignPowers 為角色分配權限
	AssignPowers(roleID uint, powerIDs []uint, memberID uint) error

	// RemovePowers 移除角色的權限
	RemovePowers(roleID uint, powerIDs []uint) error

	// AssignMembers 將角色分配給成員
	AssignMembers(roleID uint, memberIDs []uint, memberID uint) error

	// RemoveMembers 從角色中移除成員
	RemoveMembers(roleID uint, memberIDs []uint) error

	// GetRoleMembers 獲取角色下的所有成員ID
	GetRoleMembers(roleID uint) ([]uint, error)

	// GetRolePowers 獲取角色擁有的所有權限ID
	GetRolePowers(roleID uint) ([]uint, error)
}
