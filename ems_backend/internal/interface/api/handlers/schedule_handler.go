package handlers

import (
	"net/http"
	"strconv"

	"ems_backend/internal/application/dto"
	"ems_backend/internal/application/services"

	"github.com/gin-gonic/gin"
)

// ScheduleHandler - 排程處理器
type ScheduleHandler struct {
	scheduleService *services.ScheduleApplicationService
}

// NewScheduleHandler - 創建排程處理器
func NewScheduleHandler(scheduleService *services.ScheduleApplicationService) *ScheduleHandler {
	return &ScheduleHandler{
		scheduleService: scheduleService,
	}
}

// GetAll - 獲取排程列表 (返回待同步的排程)
// @Summary 獲取待同步排程列表
// @Tags Schedules
// @Success 200 {array} entities.Schedule
// @Router /schedules [get]
func (h *ScheduleHandler) GetAll(c *gin.Context) {
	// Check if company_device_id is provided
	companyDeviceIDStr := c.Query("company_device_id")
	if companyDeviceIDStr != "" {
		companyDeviceID, err := strconv.ParseUint(companyDeviceIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid company_device_id"})
			return
		}
		schedule, err := h.scheduleService.GetByCompanyDeviceID(uint(companyDeviceID))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "schedule not found"})
			return
		}
		c.JSON(http.StatusOK, schedule)
		return
	}

	// Return pending schedules
	schedules, err := h.scheduleService.GetPending()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, schedules)
}

// GetByID - 根據公司設備 ID 獲取排程
// @Summary 獲取設備排程
// @Tags Schedules
// @Param id path int true "公司設備 ID"
// @Success 200 {object} dto.ScheduleResponse
// @Router /schedules/{id} [get]
func (h *ScheduleHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	companyDeviceID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	schedule, err := h.scheduleService.GetByCompanyDeviceID(uint(companyDeviceID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "schedule not found"})
		return
	}

	c.JSON(http.StatusOK, schedule)
}

// Create - 創建排程
// @Summary 創建設備排程
// @Tags Schedules
// @Param schedule body dto.ScheduleRequest true "排程資料"
// @Success 201 {object} dto.ScheduleResponse
// @Router /schedules [post]
func (h *ScheduleHandler) Create(c *gin.Context) {
	var req dto.ScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get member ID from context
	memberID, exists := c.Get("memberID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	schedule, err := h.scheduleService.Create(&req, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, schedule)
}

// Update - 更新排程
// @Summary 更新設備排程
// @Tags Schedules
// @Param id path int true "公司設備 ID"
// @Param schedule body dto.ScheduleRequest true "排程資料"
// @Success 200 {object} dto.ScheduleResponse
// @Router /schedules/{id} [put]
func (h *ScheduleHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	companyDeviceID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req dto.ScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get member ID from context
	memberID, exists := c.Get("memberID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	schedule, err := h.scheduleService.Update(uint(companyDeviceID), &req, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, schedule)
}

// Delete - 刪除排程
// @Summary 刪除設備排程
// @Tags Schedules
// @Param id path int true "公司設備 ID"
// @Success 204 "No Content"
// @Router /schedules/{id} [delete]
func (h *ScheduleHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	companyDeviceID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.scheduleService.Delete(uint(companyDeviceID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// Sync - 手動同步排程到設備
// @Summary 同步排程到設備
// @Tags Schedules
// @Param id path int true "公司設備 ID"
// @Success 200 {object} map[string]string
// @Router /schedules/{id}/sync [post]
func (h *ScheduleHandler) Sync(c *gin.Context) {
	idStr := c.Param("id")
	companyDeviceID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	// Sync schedule to device via MQTT
	if err := h.scheduleService.SyncToDevice(uint(companyDeviceID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":           "sync completed",
		"company_device_id": companyDeviceID,
	})
}

// QueryDeviceInfo - 查詢設備資訊
// @Summary 查詢設備資訊
// @Tags Schedules
// @Param id path int true "公司設備 ID"
// @Success 200 {object} map[string]string
// @Router /schedules/{id}/device-info [post]
func (h *ScheduleHandler) QueryDeviceInfo(c *gin.Context) {
	idStr := c.Param("id")
	companyDeviceID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	// Send deviceInfo command to device via MQTT
	if err := h.scheduleService.QueryDeviceInfo(uint(companyDeviceID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":           "device info request sent",
		"company_device_id": companyDeviceID,
	})
}

// QuerySchedule - 從設備獲取當前排程
// @Summary 從硬體設備獲取當前排程
// @Tags Schedules
// @Param id path int true "公司設備 ID"
// @Success 200 {object} map[string]string
// @Router /schedules/{id}/query [post]
func (h *ScheduleHandler) QuerySchedule(c *gin.Context) {
	idStr := c.Param("id")
	companyDeviceID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	// Send getSchedule command to device via MQTT
	if err := h.scheduleService.QueryScheduleFromDevice(uint(companyDeviceID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":           "getSchedule request sent",
		"company_device_id": companyDeviceID,
	})
}
