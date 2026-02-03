package handlers

import (
	"ems_backend/internal/application/dto"
	"ems_backend/internal/application/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PowerHandler struct {
	powerAppService *services.PowerApplicationService
}

func NewPowerHandler(powerAppService *services.PowerApplicationService) *PowerHandler {
	return &PowerHandler{powerAppService: powerAppService}
}

// GetAll 獲取所有權限
func (h *PowerHandler) GetAll(c *gin.Context) {
	powers, err := h.powerAppService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: powers})
}

// GetByID 根據ID獲取權限
func (h *PowerHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid ID format"})
		return
	}

	power, err := h.powerAppService.GetByID(uint(parsedID))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: power})
}

// GetByMenuID 根據菜單ID獲取權限
func (h *PowerHandler) GetByMenuID(c *gin.Context) {
	menuID := c.Query("menu_id")
	if menuID == "" {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "menu_id is required"})
		return
	}

	parsedMenuID, err := strconv.ParseUint(menuID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid menu_id format"})
		return
	}

	powers, err := h.powerAppService.GetByMenuID(uint(parsedMenuID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: powers})
}

// GetByRoleID 根據角色ID獲取該角色擁有的所有權限
func (h *PowerHandler) GetByRoleID(c *gin.Context) {
	roleID := c.Query("role_id")
	if roleID == "" {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "role_id is required"})
		return
	}

	parsedRoleID, err := strconv.ParseUint(roleID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid role_id format"})
		return
	}

	powers, err := h.powerAppService.GetByRoleID(uint(parsedRoleID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: powers})
}

// Create 創建權限
func (h *PowerHandler) Create(c *gin.Context) {
	var req dto.PowerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	memberID, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Success: false, Error: "Unauthorized"})
		return
	}

	response, err := h.powerAppService.Create(&req, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// Update 更新權限
func (h *PowerHandler) Update(c *gin.Context) {
	var req dto.PowerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	memberID, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Success: false, Error: "Unauthorized"})
		return
	}

	response, err := h.powerAppService.Update(&req, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// Delete 刪除權限
func (h *PowerHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid ID format"})
		return
	}

	response, err := h.powerAppService.Delete(uint(parsedID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}
