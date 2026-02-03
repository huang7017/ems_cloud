package repositories

import (
	"ems_backend/internal/domain/role/entities"
	"ems_backend/internal/infrastructure/persistence/models"
	"time"

	"gorm.io/gorm"
)

type RoleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) *RoleRepository {
	return &RoleRepository{db: db}
}

// GetAll 獲取所有角色
func (r *RoleRepository) GetAll() ([]*entities.Role, error) {
	var roles []*models.RoleModel
	if err := r.db.Find(&roles).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(roles), nil
}

// GetByID 根據ID獲取角色
func (r *RoleRepository) GetByID(id uint) (*entities.Role, error) {
	var role models.RoleModel
	if err := r.db.First(&role, id).Error; err != nil {
		return nil, err
	}
	return r.mapToDomainSingle(&role), nil
}

// GetByMemberID 根據成員ID獲取該成員的所有角色
func (r *RoleRepository) GetByMemberID(memberID uint) ([]*entities.Role, error) {
	var roles []*entities.Role

	sql := `
	SELECT r.id, r.title, r.description, r.sort, r.is_enable
	FROM role r
	INNER JOIN member_role mr ON mr.role_id = r.id
	WHERE mr.member_id = ? AND r.is_enable = TRUE
	ORDER BY r.sort NULLS LAST
	`

	if err := r.db.Raw(sql, memberID).Scan(&roles).Error; err != nil {
		return nil, err
	}
	return roles, nil
}

// Create 創建角色
func (r *RoleRepository) Create(role *entities.Role, memberID uint) error {
	return r.db.Create(&models.RoleModel{
		Title:       role.Title,
		Description: role.Description,
		Sort:        role.Sort,
		IsEnable:    role.IsEnable,
		CreateID:    memberID,
		CreateTime:  time.Now(),
		ModifyID:    memberID,
		ModifyTime:  time.Now(),
	}).Error
}

// Update 更新角色
func (r *RoleRepository) Update(role *entities.Role, memberID uint) error {
	return r.db.Model(&models.RoleModel{}).Where("id = ?", role.ID).Updates(map[string]interface{}{
		"title":       role.Title,
		"description": role.Description,
		"sort":        role.Sort,
		"is_enable":   role.IsEnable,
		"modify_id":   memberID,
		"modify_time": time.Now(),
	}).Error
}

// Delete 刪除角色
func (r *RoleRepository) Delete(id uint) error {
	// 使用事務刪除角色及其相關數據
	return r.db.Transaction(func(tx *gorm.DB) error {
		// 刪除 role_power 中的關聯
		if err := tx.Where("role_id = ?", id).Delete(&models.RolePowerModel{}).Error; err != nil {
			return err
		}

		// 刪除 member_role 中的關聯（這裡使用原生 SQL 因為可能沒有對應的 model）
		if err := tx.Exec("DELETE FROM member_role WHERE role_id = ?", id).Error; err != nil {
			return err
		}

		// 刪除角色本身
		if err := tx.Delete(&models.RoleModel{}, id).Error; err != nil {
			return err
		}

		return nil
	})
}

// AssignPowers 為角色分配權限
func (r *RoleRepository) AssignPowers(roleID uint, powerIDs []uint, memberID uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// 獲取權限對應的菜單ID
		var powers []*models.PowerModel
		if err := tx.Where("id IN ?", powerIDs).Find(&powers).Error; err != nil {
			return err
		}

		// 為每個權限創建 role_power 記錄
		for _, power := range powers {
			rolePower := &models.RolePowerModel{
				RoleID:     roleID,
				MenuID:     power.MenuID,
				PowerID:    &power.ID,
				CreateID:   memberID,
				CreateTime: time.Now(),
				ModifyID:   memberID,
				ModifyTime: time.Now(),
			}

			if err := tx.Create(rolePower).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// RemovePowers 移除角色的權限
func (r *RoleRepository) RemovePowers(roleID uint, powerIDs []uint) error {
	return r.db.Where("role_id = ? AND power_id IN ?", roleID, powerIDs).
		Delete(&models.RolePowerModel{}).Error
}

// AssignMembers 將角色分配給成員
func (r *RoleRepository) AssignMembers(roleID uint, memberIDs []uint, memberID uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// 使用原生 SQL 批量插入 member_role
		for _, memID := range memberIDs {
			sql := `
				INSERT INTO member_role (role_id, member_id)
				VALUES (?, ?)
				ON CONFLICT DO NOTHING
			`
			if err := tx.Exec(sql, roleID, memID).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// RemoveMembers 從角色中移除成員
func (r *RoleRepository) RemoveMembers(roleID uint, memberIDs []uint) error {
	return r.db.Exec("DELETE FROM member_role WHERE role_id = ? AND member_id IN ?", roleID, memberIDs).Error
}

// GetRoleMembers 獲取角色下的所有成員ID
func (r *RoleRepository) GetRoleMembers(roleID uint) ([]uint, error) {
	var memberIDs []uint

	sql := `SELECT member_id FROM member_role WHERE role_id = ?`

	if err := r.db.Raw(sql, roleID).Scan(&memberIDs).Error; err != nil {
		return nil, err
	}

	return memberIDs, nil
}

// GetRolePowers 獲取角色擁有的所有權限ID
func (r *RoleRepository) GetRolePowers(roleID uint) ([]uint, error) {
	var powerIDs []uint

	sql := `SELECT power_id FROM role_power WHERE role_id = ? AND power_id IS NOT NULL`

	if err := r.db.Raw(sql, roleID).Scan(&powerIDs).Error; err != nil {
		return nil, err
	}

	return powerIDs, nil
}

// mapToDomain 將多個模型轉換為領域實體
func (r *RoleRepository) mapToDomain(roles []*models.RoleModel) []*entities.Role {
	roleEntities := make([]*entities.Role, len(roles))
	for i, role := range roles {
		roleEntities[i] = r.mapToDomainSingle(role)
	}
	return roleEntities
}

// mapToDomainSingle 將單個模型轉換為領域實體
func (r *RoleRepository) mapToDomainSingle(role *models.RoleModel) *entities.Role {
	return &entities.Role{
		ID:          role.ID,
		Title:       role.Title,
		Description: role.Description,
		Sort:        role.Sort,
		IsEnable:    role.IsEnable,
	}
}
