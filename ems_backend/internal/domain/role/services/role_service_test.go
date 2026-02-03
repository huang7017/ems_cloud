package services

import (
	powerEntities "ems_backend/internal/domain/power/entities"
	"ems_backend/internal/domain/role/entities"
	"errors"
	"testing"
)

// MockRoleRepository 模擬角色 Repository
type MockRoleRepository struct {
	roles        map[uint]*entities.Role
	memberRoles  map[uint][]uint // memberID -> roleIDs
	rolePowers   map[uint][]uint // roleID -> powerIDs
	roleMembers  map[uint][]uint // roleID -> memberIDs
	createError  error
	updateError  error
	deleteError  error
}

func NewMockRoleRepository() *MockRoleRepository {
	return &MockRoleRepository{
		roles:       make(map[uint]*entities.Role),
		memberRoles: make(map[uint][]uint),
		rolePowers:  make(map[uint][]uint),
		roleMembers: make(map[uint][]uint),
	}
}

func (m *MockRoleRepository) GetAll() ([]*entities.Role, error) {
	roles := make([]*entities.Role, 0, len(m.roles))
	for _, role := range m.roles {
		roles = append(roles, role)
	}
	return roles, nil
}

func (m *MockRoleRepository) GetByID(id uint) (*entities.Role, error) {
	if role, ok := m.roles[id]; ok {
		return role, nil
	}
	return nil, errors.New("role not found")
}

func (m *MockRoleRepository) GetByMemberID(memberID uint) ([]*entities.Role, error) {
	roleIDs := m.memberRoles[memberID]
	roles := make([]*entities.Role, 0, len(roleIDs))
	for _, id := range roleIDs {
		if role, ok := m.roles[id]; ok {
			roles = append(roles, role)
		}
	}
	return roles, nil
}

func (m *MockRoleRepository) Create(role *entities.Role, memberID uint) error {
	if m.createError != nil {
		return m.createError
	}
	if role.ID == 0 {
		role.ID = uint(len(m.roles) + 1)
	}
	m.roles[role.ID] = role
	return nil
}

func (m *MockRoleRepository) Update(role *entities.Role, memberID uint) error {
	if m.updateError != nil {
		return m.updateError
	}
	m.roles[role.ID] = role
	return nil
}

func (m *MockRoleRepository) Delete(id uint) error {
	if m.deleteError != nil {
		return m.deleteError
	}
	delete(m.roles, id)
	return nil
}

func (m *MockRoleRepository) AssignPowers(roleID uint, powerIDs []uint, memberID uint) error {
	m.rolePowers[roleID] = powerIDs
	return nil
}

func (m *MockRoleRepository) RemovePowers(roleID uint, powerIDs []uint) error {
	existing := m.rolePowers[roleID]
	filtered := make([]uint, 0)
	for _, id := range existing {
		remove := false
		for _, removeID := range powerIDs {
			if id == removeID {
				remove = true
				break
			}
		}
		if !remove {
			filtered = append(filtered, id)
		}
	}
	m.rolePowers[roleID] = filtered
	return nil
}

func (m *MockRoleRepository) AssignMembers(roleID uint, memberIDs []uint, memberID uint) error {
	m.roleMembers[roleID] = memberIDs
	return nil
}

func (m *MockRoleRepository) RemoveMembers(roleID uint, memberIDs []uint) error {
	existing := m.roleMembers[roleID]
	filtered := make([]uint, 0)
	for _, id := range existing {
		remove := false
		for _, removeID := range memberIDs {
			if id == removeID {
				remove = true
				break
			}
		}
		if !remove {
			filtered = append(filtered, id)
		}
	}
	m.roleMembers[roleID] = filtered
	return nil
}

func (m *MockRoleRepository) GetRoleMembers(roleID uint) ([]uint, error) {
	return m.roleMembers[roleID], nil
}

