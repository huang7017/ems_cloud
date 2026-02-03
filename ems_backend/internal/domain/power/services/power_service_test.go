package services

import (
	"ems_backend/internal/domain/power/entities"
	"errors"
	"testing"
)

// MockPowerRepository 模擬權限 Repository
type MockPowerRepository struct {
	powers          map[uint]*entities.Power
	rolePermissions map[uint]map[string]bool // roleID -> {code -> has permission}
	createError     error
	updateError     error
	deleteError     error
}

func NewMockPowerRepository() *MockPowerRepository {
	return &MockPowerRepository{
		powers:          make(map[uint]*entities.Power),
		rolePermissions: make(map[uint]map[string]bool),
	}
}

func (m *MockPowerRepository) GetAll() ([]*entities.Power, error) {
	powers := make([]*entities.Power, 0, len(m.powers))
	for _, power := range m.powers {
		powers = append(powers, power)
	}
	return powers, nil
}

func (m *MockPowerRepository) GetByID(id uint) (*entities.Power, error) {
	if power, ok := m.powers[id]; ok {
		return power, nil
	}
	return nil, errors.New("power not found")
}

func (m *MockPowerRepository) GetByMenuID(menuID uint) ([]*entities.Power, error) {
	powers := make([]*entities.Power, 0)
	for _, power := range m.powers {
		if power.MenuID == menuID {
			powers = append(powers, power)
		}
	}
	return powers, nil
}

func (m *MockPowerRepository) GetByRoleID(roleID uint) ([]*entities.Power, error) {
	powers := make([]*entities.Power, 0)
	if permissions, ok := m.rolePermissions[roleID]; ok {
		for _, power := range m.powers {
			if permissions[power.Code] {
				powers = append(powers, power)
			}
		}
	}
	return powers, nil
}

func (m *MockPowerRepository) GetByRoleIDs(roleIDs []uint) ([]*entities.Power, error) {
	powerSet := make(map[uint]*entities.Power)
	for _, roleID := range roleIDs {
		if permissions, ok := m.rolePermissions[roleID]; ok {
			for _, power := range m.powers {
				if permissions[power.Code] {
					powerSet[power.ID] = power
				}
			}
		}
	}
	powers := make([]*entities.Power, 0, len(powerSet))
	for _, power := range powerSet {
		powers = append(powers, power)
	}
	return powers, nil
}

func (m *MockPowerRepository) GetByCode(code string) (*entities.Power, error) {
	for _, power := range m.powers {
		if power.Code == code {
			return power, nil
		}
	}
	return nil, errors.New("power not found")
}

func (m *MockPowerRepository) GetByCodes(codes []string) ([]*entities.Power, error) {
	codeSet := make(map[string]bool)
	for _, code := range codes {
		codeSet[code] = true
	}
	powers := make([]*entities.Power, 0)
	for _, power := range m.powers {
		if codeSet[power.Code] {
			powers = append(powers, power)
		}
	}
	return powers, nil
}

func (m *MockPowerRepository) Create(power *entities.Power, memberID uint) error {
	if m.createError != nil {
		return m.createError
	}
	if power.ID == 0 {
		power.ID = uint(len(m.powers) + 1)
	}
	m.powers[power.ID] = power
	return nil
}

func (m *MockPowerRepository) Update(power *entities.Power, memberID uint) error {
	if m.updateError != nil {
		return m.updateError
	}
	m.powers[power.ID] = power
	return nil
}

func (m *MockPowerRepository) Delete(id uint) error {
	if m.deleteError != nil {
		return m.deleteError
	}
	delete(m.powers, id)
	return nil
}

func (m *MockPowerRepository) CheckPermission(roleID uint, code string) (bool, error) {
	if permissions, ok := m.rolePermissions[roleID]; ok {
		return permissions[code], nil
	}
	return false, nil
}

func (m *MockPowerRepository) CheckPermissionByRoleIDs(roleIDs []uint, code string) (bool, error) {
	for _, roleID := range roleIDs {
		if permissions, ok := m.rolePermissions[roleID]; ok {
			if permissions[code] {
				return true, nil
			}
		}
	}
	return false, nil
}

// Tests for PowerService

