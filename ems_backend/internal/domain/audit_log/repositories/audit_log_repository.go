package repositories

import "ems_backend/internal/domain/audit_log/entities"

type AuditLogRepository interface {
	// Create 創建審計日誌
	Create(log *entities.AuditLog) error

	// GetByID 根據ID獲取審計日誌
	GetByID(id uint) (*entities.AuditLog, error)

	// Query 根據過濾條件查詢審計日誌
	Query(filter *entities.AuditLogFilter) ([]*entities.AuditLog, error)

	// GetByMemberID 獲取指定成員的審計日誌
	GetByMemberID(memberID uint, limit int, offset int) ([]*entities.AuditLog, error)

	// GetByResourceType 獲取指定資源類型的審計日誌
	GetByResourceType(resourceType string, limit int, offset int) ([]*entities.AuditLog, error)

	// GetByAction 獲取指定操作的審計日誌
	GetByAction(action string, limit int, offset int) ([]*entities.AuditLog, error)

	// Count 計算符合條件的審計日誌總數
	Count(filter *entities.AuditLogFilter) (int64, error)

	// DeleteOlderThan 刪除早於指定時間的審計日誌（用於日誌清理）
	DeleteOlderThan(days int) error
}
