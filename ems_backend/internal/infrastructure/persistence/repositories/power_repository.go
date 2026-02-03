package repositories

import (
	"ems_backend/internal/domain/power/entities"
	"ems_backend/internal/infrastructure/persistence/models"
	"time"

	"gorm.io/gorm"
)

type PowerRepository struct {
	db *gorm.DB
}

func NewPowerRepository(db *gorm.DB) *PowerRepository {
	return &PowerRepository{db: db}
}

// GetAll 獲取所有權限
func (r *PowerRepository) GetAll() ([]*entities.Power, error) {
	var powers []*models.PowerModel
	if err := r.db.Find(&powers).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(powers), nil
}

// GetByID 根據ID獲取權限
func (r *PowerRepository) GetByID(id uint) (*entities.Power, error) {
	var power models.PowerModel
	if err := r.db.First(&power, id).Error; err != nil {
		return nil, err
	}
	return r.mapToDomainSingle(&power), nil
}

// GetByMenuID 根據菜單ID獲取權限
func (r *PowerRepository) GetByMenuID(menuID uint) ([]*entities.Power, error) {
	var powers []*models.PowerModel
	if err := r.db.Where("menu_id = ?", menuID).Find(&powers).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(powers), nil
}

// GetByRoleID 根據角色ID獲取該角色擁有的所有權限
func (r *PowerRepository) GetByRoleID(roleID uint) ([]*entities.Power, error) {
	var powers []*entities.Power

	sql := `
	SELECT DISTINCT p.id, p.menu_id, p.title, p.code, p.description, p.sort, p.is_enable
	FROM power p
	INNER JOIN role_power rp ON rp.power_id = p.id
	WHERE rp.role_id = ? AND p.is_enable = TRUE
	ORDER BY p.menu_id, p.sort NULLS LAST
	`

	if err := r.db.Raw(sql, roleID).Scan(&powers).Error; err != nil {
		return nil, err
	}
	return powers, nil
}

// GetByRoleIDs 根據多個角色ID獲取所有權限（合併多角色權限）
func (r *PowerRepository) GetByRoleIDs(roleIDs []uint) ([]*entities.Power, error) {
	var powers []*entities.Power

	sql := `
	SELECT DISTINCT p.id, p.menu_id, p.title, p.code, p.description, p.sort, p.is_enable
	FROM power p
	INNER JOIN role_power rp ON rp.power_id = p.id
	WHERE rp.role_id IN ? AND p.is_enable = TRUE
	ORDER BY p.menu_id, p.sort NULLS LAST
	`

	if err := r.db.Raw(sql, roleIDs).Scan(&powers).Error; err != nil {
		return nil, err
	}
	return powers, nil
}

// GetByCode 根據權限代碼獲取權限
func (r *PowerRepository) GetByCode(code string) (*entities.Power, error) {
	var power models.PowerModel
	if err := r.db.Where("code = ?", code).First(&power).Error; err != nil {
		return nil, err
	}
	return r.mapToDomainSingle(&power), nil
}

// GetByCodes 根據多個權限代碼獲取權限
func (r *PowerRepository) GetByCodes(codes []string) ([]*entities.Power, error) {
	var powers []*models.PowerModel
	if err := r.db.Where("code IN ?", codes).Find(&powers).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(powers), nil
}

// Create 創建權限
func (r *PowerRepository) Create(power *entities.Power, memberID uint) error {
	return r.db.Create(&models.PowerModel{
		MenuID:      power.MenuID,
		Title:       power.Title,
		Code:        power.Code,
		Description: power.Description,
		Sort:        power.Sort,
		IsEnable:    power.IsEnable,
		CreateID:    memberID,
		CreateTime:  time.Now(),
		ModifyID:    memberID,
		ModifyTime:  time.Now(),
	}).Error
}

// Update 更新權限
func (r *PowerRepository) Update(power *entities.Power, memberID uint) error {
	return r.db.Model(&models.PowerModel{}).Where("id = ?", power.ID).Updates(map[string]interface{}{
		"menu_id":     power.MenuID,
		"title":       power.Title,
		"code":        power.Code,
		"description": power.Description,
		"sort":        power.Sort,
		"is_enable":   power.IsEnable,
		"modify_id":   memberID,
		"modify_time": time.Now(),
	}).Error
}

// Delete 刪除權限
func (r *PowerRepository) Delete(id uint) error {
	return r.db.Delete(&models.PowerModel{}, id).Error
}

// CheckPermission 檢查角色是否擁有某個權限代碼
func (r *PowerRepository) CheckPermission(roleID uint, code string) (bool, error) {
	var count int64

	sql := `
	SELECT COUNT(*)
	FROM role_power rp
	INNER JOIN power p ON p.id = rp.power_id
	WHERE rp.role_id = ? AND p.code = ? AND p.is_enable = TRUE
	`

	if err := r.db.Raw(sql, roleID, code).Count(&count).Error; err != nil {
		return false, err
	}

	return count > 0, nil
}

// CheckPermissionByRoleIDs 檢查多個角色是否擁有某個權限代碼
func (r *PowerRepository) CheckPermissionByRoleIDs(roleIDs []uint, code string) (bool, error) {
	var count int64

	sql := `
	SELECT COUNT(*)
	FROM role_power rp
	INNER JOIN power p ON p.id = rp.power_id
	WHERE rp.role_id IN ? AND p.code = ? AND p.is_enable = TRUE
	`

	if err := r.db.Raw(sql, roleIDs, code).Count(&count).Error; err != nil {
		return false, err
	}

	return count > 0, nil
}

// mapToDomain 將多個模型轉換為領域實體
func (r *PowerRepository) mapToDomain(powers []*models.PowerModel) []*entities.Power {
	powerEntities := make([]*entities.Power, len(powers))
	for i, power := range powers {
		powerEntities[i] = r.mapToDomainSingle(power)
	}
	return powerEntities
}

// mapToDomainSingle 將單個模型轉換為領域實體
func (r *PowerRepository) mapToDomainSingle(power *models.PowerModel) *entities.Power {
	return &entities.Power{
		ID:          power.ID,
		MenuID:      power.MenuID,
		Title:       power.Title,
		Code:        power.Code,
		Description: power.Description,
		Sort:        power.Sort,
		IsEnable:    power.IsEnable,
	}
}
