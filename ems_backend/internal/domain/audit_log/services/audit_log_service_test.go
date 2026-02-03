package services

import (
	"ems_backend/internal/domain/audit_log/entities"
	"errors"
	"testing"
	"time"
)

// MockAuditLogRepository 模擬審計日誌 Repository
type MockAuditLogRepository struct {
	logs        map[uint]*entities.AuditLog
	createError error
	nextID      uint
}

func NewMockAuditLogRepository() *MockAuditLogRepository {
	return &MockAuditLogRepository{
		logs:   make(map[uint]*entities.AuditLog),
		nextID: 1,
	}
}

func (m *MockAuditLogRepository) Create(log *entities.AuditLog) error {
	if m.createError != nil {
		return m.createError
	}
	if log.ID == 0 {
		log.ID = m.nextID
		m.nextID++
	}
	m.logs[log.ID] = log
	return nil
}

func (m *MockAuditLogRepository) GetByID(id uint) (*entities.AuditLog, error) {
	if log, ok := m.logs[id]; ok {
		return log, nil
	}
	return nil, errors.New("audit log not found")
}

func (m *MockAuditLogRepository) Query(filter *entities.AuditLogFilter) ([]*entities.AuditLog, error) {
	logs := make([]*entities.AuditLog, 0)
	for _, log := range m.logs {
		if m.matchFilter(log, filter) {
			logs = append(logs, log)
		}
	}

	// 應用分頁
	offset := filter.Offset
	limit := filter.Limit
	if offset >= len(logs) {
		return []*entities.AuditLog{}, nil
	}
	end := offset + limit
	if end > len(logs) {
		end = len(logs)
	}
	return logs[offset:end], nil
}

func (m *MockAuditLogRepository) matchFilter(log *entities.AuditLog, filter *entities.AuditLogFilter) bool {
	if filter.MemberID != nil && *filter.MemberID != log.MemberID {
		return false
	}
	if filter.RoleID != nil && *filter.RoleID != log.RoleID {
		return false
	}
	if filter.Action != "" && filter.Action != log.Action {
		return false
	}
	if filter.ResourceType != "" && filter.ResourceType != log.ResourceType {
		return false
	}
	if filter.Status != "" && filter.Status != log.Status {
		return false
	}
	if !filter.StartTime.IsZero() && log.CreateTime.Before(filter.StartTime) {
		return false
	}
	if !filter.EndTime.IsZero() && log.CreateTime.After(filter.EndTime) {
		return false
	}
	return true
}

func (m *MockAuditLogRepository) GetByMemberID(memberID uint, limit int, offset int) ([]*entities.AuditLog, error) {
	logs := make([]*entities.AuditLog, 0)
	for _, log := range m.logs {
		if log.MemberID == memberID {
			logs = append(logs, log)
		}
	}
	// 簡單分頁
	if offset >= len(logs) {
		return []*entities.AuditLog{}, nil
	}
	end := offset + limit
	if end > len(logs) {
		end = len(logs)
	}
	return logs[offset:end], nil
}

func (m *MockAuditLogRepository) GetByResourceType(resourceType string, limit int, offset int) ([]*entities.AuditLog, error) {
	logs := make([]*entities.AuditLog, 0)
	for _, log := range m.logs {
		if log.ResourceType == resourceType {
			logs = append(logs, log)
		}
	}
	if offset >= len(logs) {
		return []*entities.AuditLog{}, nil
	}
	end := offset + limit
	if end > len(logs) {
		end = len(logs)
	}
	return logs[offset:end], nil
}

func (m *MockAuditLogRepository) GetByAction(action string, limit int, offset int) ([]*entities.AuditLog, error) {
	logs := make([]*entities.AuditLog, 0)
	for _, log := range m.logs {
		if log.Action == action {
			logs = append(logs, log)
		}
	}
	if offset >= len(logs) {
		return []*entities.AuditLog{}, nil
	}
	end := offset + limit
	if end > len(logs) {
		end = len(logs)
	}
	return logs[offset:end], nil
}

func (m *MockAuditLogRepository) Count(filter *entities.AuditLogFilter) (int64, error) {
	var count int64 = 0
	for _, log := range m.logs {
		if m.matchFilter(log, filter) {
			count++
		}
	}
	return count, nil
}

func (m *MockAuditLogRepository) DeleteOlderThan(days int) error {
	cutoff := time.Now().AddDate(0, 0, -days)
	for id, log := range m.logs {
		if log.CreateTime.Before(cutoff) {
			delete(m.logs, id)
		}
	}
	return nil
}