func (m *MockRoleRepository) GetRolePowers(roleID uint) ([]uint, error) {
	return m.rolePowers[roleID], nil
}

// MockPowerRepository 模擬權限 Repository
type MockPowerRepository struct {
	powers map[uint]*powerEntities.Power
}

func NewMockPowerRepository() *MockPowerRepository {
	return &MockPowerRepository{
		powers: make(map[uint]*powerEntities.Power),
	}
}

func (m *MockPowerRepository) GetAll() ([]*powerEntities.Power, error) {
	powers := make([]*powerEntities.Power, 0, len(m.powers))
	for _, power := range m.powers {
		powers = append(powers, power)
	}
	return powers, nil
}

func (m *MockPowerRepository) GetByID(id uint) (*powerEntities.Power, error) {
	if power, ok := m.powers[id]; ok {
		return power, nil
	}
	return nil, errors.New("power not found")
}

func (m *MockPowerRepository) GetByMenuID(menuID uint) ([]*powerEntities.Power, error) {
	powers := make([]*powerEntities.Power, 0)
	for _, power := range m.powers {
		if power.MenuID == menuID {
			powers = append(powers, power)
		}
	}
	return powers, nil
}

func (m *MockPowerRepository) GetByRoleID(roleID uint) ([]*powerEntities.Power, error) {
	return nil, nil
}

func (m *MockPowerRepository) GetByRoleIDs(roleIDs []uint) ([]*powerEntities.Power, error) {
	return nil, nil
}

func (m *MockPowerRepository) GetByCode(code string) (*powerEntities.Power, error) {
	for _, power := range m.powers {
		if power.Code == code {
			return power, nil
		}
	}
	return nil, errors.New("power not found")
}

func (m *MockPowerRepository) GetByCodes(codes []string) ([]*powerEntities.Power, error) {
	return nil, nil
}

func (m *MockPowerRepository) Create(power *powerEntities.Power, memberID uint) error {
	if power.ID == 0 {
		power.ID = uint(len(m.powers) + 1)
	}
	m.powers[power.ID] = power
	return nil
}

func (m *MockPowerRepository) Update(power *powerEntities.Power, memberID uint) error {
	m.powers[power.ID] = power
	return nil
}

func (m *MockPowerRepository) Delete(id uint) error {
	delete(m.powers, id)
	return nil
}

func (m *MockPowerRepository) CheckPermission(roleID uint, code string) (bool, error) {
	return false, nil
}

func (m *MockPowerRepository) CheckPermissionByRoleIDs(roleIDs []uint, code string) (bool, error) {
	return false, nil
}

// Tests for RoleService

