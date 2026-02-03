package handlers

import (
	"net/http"
	"strconv"

	"ems_backend/internal/application/dto"
	"ems_backend/internal/application/services"

	"github.com/gin-gonic/gin"
)

// DeviceHandler 設備處理器
type DeviceHandler struct {
	deviceService *services.DeviceApplicationService
}

// NewDeviceHandler 創建設備處理器
func NewDeviceHandler(deviceService *services.DeviceApplicationService) *DeviceHandler {
	return &DeviceHandler{
		deviceService: deviceService,
	}
}

// GetAllDevices 獲取所有設備
// @Summary 獲取所有設備
// @Tags devices
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /devices [get]
func (h *DeviceHandler) GetAllDevices(c *gin.Context) {
	devices, err := h.deviceService.GetAllDevices()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "獲取設備列表失敗: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    devices,
	})
}

// GetUnassignedDevices 獲取未被綁定到任何公司的設備
// @Summary 獲取未被綁定的設備
// @Tags devices
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /devices/unassigned [get]
func (h *DeviceHandler) GetUnassignedDevices(c *gin.Context) {
	devices, err := h.deviceService.GetUnassignedDevices()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "獲取未綁定設備列表失敗: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    devices,
	})
}

// GetDeviceByID 根據 ID 獲取設備
// @Summary 根據 ID 獲取設備
// @Tags devices
// @Produce json
// @Param id path int true "設備 ID"
// @Success 200 {object} map[string]interface{}
// @Router /devices/{id} [get]
func (h *DeviceHandler) GetDeviceByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "無效的設備 ID",
		})
		return
	}

	device, err := h.deviceService.GetDeviceByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "設備不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    device,
	})
}

// CreateDevice 創建設備
// @Summary 創建設備
// @Tags devices
// @Accept json
// @Produce json
// @Param device body dto.DeviceCreateRequest true "設備信息"
// @Success 201 {object} map[string]interface{}
// @Router /devices [post]
func (h *DeviceHandler) CreateDevice(c *gin.Context) {
	var req dto.DeviceCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "請求參數錯誤: " + err.Error(),
		})
		return
	}

	// 從上下文獲取當前用戶 ID
	memberID, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "未授權",
		})
		return
	}

	device, err := h.deviceService.CreateDevice(&req, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    device,
		"message": "設備創建成功",
	})
}

// UpdateDevice 更新設備
// @Summary 更新設備
// @Tags devices
// @Accept json
// @Produce json
// @Param id path int true "設備 ID"
// @Param device body dto.DeviceUpdateRequest true "設備信息"
// @Success 200 {object} map[string]interface{}
// @Router /devices/{id} [put]
func (h *DeviceHandler) UpdateDevice(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "無效的設備 ID",
		})
		return
	}

	var req dto.DeviceUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "請求參數錯誤: " + err.Error(),
		})
		return
	}

	// 從上下文獲取當前用戶 ID
	memberID, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "未授權",
		})
		return
	}

	device, err := h.deviceService.UpdateDevice(uint(id), &req, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    device,
		"message": "設備更新成功",
	})
}

// DeleteDevice 刪除設備
// @Summary 刪除設備
// @Tags devices
// @Produce json
// @Param id path int true "設備 ID"
// @Success 200 {object} map[string]interface{}
// @Router /devices/{id} [delete]
func (h *DeviceHandler) DeleteDevice(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "無效的設備 ID",
		})
		return
	}

	if err := h.deviceService.DeleteDevice(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "設備刪除成功",
	})
}
