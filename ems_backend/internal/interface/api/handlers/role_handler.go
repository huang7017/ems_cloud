package handlers

import (
	"ems_backend/internal/application/dto"
	"ems_backend/internal/application/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type RoleHandler struct {
	roleAppService *services.RoleApplicationService
}

func NewRoleHandler(roleAppService *services.RoleApplicationService) *RoleHandler {
	return &RoleHandler{roleAppService: roleAppService}
}

// GetAll 獲取所有角色
func (h *RoleHandler) GetAll(c *gin.Context) {
	roles, err := h.roleAppService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: roles})
}

// GetByID 根據ID獲取角色
func (h *RoleHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid ID format"})
		return
	}

	role, err := h.roleAppService.GetByID(uint(parsedID))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: role})
}

// Create 創建角色
func (h *RoleHandler) Create(c *gin.Context) {
	var req dto.RoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	memberID, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Success: false, Error: "Unauthorized"})
		return
	}

	response, err := h.roleAppService.Create(&req, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// Update 更新角色
func (h *RoleHandler) Update(c *gin.Context) {
	var req dto.RoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	memberID, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Success: false, Error: "Unauthorized"})
		return
	}

	response, err := h.roleAppService.Update(&req, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// Delete 刪除角色
func (h *RoleHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid ID format"})
		return
	}

	response, err := h.roleAppService.Delete(uint(parsedID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetRolePowers 獲取角色的所有權限
func (h *RoleHandler) GetRolePowers(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid ID format"})
		return
	}

	powers, err := h.roleAppService.GetRolePowers(uint(parsedID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	// powers 已經是 []*dto.PowerResponse 類型，直接返回
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: powers})
}

// AssignPowers 為角色分配權限
func (h *RoleHandler) AssignPowers(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid ID format"})
		return
	}

	var req dto.AssignPowersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	memberID, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Success: false, Error: "Unauthorized"})
		return
	}

	response, err := h.roleAppService.AssignPowers(uint(parsedID), &req, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// RemovePowers 移除角色的權限
func (h *RoleHandler) RemovePowers(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid ID format"})
		return
	}

	var req dto.AssignPowersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	response, err := h.roleAppService.RemovePowers(uint(parsedID), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetRoleMembers 獲取角色的所有成員
func (h *RoleHandler) GetRoleMembers(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid ID format"})
		return
	}

	members, err := h.roleAppService.GetRoleMembers(uint(parsedID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: members})
}

// AssignMembers 將角色分配給成員
func (h *RoleHandler) AssignMembers(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid ID format"})
		return
	}

	var req dto.AssignMembersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	memberID, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Success: false, Error: "Unauthorized"})
		return
	}

	response, err := h.roleAppService.AssignMembers(uint(parsedID), &req, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// RemoveMembers 從角色中移除成員
func (h *RoleHandler) RemoveMembers(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid ID format"})
		return
	}

	var req dto.AssignMembersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	response, err := h.roleAppService.RemoveMembers(uint(parsedID), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}
