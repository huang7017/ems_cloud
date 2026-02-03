package services

import (
	"ems_backend/internal/application/dto"
	"ems_backend/internal/domain/audit_log/entities"
	"ems_backend/internal/domain/audit_log/services"
)

type AuditLogApplicationService struct {
	auditLogService *services.AuditLogService
}

func NewAuditLogApplicationService(auditLogService *services.AuditLogService) *AuditLogApplicationService {
	return &AuditLogApplicationService{auditLogService: auditLogService}
}

// Query 根據過濾條件查詢審計日誌
func (s *AuditLogApplicationService) Query(req *dto.AuditLogQueryRequest) (*dto.AuditLogListResponse, error) {
	filter := &entities.AuditLogFilter{
		MemberID:     req.MemberID,
		RoleID:       req.RoleID,
		Action:       req.Action,
		ResourceType: req.ResourceType,
		Status:       req.Status,
		StartTime:    req.StartTime,
		EndTime:      req.EndTime,
		Limit:        req.Limit,
		Offset:       req.Offset,
	}

	// 獲取總數
	total, err := s.auditLogService.Count(filter)
	if err != nil {
		return nil, err
	}

	// 獲取日誌列表
	logs, err := s.auditLogService.Query(filter)
	if err != nil {
		return nil, err
	}

	// 轉換為響應DTO
	logResponses := make([]dto.AuditLogResponse, len(logs))
	for i, log := range logs {
		logResponses[i] = dto.AuditLogResponse{
			ID:           log.ID,
			MemberID:     log.MemberID,
			RoleID:       log.RoleID,
			Action:       log.Action,
			ResourceType: log.ResourceType,
			ResourceID:   log.ResourceID,
			Details:      log.Details,
			IPAddress:    log.IPAddress,
			UserAgent:    log.UserAgent,
			Status:       log.Status,
			ErrorMessage: log.ErrorMessage,
			CreateTime:   log.CreateTime,
		}
	}

	return &dto.AuditLogListResponse{
		Total: total,
		Logs:  logResponses,
	}, nil
}

// GetByID 根據ID獲取審計日誌
func (s *AuditLogApplicationService) GetByID(id uint) (*dto.AuditLogResponse, error) {
	log, err := s.auditLogService.GetByID(id)
	if err != nil {
		return nil, err
	}

	return &dto.AuditLogResponse{
		ID:           log.ID,
		MemberID:     log.MemberID,
		RoleID:       log.RoleID,
		Action:       log.Action,
		ResourceType: log.ResourceType,
		ResourceID:   log.ResourceID,
		Details:      log.Details,
		IPAddress:    log.IPAddress,
		UserAgent:    log.UserAgent,
		Status:       log.Status,
		ErrorMessage: log.ErrorMessage,
		CreateTime:   log.CreateTime,
	}, nil
}

// GetByMemberID 獲取指定成員的審計日誌
func (s *AuditLogApplicationService) GetByMemberID(memberID uint, limit int, offset int) (*dto.AuditLogListResponse, error) {
	// 獲取日誌列表
	logs, err := s.auditLogService.GetByMemberID(memberID, limit, offset)
	if err != nil {
		return nil, err
	}

	// 獲取總數
	filter := &entities.AuditLogFilter{
		MemberID: &memberID,
		Limit:    0,
		Offset:   0,
	}
	total, err := s.auditLogService.Count(filter)
	if err != nil {
		return nil, err
	}

	// 轉換為響應DTO
	logResponses := make([]dto.AuditLogResponse, len(logs))
	for i, log := range logs {
		logResponses[i] = dto.AuditLogResponse{
			ID:           log.ID,
			MemberID:     log.MemberID,
			RoleID:       log.RoleID,
			Action:       log.Action,
			ResourceType: log.ResourceType,
			ResourceID:   log.ResourceID,
			Details:      log.Details,
			IPAddress:    log.IPAddress,
			UserAgent:    log.UserAgent,
			Status:       log.Status,
			ErrorMessage: log.ErrorMessage,
			CreateTime:   log.CreateTime,
		}
	}

	return &dto.AuditLogListResponse{
		Total: total,
		Logs:  logResponses,
	}, nil
}

// GetByResourceType 獲取指定資源類型的審計日誌
func (s *AuditLogApplicationService) GetByResourceType(resourceType string, limit int, offset int) (*dto.AuditLogListResponse, error) {
	// 獲取日誌列表
	logs, err := s.auditLogService.GetByResourceType(resourceType, limit, offset)
	if err != nil {
		return nil, err
	}

	// 獲取總數
	filter := &entities.AuditLogFilter{
		ResourceType: resourceType,
		Limit:        0,
		Offset:       0,
	}
	total, err := s.auditLogService.Count(filter)
	if err != nil {
		return nil, err
	}

	// 轉換為響應DTO
	logResponses := make([]dto.AuditLogResponse, len(logs))
	for i, log := range logs {
		logResponses[i] = dto.AuditLogResponse{
			ID:           log.ID,
			MemberID:     log.MemberID,
			RoleID:       log.RoleID,
			Action:       log.Action,
			ResourceType: log.ResourceType,
			ResourceID:   log.ResourceID,
			Details:      log.Details,
			IPAddress:    log.IPAddress,
			UserAgent:    log.UserAgent,
			Status:       log.Status,
			ErrorMessage: log.ErrorMessage,
			CreateTime:   log.CreateTime,
		}
	}

	return &dto.AuditLogListResponse{
		Total: total,
		Logs:  logResponses,
	}, nil
}
