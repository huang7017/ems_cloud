package repositories

import (
	"ems_backend/internal/domain/audit_log/entities"
	"ems_backend/internal/infrastructure/persistence/models"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type AuditLogRepository struct {
	db *gorm.DB
}

func NewAuditLogRepository(db *gorm.DB) *AuditLogRepository {
	return &AuditLogRepository{db: db}
}

// Create 創建審計日誌
func (r *AuditLogRepository) Create(log *entities.AuditLog) error {
	// 將 map[string]interface{} 轉換為 JSONB
	var details models.JSONB
	if log.Details != nil {
		detailsJSON, _ := json.Marshal(log.Details)
		details = models.JSONB(detailsJSON)
	}

	model := &models.AuditLogModel{
		MemberID:     log.MemberID,
		RoleID:       log.RoleID,
		Action:       log.Action,
		ResourceType: log.ResourceType,
		ResourceID:   log.ResourceID,
		Details:      details,
		IPAddress:    log.IPAddress,
		UserAgent:    log.UserAgent,
		Status:       log.Status,
		ErrorMessage: log.ErrorMessage,
		CreateTime:   log.CreateTime,
	}

	return r.db.Create(model).Error
}

// GetByID 根據ID獲取審計日誌
func (r *AuditLogRepository) GetByID(id uint) (*entities.AuditLog, error) {
	var model models.AuditLogModel
	if err := r.db.First(&model, id).Error; err != nil {
		return nil, err
	}
	return r.mapToDomainSingle(&model), nil
}

// Query 根據過濾條件查詢審計日誌
func (r *AuditLogRepository) Query(filter *entities.AuditLogFilter) ([]*entities.AuditLog, error) {
	query := r.db.Model(&models.AuditLogModel{})

	// 應用過濾條件
	if filter.MemberID != nil {
		query = query.Where("member_id = ?", *filter.MemberID)
	}
	if filter.RoleID != nil {
		query = query.Where("role_id = ?", *filter.RoleID)
	}
	if filter.Action != "" {
		query = query.Where("action = ?", filter.Action)
	}
	if filter.ResourceType != "" {
		query = query.Where("resource_type = ?", filter.ResourceType)
	}
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	if !filter.StartTime.IsZero() {
		query = query.Where("create_time >= ?", filter.StartTime)
	}
	if !filter.EndTime.IsZero() {
		query = query.Where("create_time <= ?", filter.EndTime)
	}

	// 應用分頁
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}

	// 按時間倒序排列
	query = query.Order("create_time DESC")

	var models []*models.AuditLogModel
	if err := query.Find(&models).Error; err != nil {
		return nil, err
	}

	return r.mapToDomain(models), nil
}

// GetByMemberID 獲取指定成員的審計日誌
func (r *AuditLogRepository) GetByMemberID(memberID uint, limit int, offset int) ([]*entities.AuditLog, error) {
	var models []*models.AuditLogModel

	query := r.db.Where("member_id = ?", memberID).
		Order("create_time DESC").
		Limit(limit).
		Offset(offset)

	if err := query.Find(&models).Error; err != nil {
		return nil, err
	}

	return r.mapToDomain(models), nil
}

// GetByResourceType 獲取指定資源類型的審計日誌
func (r *AuditLogRepository) GetByResourceType(resourceType string, limit int, offset int) ([]*entities.AuditLog, error) {
	var models []*models.AuditLogModel

	query := r.db.Where("resource_type = ?", resourceType).
		Order("create_time DESC").
		Limit(limit).
		Offset(offset)

	if err := query.Find(&models).Error; err != nil {
		return nil, err
	}

	return r.mapToDomain(models), nil
}

// GetByAction 獲取指定操作的審計日誌
func (r *AuditLogRepository) GetByAction(action string, limit int, offset int) ([]*entities.AuditLog, error) {
	var models []*models.AuditLogModel

	query := r.db.Where("action = ?", action).
		Order("create_time DESC").
		Limit(limit).
		Offset(offset)

	if err := query.Find(&models).Error; err != nil {
		return nil, err
	}

	return r.mapToDomain(models), nil
}

// Count 計算符合條件的審計日誌總數
func (r *AuditLogRepository) Count(filter *entities.AuditLogFilter) (int64, error) {
	var count int64
	query := r.db.Model(&models.AuditLogModel{})

	// 應用過濾條件
	if filter.MemberID != nil {
		query = query.Where("member_id = ?", *filter.MemberID)
	}
	if filter.RoleID != nil {
		query = query.Where("role_id = ?", *filter.RoleID)
	}
	if filter.Action != "" {
		query = query.Where("action = ?", filter.Action)
	}
	if filter.ResourceType != "" {
		query = query.Where("resource_type = ?", filter.ResourceType)
	}
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	if !filter.StartTime.IsZero() {
		query = query.Where("create_time >= ?", filter.StartTime)
	}
	if !filter.EndTime.IsZero() {
		query = query.Where("create_time <= ?", filter.EndTime)
	}

	if err := query.Count(&count).Error; err != nil {
		return 0, err
	}

	return count, nil
}

// DeleteOlderThan 刪除早於指定天數的審計日誌
func (r *AuditLogRepository) DeleteOlderThan(days int) error {
	cutoffDate := time.Now().AddDate(0, 0, -days)
	return r.db.Where("create_time < ?", cutoffDate).Delete(&models.AuditLogModel{}).Error
}

// mapToDomain 將多個模型轉換為領域實體
func (r *AuditLogRepository) mapToDomain(models []*models.AuditLogModel) []*entities.AuditLog {
	logs := make([]*entities.AuditLog, len(models))
	for i, model := range models {
		logs[i] = r.mapToDomainSingle(model)
	}
	return logs
}

// mapToDomainSingle 將單個模型轉換為領域實體
func (r *AuditLogRepository) mapToDomainSingle(model *models.AuditLogModel) *entities.AuditLog {
	// 將 JSONB (json.RawMessage) 轉換為 map[string]interface{}
	var details map[string]interface{}
	if model.Details != nil && len(model.Details) > 0 {
		json.Unmarshal([]byte(model.Details), &details)
	}

	return &entities.AuditLog{
		ID:           model.ID,
		MemberID:     model.MemberID,
		RoleID:       model.RoleID,
		Action:       model.Action,
		ResourceType: model.ResourceType,
		ResourceID:   model.ResourceID,
		Details:      details,
		IPAddress:    model.IPAddress,
		UserAgent:    model.UserAgent,
		Status:       model.Status,
		ErrorMessage: model.ErrorMessage,
		CreateTime:   model.CreateTime,
	}
}