// Tests for AuditLogService

func TestAuditLogService_Create(t *testing.T) {
	tests := []struct {
		name      string
		log       *entities.AuditLog
		wantError bool
		errorMsg  string
	}{
		{
			name: "成功創建審計日誌",
			log: &entities.AuditLog{
				MemberID:     1,
				RoleID:       1,
				Action:       "CREATE",
				ResourceType: "MENU",
				Status:       "SUCCESS",
				IPAddress:    "192.168.1.1",
				UserAgent:    "Mozilla/5.0",
			},
			wantError: false,
		},
		{
			name: "缺少member_id",
			log: &entities.AuditLog{
				MemberID:     0,
				RoleID:       1,
				Action:       "CREATE",
				ResourceType: "MENU",
				Status:       "SUCCESS",
			},
			wantError: true,
			errorMsg:  "member_id is required",
		},
		{
			name: "缺少role_id",
			log: &entities.AuditLog{
				MemberID:     1,
				RoleID:       0,
				Action:       "CREATE",
				ResourceType: "MENU",
				Status:       "SUCCESS",
			},
			wantError: true,
			errorMsg:  "role_id is required",
		},
		{
			name: "缺少action",
			log: &entities.AuditLog{
				MemberID:     1,
				RoleID:       1,
				Action:       "",
				ResourceType: "MENU",
				Status:       "SUCCESS",
			},
			wantError: true,
			errorMsg:  "action is required",
		},
		{
			name: "缺少resource_type",
			log: &entities.AuditLog{
				MemberID:     1,
				RoleID:       1,
				Action:       "CREATE",
				ResourceType: "",
				Status:       "SUCCESS",
			},
			wantError: true,
			errorMsg:  "resource_type is required",
		},
		{
			name: "無效的status",
			log: &entities.AuditLog{
				MemberID:     1,
				RoleID:       1,
				Action:       "CREATE",
				ResourceType: "MENU",
				Status:       "INVALID",
			},
			wantError: true,
			errorMsg:  "status must be SUCCESS or FAILURE",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := NewMockAuditLogRepository()
			service := NewAuditLogService(repo)

			err := service.Create(tt.log)

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

func TestAuditLogService_CreateWithDefaults(t *testing.T) {
	repo := NewMockAuditLogRepository()
	service := NewAuditLogService(repo)

	log := &entities.AuditLog{
		MemberID:     1,
		RoleID:       1,
		Action:       "CREATE",
		ResourceType: "MENU",
		// 不設置 Status 和 CreateTime，應該自動設置默認值
	}

	err := service.Create(log)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	// 驗證默認狀態
	if log.Status != "SUCCESS" {
		t.Errorf("期望默認狀態為 'SUCCESS'，得到 %q", log.Status)
	}

	// 驗證創建時間已設置
	if log.CreateTime.IsZero() {
		t.Errorf("期望創建時間已設置")
	}
}

func TestAuditLogService_GetByID(t *testing.T) {
	repo := NewMockAuditLogRepository()
	service := NewAuditLogService(repo)

	// 添加測試數據
	testLog := &entities.AuditLog{
		ID:           1,
		MemberID:     1,
		RoleID:       1,
		Action:       "CREATE",
		ResourceType: "MENU",
		Status:       "SUCCESS",
		CreateTime:   time.Now(),
	}
	repo.logs[1] = testLog

	log, err := service.GetByID(1)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	if log.Action != "CREATE" {
		t.Errorf("期望 Action 為 'CREATE'，得到 %q", log.Action)
	}

	// 測試不存在的日誌
	_, err = service.GetByID(999)
	if err == nil {
		t.Errorf("期望錯誤，但沒有返回錯誤")
	}
}

func TestAuditLogService_Query(t *testing.T) {
	repo := NewMockAuditLogRepository()
	service := NewAuditLogService(repo)

	// 添加測試數據
	now := time.Now()
	repo.logs[1] = &entities.AuditLog{ID: 1, MemberID: 1, RoleID: 1, Action: "CREATE", ResourceType: "MENU", Status: "SUCCESS", CreateTime: now}
	repo.logs[2] = &entities.AuditLog{ID: 2, MemberID: 1, RoleID: 1, Action: "UPDATE", ResourceType: "MENU", Status: "SUCCESS", CreateTime: now}
	repo.logs[3] = &entities.AuditLog{ID: 3, MemberID: 2, RoleID: 2, Action: "CREATE", ResourceType: "ROLE", Status: "FAILURE", CreateTime: now}

	// 測試不帶過濾的查詢
	filter := &entities.AuditLogFilter{Limit: 10}
	logs, err := service.Query(filter)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if len(logs) != 3 {
		t.Errorf("期望 3 條日誌，得到 %d", len(logs))
	}

	// 測試按 Action 過濾
	filter = &entities.AuditLogFilter{Action: "CREATE", Limit: 10}
	logs, err = service.Query(filter)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if len(logs) != 2 {
		t.Errorf("期望 2 條日誌，得到 %d", len(logs))
	}

	// 測試按 Status 過濾
	filter = &entities.AuditLogFilter{Status: "FAILURE", Limit: 10}
	logs, err = service.Query(filter)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if len(logs) != 1 {
		t.Errorf("期望 1 條日誌，得到 %d", len(logs))
	}
}

func TestAuditLogService_QueryWithDefaultLimit(t *testing.T) {
	repo := NewMockAuditLogRepository()
	service := NewAuditLogService(repo)

	// 測試默認 limit
	filter := &entities.AuditLogFilter{Limit: 0}
	_, err := service.Query(filter)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if filter.Limit != 50 {
		t.Errorf("期望默認 limit 為 50，得到 %d", filter.Limit)
	}

	// 測試超過最大 limit
	filter = &entities.AuditLogFilter{Limit: 2000}
	_, err = service.Query(filter)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if filter.Limit != 1000 {
		t.Errorf("期望 limit 被限制為 1000，得到 %d", filter.Limit)
	}
}

func TestAuditLogService_GetByMemberID(t *testing.T) {
	repo := NewMockAuditLogRepository()
	service := NewAuditLogService(repo)

	// 添加測試數據
	now := time.Now()
	repo.logs[1] = &entities.AuditLog{ID: 1, MemberID: 1, RoleID: 1, Action: "CREATE", ResourceType: "MENU", Status: "SUCCESS", CreateTime: now}
	repo.logs[2] = &entities.AuditLog{ID: 2, MemberID: 1, RoleID: 1, Action: "UPDATE", ResourceType: "MENU", Status: "SUCCESS", CreateTime: now}
	repo.logs[3] = &entities.AuditLog{ID: 3, MemberID: 2, RoleID: 2, Action: "CREATE", ResourceType: "ROLE", Status: "SUCCESS", CreateTime: now}

	logs, err := service.GetByMemberID(1, 10, 0)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if len(logs) != 2 {
		t.Errorf("期望 2 條日誌，得到 %d", len(logs))
	}

	// 測試不存在的成員
	logs, err = service.GetByMemberID(999, 10, 0)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if len(logs) != 0 {
		t.Errorf("期望 0 條日誌，得到 %d", len(logs))
	}
}

func TestAuditLogService_GetByResourceType(t *testing.T) {
	repo := NewMockAuditLogRepository()
	service := NewAuditLogService(repo)

	// 添加測試數據
	now := time.Now()
	repo.logs[1] = &entities.AuditLog{ID: 1, MemberID: 1, RoleID: 1, Action: "CREATE", ResourceType: "MENU", Status: "SUCCESS", CreateTime: now}
	repo.logs[2] = &entities.AuditLog{ID: 2, MemberID: 1, RoleID: 1, Action: "UPDATE", ResourceType: "MENU", Status: "SUCCESS", CreateTime: now}
	repo.logs[3] = &entities.AuditLog{ID: 3, MemberID: 2, RoleID: 2, Action: "CREATE", ResourceType: "ROLE", Status: "SUCCESS", CreateTime: now}

	logs, err := service.GetByResourceType("MENU", 10, 0)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if len(logs) != 2 {
		t.Errorf("期望 2 條日誌，得到 %d", len(logs))
	}
}

func TestAuditLogService_GetByAction(t *testing.T) {
	repo := NewMockAuditLogRepository()
	service := NewAuditLogService(repo)

	// 添加測試數據
	now := time.Now()
	repo.logs[1] = &entities.AuditLog{ID: 1, MemberID: 1, RoleID: 1, Action: "CREATE", ResourceType: "MENU", Status: "SUCCESS", CreateTime: now}
	repo.logs[2] = &entities.AuditLog{ID: 2, MemberID: 1, RoleID: 1, Action: "CREATE", ResourceType: "ROLE", Status: "SUCCESS", CreateTime: now}
	repo.logs[3] = &entities.AuditLog{ID: 3, MemberID: 2, RoleID: 2, Action: "DELETE", ResourceType: "MENU", Status: "SUCCESS", CreateTime: now}

	logs, err := service.GetByAction("CREATE", 10, 0)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if len(logs) != 2 {
		t.Errorf("期望 2 條日誌，得到 %d", len(logs))
	}
}

func TestAuditLogService_Count(t *testing.T) {
	repo := NewMockAuditLogRepository()
	service := NewAuditLogService(repo)

	// 添加測試數據
	now := time.Now()
	repo.logs[1] = &entities.AuditLog{ID: 1, MemberID: 1, RoleID: 1, Action: "CREATE", ResourceType: "MENU", Status: "SUCCESS", CreateTime: now}
	repo.logs[2] = &entities.AuditLog{ID: 2, MemberID: 1, RoleID: 1, Action: "UPDATE", ResourceType: "MENU", Status: "SUCCESS", CreateTime: now}
	repo.logs[3] = &entities.AuditLog{ID: 3, MemberID: 2, RoleID: 2, Action: "CREATE", ResourceType: "ROLE", Status: "FAILURE", CreateTime: now}

	filter := &entities.AuditLogFilter{}
	count, err := service.Count(filter)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if count != 3 {
		t.Errorf("期望 3 條日誌，得到 %d", count)
	}

	// 測試帶過濾的計數
	filter = &entities.AuditLogFilter{Status: "SUCCESS"}
	count, err = service.Count(filter)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}
	if count != 2 {
		t.Errorf("期望 2 條日誌，得到 %d", count)
	}
}

func TestAuditLogService_DeleteOlderThan(t *testing.T) {
	repo := NewMockAuditLogRepository()
	service := NewAuditLogService(repo)

	// 添加測試數據 - 一些舊日誌
	oldTime := time.Now().AddDate(0, 0, -100)
	newTime := time.Now()
	repo.logs[1] = &entities.AuditLog{ID: 1, MemberID: 1, RoleID: 1, Action: "CREATE", ResourceType: "MENU", Status: "SUCCESS", CreateTime: oldTime}
	repo.logs[2] = &entities.AuditLog{ID: 2, MemberID: 1, RoleID: 1, Action: "UPDATE", ResourceType: "MENU", Status: "SUCCESS", CreateTime: newTime}

	err := service.DeleteOlderThan(30)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	// 驗證舊日誌已刪除，新日誌保留
	if len(repo.logs) != 1 {
		t.Errorf("期望 1 條日誌，得到 %d", len(repo.logs))
	}

	// 測試負數天數
	err = service.DeleteOlderThan(-1)
	if err == nil {
		t.Errorf("期望錯誤，但沒有返回錯誤")
	}
}

func TestAuditLogService_LogSuccess(t *testing.T) {
	repo := NewMockAuditLogRepository()
	service := NewAuditLogService(repo)

	resourceID := uint(123)
	details := map[string]interface{}{"key": "value"}

	err := service.LogSuccess(1, 1, "CREATE", "MENU", &resourceID, details, "192.168.1.1", "Mozilla/5.0")
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	// 驗證日誌已創建
	if len(repo.logs) != 1 {
		t.Errorf("期望 1 條日誌，得到 %d", len(repo.logs))
	}

	log := repo.logs[1]
	if log.Status != "SUCCESS" {
		t.Errorf("期望狀態為 'SUCCESS'，得到 %q", log.Status)
	}
	if *log.ResourceID != resourceID {
		t.Errorf("期望 ResourceID 為 %d，得到 %d", resourceID, *log.ResourceID)
	}
}

func TestAuditLogService_LogFailure(t *testing.T) {
	repo := NewMockAuditLogRepository()
	service := NewAuditLogService(repo)

	resourceID := uint(123)
	details := map[string]interface{}{"key": "value"}
	errorMessage := "Something went wrong"

	err := service.LogFailure(1, 1, "CREATE", "MENU", &resourceID, details, "192.168.1.1", "Mozilla/5.0", errorMessage)
	if err != nil {
		t.Errorf("不期望錯誤，但得到: %v", err)
	}

	// 驗證日誌已創建
	if len(repo.logs) != 1 {
		t.Errorf("期望 1 條日誌，得到 %d", len(repo.logs))
	}

	log := repo.logs[1]
	if log.Status != "FAILURE" {
		t.Errorf("期望狀態為 'FAILURE'，得到 %q", log.Status)
	}
	if log.ErrorMessage != errorMessage {
		t.Errorf("期望錯誤消息為 %q，得到 %q", errorMessage, log.ErrorMessage)
	}
}