func TestRoleService_Create(t *testing.T) {
	tests := []struct {
		name      string
		role      *entities.Role
		memberID  uint
		wantError bool
		errorMsg  string
	}{
		{
			name: "成功創建角色",
			role: &entities.Role{
				Title:       "管理員",
				Description: "系統管理員",
				Sort:        1,
				IsEnable:    true,
			},
			memberID:  1,
			wantError: false,
		},
		{
			name: "角色標題為空",
			role: &entities.Role{
				Title:       "",
				Description: "無效角色",
				Sort:        1,
				IsEnable:    true,
			},
			memberID:  1,
			wantError: true,
			errorMsg:  "role title cannot be empty",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			roleRepo := NewMockRoleRepository()
			powerRepo := NewMockPowerRepository()
			service := NewRoleService(roleRepo, powerRepo)

			err := service.Create(tt.role, tt.memberID)

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

func TestRoleService_Update(t *testing.T) {
	tests := []struct {
		name      string
		role      *entities.Role
		memberID  uint
		wantError bool
		errorMsg  string
	}{
		{
			name: "成功更新角色",
			role: &entities.Role{
				ID:          1,
				Title:       "超級管理員",
				Description: "更新後的描述",
				Sort:        2,
				IsEnable:    true,
			},
			memberID:  1,
			wantError: false,
		},
		{
			name: "更新時角色標題為空",
			role: &entities.Role{
				ID:          1,
				Title:       "",
				Description: "無效更新",
				Sort:        1,
				IsEnable:    true,
			},
			memberID:  1,
			wantError: true,
			errorMsg:  "role title cannot be empty",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			roleRepo := NewMockRoleRepository()
			powerRepo := NewMockPowerRepository()
			service := NewRoleService(roleRepo, powerRepo)

			// 先創建一個角色
			roleRepo.roles[1] = &entities.Role{
				ID:          1,
				Title:       "原始角色",
				Description: "原始描述",
				Sort:        1,
				IsEnable:    true,
			}

			err := service.Update(tt.role, tt.memberID)

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

func TestRoleService_GetAll(t *testing.T) {
	roleRepo := NewMockRoleRepository()
	powerRepo := NewMockPowerRepository()
	service := NewRoleService(roleRepo, powerRepo)

	// 添加測試數據
	roleRepo.roles[1] = &entities.Role{ID: 1, Title: "管理員"}
	roleRepo.roles[2] = &entities.Role{ID: 2, Title: "用戶"}

	roles, err := service.GetAll()
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if len(roles) != 2 {
		t.Errorf("期望 2 個角色，得到 %d", len(roles))
	}
}

func TestRoleService_GetByID(t *testing.T) {
	roleRepo := NewMockRoleRepository()
	powerRepo := NewMockPowerRepository()
	service := NewRoleService(roleRepo, powerRepo)

	// 添加測試數據
	roleRepo.roles[1] = &entities.Role{ID: 1, Title: "管理員"}

	role, err := service.GetByID(1)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if role.Title != "管理員" {
		t.Errorf("期望角色標題為 '管理員'，得到 %q", role.Title)
	}

	// 測試不存在的角色
	_, err = service.GetByID(999)
	if err == nil {
		t.Errorf("期望錯誤，但沒有返回錯誤")
	}
}

func TestRoleService_AssignPowers(t *testing.T) {
	tests := []struct {
		name      string
		roleID    uint
		powerIDs  []uint
		memberID  uint
		wantError bool
		errorMsg  string
	}{
		{
			name:      "成功分配權限",
			roleID:    1,
			powerIDs:  []uint{1, 2, 3},
			memberID:  1,
			wantError: false,
		},
		{
			name:      "無效的角色ID",
			roleID:    0,
			powerIDs:  []uint{1, 2, 3},
			memberID:  1,
			wantError: true,
			errorMsg:  "invalid role ID",
		},
		{
			name:      "空的權限列表",
			roleID:    1,
			powerIDs:  []uint{},
			memberID:  1,
			wantError: true,
			errorMsg:  "no power IDs provided",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			roleRepo := NewMockRoleRepository()
			powerRepo := NewMockPowerRepository()
			service := NewRoleService(roleRepo, powerRepo)

			err := service.AssignPowers(tt.roleID, tt.powerIDs, tt.memberID)

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

func TestRoleService_RemovePowers(t *testing.T) {
	tests := []struct {
		name      string
		roleID    uint
		powerIDs  []uint
		wantError bool
		errorMsg  string
	}{
		{
			name:      "成功移除權限",
			roleID:    1,
			powerIDs:  []uint{1, 2},
			wantError: false,
		},
		{
			name:      "無效的角色ID",
			roleID:    0,
			powerIDs:  []uint{1, 2},
			wantError: true,
			errorMsg:  "invalid role ID",
		},
		{
			name:      "空的權限列表",
			roleID:    1,
			powerIDs:  []uint{},
			wantError: true,
			errorMsg:  "no power IDs provided",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			roleRepo := NewMockRoleRepository()
			powerRepo := NewMockPowerRepository()
			service := NewRoleService(roleRepo, powerRepo)

			err := service.RemovePowers(tt.roleID, tt.powerIDs)

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

func TestRoleService_AssignMembers(t *testing.T) {
	tests := []struct {
		name      string
		roleID    uint
		memberIDs []uint
		memberID  uint
		wantError bool
		errorMsg  string
	}{
		{
			name:      "成功分配成員",
			roleID:    1,
			memberIDs: []uint{1, 2, 3},
			memberID:  1,
			wantError: false,
		},
		{
			name:      "無效的角色ID",
			roleID:    0,
			memberIDs: []uint{1, 2, 3},
			memberID:  1,
			wantError: true,
			errorMsg:  "invalid role ID",
		},
		{
			name:      "空的成員列表",
			roleID:    1,
			memberIDs: []uint{},
			memberID:  1,
			wantError: true,
			errorMsg:  "no member IDs provided",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			roleRepo := NewMockRoleRepository()
			powerRepo := NewMockPowerRepository()
			service := NewRoleService(roleRepo, powerRepo)

			err := service.AssignMembers(tt.roleID, tt.memberIDs, tt.memberID)

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

func TestRoleService_RemoveMembers(t *testing.T) {
	tests := []struct {
		name      string
		roleID    uint
		memberIDs []uint
		wantError bool
		errorMsg  string
	}{
		{
			name:      "成功移除成員",
			roleID:    1,
			memberIDs: []uint{1, 2},
			wantError: false,
		},
		{
			name:      "無效的角色ID",
			roleID:    0,
			memberIDs: []uint{1, 2},
			wantError: true,
			errorMsg:  "invalid role ID",
		},
		{
			name:      "空的成員列表",
			roleID:    1,
			memberIDs: []uint{},
			wantError: true,
			errorMsg:  "no member IDs provided",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			roleRepo := NewMockRoleRepository()
			powerRepo := NewMockPowerRepository()
			service := NewRoleService(roleRepo, powerRepo)

			err := service.RemoveMembers(tt.roleID, tt.memberIDs)

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

func TestRoleService_GetPowersByIDs(t *testing.T) {
	roleRepo := NewMockRoleRepository()
	powerRepo := NewMockPowerRepository()
	service := NewRoleService(roleRepo, powerRepo)

	// 添加測試權限
	powerRepo.powers[1] = &powerEntities.Power{ID: 1, Title: "創建菜單", Code: "menu:create"}
	powerRepo.powers[2] = &powerEntities.Power{ID: 2, Title: "刪除菜單", Code: "menu:delete"}

	// 測試獲取權限
	powers, err := service.GetPowersByIDs([]uint{1, 2})
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if len(powers) != 2 {
		t.Errorf("期望 2 個權限，得到 %d", len(powers))
	}

	// 測試空列表
	powers, err = service.GetPowersByIDs([]uint{})
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if len(powers) != 0 {
		t.Errorf("期望 0 個權限，得到 %d", len(powers))
	}

	// 測試部分不存在的權限（應該跳過）
	powers, err = service.GetPowersByIDs([]uint{1, 999})
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if len(powers) != 1 {
		t.Errorf("期望 1 個權限，得到 %d", len(powers))
	}
}

func TestRoleService_GetByMemberID(t *testing.T) {
	roleRepo := NewMockRoleRepository()
	powerRepo := NewMockPowerRepository()
	service := NewRoleService(roleRepo, powerRepo)

	// 設置測試數據
	roleRepo.roles[1] = &entities.Role{ID: 1, Title: "管理員"}
	roleRepo.roles[2] = &entities.Role{ID: 2, Title: "用戶"}
	roleRepo.memberRoles[100] = []uint{1, 2}

	// 測試獲取成員角色
	roles, err := service.GetByMemberID(100)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if len(roles) != 2 {
		t.Errorf("期望 2 個角色，得到 %d", len(roles))
	}

	// 測試沒有角色的成員
	roles, err = service.GetByMemberID(999)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if len(roles) != 0 {
		t.Errorf("期望 0 個角色，得到 %d", len(roles))
	}
}