func TestPowerService_Create(t *testing.T) {
	tests := []struct {
		name      string
		power     *entities.Power
		memberID  uint
		wantError bool
		errorMsg  string
	}{
		{
			name: "成功創建權限",
			power: &entities.Power{
				MenuID:      1,
				Title:       "創建菜單",
				Code:        "menu:create",
				Description: "允許創建新菜單",
				Sort:        1,
				IsEnable:    true,
			},
			memberID:  1,
			wantError: false,
		},
		{
			name: "權限代碼為空",
			power: &entities.Power{
				MenuID:      1,
				Title:       "無效權限",
				Code:        "",
				Description: "代碼為空",
				Sort:        1,
				IsEnable:    true,
			},
			memberID:  1,
			wantError: true,
			errorMsg:  "power code cannot be empty",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := NewMockPowerRepository()
			service := NewPowerService(repo)

			err := service.Create(tt.power, tt.memberID)

			if tt.wantError {
				if err == nil {
					t.Errorf("期望錯誤，但沒有返回錯誤")
				} else if err.Error() != tt.errorMsg {
					t.Errorf("期望錯誤消息 %q，得到 %q", tt.errorMsg, err.Error())
				}
			} else {
				if err != nil {
					t.Errorf("不期望錯誤，但得到: %v", err)
				}
			}
		})
	}
}

func TestPowerService_Update(t *testing.T) {
	tests := []struct {
		name      string
		power     *entities.Power
		memberID  uint
		wantError bool
		errorMsg  string
	}{
		{
			name: "成功更新權限",
			power: &entities.Power{
				ID:          1,
				MenuID:      1,
				Title:       "更新菜單",
				Code:        "menu:update",
				Description: "允許更新菜單",
				Sort:        2,
				IsEnable:    true,
			},
			memberID:  1,
			wantError: false,
		},
		{
			name: "更新時權限代碼為空",
			power: &entities.Power{
				ID:          1,
				MenuID:      1,
				Title:       "無效更新",
				Code:        "",
				Description: "代碼為空",
				Sort:        1,
				IsEnable:    true,
			},
			memberID:  1,
			wantError: true,
			errorMsg:  "power code cannot be empty",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := NewMockPowerRepository()
			service := NewPowerService(repo)

			// 先創建一個權限
			repo.powers[1] = &entities.Power{
				ID:     1,
				MenuID: 1,
				Title:  "原始權限",
				Code:   "menu:create",
			}

			err := service.Update(tt.power, tt.memberID)

			if tt.wantError {
				if err == nil {
					t.Errorf("期望錯誤，但沒有返回錯誤")
				} else if err.Error() != tt.errorMsg {
					t.Errorf("期望錯誤消息 %q，得到 %q", tt.errorMsg, err.Error())
				}
			} else {
				if err != nil {
					t.Errorf("不期望錯誤，但得到: %v", err)
				}
			}
		})
	}
}

func TestPowerService_GetAll(t *testing.T) {
	repo := NewMockPowerRepository()
	service := NewPowerService(repo)

	// 添加測試數據
	repo.powers[1] = &entities.Power{ID: 1, Title: "創建菜單", Code: "menu:create"}
	repo.powers[2] = &entities.Power{ID: 2, Title: "刪除菜單", Code: "menu:delete"}

	powers, err := service.GetAll()
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if len(powers) != 2 {
		t.Errorf("期望 2 個權限，得到 %d", len(powers))
	}
}

func TestPowerService_GetByID(t *testing.T) {
	repo := NewMockPowerRepository()
	service := NewPowerService(repo)

	// 添加測試數據
	repo.powers[1] = &entities.Power{ID: 1, Title: "創建菜單", Code: "menu:create"}

	power, err := service.GetByID(1)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if power.Title != "創建菜單" {
		t.Errorf("期望權限標題為 '創建菜單'，得到 %q", power.Title)
	}

	// 測試不存在的權限
	_, err = service.GetByID(999)
	if err == nil {
		t.Errorf("期望錯誤，但沒有返回錯誤")
	}
}

func TestPowerService_GetByMenuID(t *testing.T) {
	repo := NewMockPowerRepository()
	service := NewPowerService(repo)

	// 添加測試數據
	repo.powers[1] = &entities.Power{ID: 1, MenuID: 1, Title: "創建菜單", Code: "menu:create"}
	repo.powers[2] = &entities.Power{ID: 2, MenuID: 1, Title: "刪除菜單", Code: "menu:delete"}
	repo.powers[3] = &entities.Power{ID: 3, MenuID: 2, Title: "創建用戶", Code: "user:create"}

	powers, err := service.GetByMenuID(1)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if len(powers) != 2 {
		t.Errorf("期望 2 個權限，得到 %d", len(powers))
	}

	// 測試沒有權限的菜單
	powers, err = service.GetByMenuID(999)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if len(powers) != 0 {
		t.Errorf("期望 0 個權限，得到 %d", len(powers))
	}
}

