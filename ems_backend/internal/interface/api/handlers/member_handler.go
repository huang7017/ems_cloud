package handlers

import (
	"ems_backend/internal/application/dto"
	"ems_backend/internal/application/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type MemberHandler struct {
	memberAppService *services.MemberApplicationService
}

func NewMemberHandler(memberAppService *services.MemberApplicationService) *MemberHandler {
	return &MemberHandler{memberAppService: memberAppService}
}

// GetAll 獲取所有成員
func (h *MemberHandler) GetAll(c *gin.Context) {
	response, err := h.memberAppService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, response)
}

// GetByID 根據ID獲取成員
func (h *MemberHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{
			Success: false,
			Error:   "Invalid ID format",
		})
		return
	}

	response, err := h.memberAppService.GetByID(uint(parsedID))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

// UpdateStatus 更新成員狀態（啟用/停用）
func (h *MemberHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{
			Success: false,
			Error:   "Invalid ID format",
		})
		return
	}

	var req dto.MemberUpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	memberID, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{
			Success: false,
			Error:   "Unauthorized",
		})
		return
	}

	response, err := h.memberAppService.UpdateStatus(uint(parsedID), req.IsEnable, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

// Create 創建成員
func (h *MemberHandler) Create(c *gin.Context) {
	var req dto.MemberCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	memberID, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{
			Success: false,
			Error:   "Unauthorized",
		})
		return
	}

	response, err := h.memberAppService.Create(&req, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, response)
}

// Update 更新成員
func (h *MemberHandler) Update(c *gin.Context) {
	id := c.Param("id")
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{
			Success: false,
			Error:   "Invalid ID format",
		})
		return
	}

	var req dto.MemberUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	memberID, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{
			Success: false,
			Error:   "Unauthorized",
		})
		return
	}

	response, err := h.memberAppService.Update(uint(parsedID), &req, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response)
}
