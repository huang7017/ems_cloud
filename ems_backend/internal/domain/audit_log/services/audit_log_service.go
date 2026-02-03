package services

import (
	"ems_backend/internal/domain/audit_log/entities"
	"ems_backend/internal/domain/audit_log/repositories"
	"fmt"
	"time"
)

type AuditLogService struct {
	auditLogRepo repositories.AuditLogRepository
}

func NewAuditLogService(auditLogRepo repositories.AuditLogRepository) *AuditLogService {
	return &AuditLogService{auditLogRepo: auditLogRepo}
}

// Create 創建審計日誌
func (s *AuditLogService) Create(log *entities.AuditLog) error {
	// 設置創建時間
	if log.CreateTime.IsZero() {
		log.CreateTime = time.Now()
	}

	// 默認狀態為成功
	if log.Status == "" {
		log.Status = "SUCCESS"
	}

	// 驗證必填字段
	if err := s.validateAuditLog(log); err != nil {
		return err
	}

	return s.auditLogRepo.Create(log)
}

// GetByID 根據ID獲取審計日誌
func (s *AuditLogService) GetByID(id uint) (*entities.AuditLog, error) {
	return s.auditLogRepo.GetByID(id)
}

// Query 根據過濾條件查詢審計日誌
func (s *AuditLogService) Query(filter *entities.AuditLogFilter) ([]*entities.AuditLog, error) {
	// 設置默認分頁參數
	if filter.Limit <= 0 {
		filter.Limit = 50
	}
	if filter.Limit > 1000 {
		filter.Limit = 1000 // 最多返回1000條
	}

	return s.auditLogRepo.Query(filter)
}

// GetByMemberID 獲取指定成員的審計日誌
func (s *AuditLogService) GetByMemberID(memberID uint, limit int, offset int) ([]*entities.AuditLog, error) {
	if limit <= 0 {
		limit = 50
	}
	if limit > 1000 {
		limit = 1000
	}

	return s.auditLogRepo.GetByMemberID(memberID, limit, offset)
}

// GetByResourceType 獲取指定資源類型的審計日誌
func (s *AuditLogService) GetByResourceType(resourceType string, limit int, offset int) ([]*entities.AuditLog, error) {
	if limit <= 0 {
		limit = 50
	}
	if limit > 1000 {
		limit = 1000
	}

	return s.auditLogRepo.GetByResourceType(resourceType, limit, offset)
}

// GetByAction 獲取指定操作的審計日誌
func (s *AuditLogService) GetByAction(action string, limit int, offset int) ([]*entities.AuditLog, error) {
	if limit <= 0 {
		limit = 50
	}
	if limit > 1000 {
		limit = 1000
	}

	return s.auditLogRepo.GetByAction(action, limit, offset)
}

// Count 計算符合條件的審計日誌總數
func (s *AuditLogService) Count(filter *entities.AuditLogFilter) (int64, error) {
	return s.auditLogRepo.Count(filter)
}

// DeleteOlderThan 刪除早於指定天數的審計日誌
func (s *AuditLogService) DeleteOlderThan(days int) error {
	if days < 0 {
		return fmt.Errorf("days must be positive")
	}

	return s.auditLogRepo.DeleteOlderThan(days)
}

// validateAuditLog 驗證審計日誌
func (s *AuditLogService) validateAuditLog(log *entities.AuditLog) error {
	if log.MemberID == 0 {
		return fmt.Errorf("member_id is required")
	}
	if log.RoleID == 0 {
		return fmt.Errorf("role_id is required")
	}
	if log.Action == "" {
		return fmt.Errorf("action is required")
	}
	if log.ResourceType == "" {
		return fmt.Errorf("resource_type is required")
	}
	if log.Status != "SUCCESS" && log.Status != "FAILURE" {
		return fmt.Errorf("status must be SUCCESS or FAILURE")
	}

	return nil
}

// LogSuccess 記錄成功的操作
func (s *AuditLogService) LogSuccess(memberID, roleID uint, action, resourceType string, resourceID *uint, details map[string]interface{}, ipAddress, userAgent string) error {
	log := &entities.AuditLog{
		MemberID:     memberID,
		RoleID:       roleID,
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		Details:      details,
		IPAddress:    ipAddress,
		UserAgent:    userAgent,
		Status:       "SUCCESS",
		CreateTime:   time.Now(),
	}

	return s.Create(log)
}

// LogFailure 記錄失敗的操作
func (s *AuditLogService) LogFailure(memberID, roleID uint, action, resourceType string, resourceID *uint, details map[string]interface{}, ipAddress, userAgent string, errorMessage string) error {
	log := &entities.AuditLog{
		MemberID:     memberID,
		RoleID:       roleID,
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		Details:      details,
		IPAddress:    ipAddress,
		UserAgent:    userAgent,
		Status:       "FAILURE",
		ErrorMessage: errorMessage,
		CreateTime:   time.Now(),
	}

	return s.Create(log)
}