func TestPowerService_GetByRoleID(t *testing.T) {
	repo := NewMockPowerRepository()
	service := NewPowerService(repo)

	// 添加測試數據
	repo.powers[1] = &entities.Power{ID: 1, Title: "創建菜單", Code: "menu:create"}
	repo.powers[2] = &entities.Power{ID: 2, Title: "刪除菜單", Code: "menu:delete"}

	// 設置角色權限
	repo.rolePermissions[1] = map[string]bool{
		"menu:create": true,
		"menu:delete": true,
	}

	powers, err := service.GetByRoleID(1)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if len(powers) != 2 {
		t.Errorf("期望 2 個權限，得到 %d", len(powers))
	}

	// 測試沒有權限的角色
	powers, err = service.GetByRoleID(999)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if len(powers) != 0 {
		t.Errorf("期望 0 個權限，得到 %d", len(powers))
	}
}

func TestPowerService_GetByRoleIDs(t *testing.T) {
	repo := NewMockPowerRepository()
	service := NewPowerService(repo)

	// 添加測試數據
	repo.powers[1] = &entities.Power{ID: 1, Title: "創建菜單", Code: "menu:create"}
	repo.powers[2] = &entities.Power{ID: 2, Title: "刪除菜單", Code: "menu:delete"}
	repo.powers[3] = &entities.Power{ID: 3, Title: "創建用戶", Code: "user:create"}

	// 設置角色權限
	repo.rolePermissions[1] = map[string]bool{
		"menu:create": true,
	}
	repo.rolePermissions[2] = map[string]bool{
		"menu:delete": true,
		"user:create": true,
	}

	// 測試合併多角色權限
	powers, err := service.GetByRoleIDs([]uint{1, 2})
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if len(powers) != 3 {
		t.Errorf("期望 3 個權限，得到 %d", len(powers))
	}

	// 測試空角色列表
	powers, err = service.GetByRoleIDs([]uint{})
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if len(powers) != 0 {
		t.Errorf("期望 0 個權限，得到 %d", len(powers))
	}
}

func TestPowerService_Delete(t *testing.T) {
	repo := NewMockPowerRepository()
	service := NewPowerService(repo)

	// 添加測試數據
	repo.powers[1] = &entities.Power{ID: 1, Title: "創建菜單", Code: "menu:create"}

	err := service.Delete(1)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	// 驗證已刪除
	_, exists := repo.powers[1]
	if exists {
		t.Errorf("權限應該已被刪除")
	}
}

func TestPowerService_CheckPermission(t *testing.T) {
	repo := NewMockPowerRepository()
	service := NewPowerService(repo)

	// 設置角色權限
	repo.rolePermissions[1] = map[string]bool{
		"menu:create": true,
		"menu:delete": true,
	}

	// 測試有權限的情況
	hasPermission, err := service.CheckPermission(1, "menu:create")
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if !hasPermission {
		t.Errorf("期望有權限，但返回無權限")
	}

	// 測試無權限的情況
	hasPermission, err = service.CheckPermission(1, "user:delete")
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if hasPermission {
		t.Errorf("期望無權限，但返回有權限")
	}

	// 測試不存在的角色
	hasPermission, err = service.CheckPermission(999, "menu:create")
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if hasPermission {
		t.Errorf("期望無權限，但返回有權限")
	}
}

func TestPowerService_CheckPermissionByRoleIDs(t *testing.T) {
	repo := NewMockPowerRepository()
	service := NewPowerService(repo)

	// 設置角色權限
	repo.rolePermissions[1] = map[string]bool{
		"menu:create": true,
	}
	repo.rolePermissions[2] = map[string]bool{
		"menu:delete": true,
	}

	// 測試其中一個角色有權限
	hasPermission, err := service.CheckPermissionByRoleIDs([]uint{1, 2}, "menu:create")
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if !hasPermission {
		t.Errorf("期望有權限，但返回無權限")
	}

	// 測試所有角色都沒有權限
	hasPermission, err = service.CheckPermissionByRoleIDs([]uint{1, 2}, "user:create")
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if hasPermission {
		t.Errorf("期望無權限，但返回有權限")
	}

	// 測試空角色列表
	hasPermission, err = service.CheckPermissionByRoleIDs([]uint{}, "menu:create")
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if hasPermission {
		t.Errorf("期望無權限，但返回有權限")
	}
}
