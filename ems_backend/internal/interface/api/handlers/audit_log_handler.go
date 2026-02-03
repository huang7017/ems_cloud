package handlers

import (
	"ems_backend/internal/application/dto"
	"ems_backend/internal/application/services"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type AuditLogHandler struct {
	auditLogAppService *services.AuditLogApplicationService
}

func NewAuditLogHandler(auditLogAppService *services.AuditLogApplicationService) *AuditLogHandler {
	return &AuditLogHandler{auditLogAppService: auditLogAppService}
}

// Query 根據過濾條件查詢審計日誌
func (h *AuditLogHandler) Query(c *gin.Context) {
	var req dto.AuditLogQueryRequest

	// 解析查詢參數
	if memberIDStr := c.Query("member_id"); memberIDStr != "" {
		if memberID, err := strconv.ParseUint(memberIDStr, 10, 64); err == nil {
			mid := uint(memberID)
			req.MemberID = &mid
		}
	}

	if roleIDStr := c.Query("role_id"); roleIDStr != "" {
		if roleID, err := strconv.ParseUint(roleIDStr, 10, 64); err == nil {
			rid := uint(roleID)
			req.RoleID = &rid
		}
	}

	req.Action = c.Query("action")
	req.ResourceType = c.Query("resource_type")
	req.Status = c.Query("status")

	// 解析時間範圍
	if startTimeStr := c.Query("start_time"); startTimeStr != "" {
		if startTime, err := time.Parse(time.RFC3339, startTimeStr); err == nil {
			req.StartTime = startTime
		}
	}

	if endTimeStr := c.Query("end_time"); endTimeStr != "" {
		if endTime, err := time.Parse(time.RFC3339, endTimeStr); err == nil {
			req.EndTime = endTime
		}
	}

	// 解析分頁參數
	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			req.Limit = limit
		}
	}
	if req.Limit == 0 {
		req.Limit = 50 // 默認50條
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil {
			req.Offset = offset
		}
	}

	result, err := h.auditLogAppService.Query(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: result})
}

// GetByID 根據ID獲取審計日誌
func (h *AuditLogHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid ID format"})
		return
	}

	log, err := h.auditLogAppService.GetByID(uint(parsedID))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: log})
}

// GetByMemberID 獲取指定成員的審計日誌
func (h *AuditLogHandler) GetByMemberID(c *gin.Context) {
	memberIDStr := c.Param("memberId")
	memberID, err := strconv.ParseUint(memberIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid member ID format"})
		return
	}

	// 解析分頁參數
	limit := 50
	offset := 0

	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil {
			offset = o
		}
	}

	result, err := h.auditLogAppService.GetByMemberID(uint(memberID), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: result})
}

// GetByResourceType 獲取指定資源類型的審計日誌
func (h *AuditLogHandler) GetByResourceType(c *gin.Context) {
	resourceType := c.Param("resourceType")
	if resourceType == "" {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "resource_type is required"})
		return
	}

	// 解析分頁參數
	limit := 50
	offset := 0

	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil {
			offset = o
		}
	}

	result, err := h.auditLogAppService.GetByResourceType(resourceType, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: result})
}
