package handlers

import (
	"ems_backend/internal/application/dto"
	"ems_backend/internal/application/services"
	"net/http"

	"strconv"

	"github.com/gin-gonic/gin"
)

type MenuHandler struct {
	menuAppService *services.MenuApplicationService
}

func NewMenuHandler(menuAppService *services.MenuApplicationService) *MenuHandler {
	return &MenuHandler{menuAppService: menuAppService}
}

func (h *MenuHandler) GetAll(c *gin.Context) {
	menus, err := h.menuAppService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: menus})
}

func (h *MenuHandler) Create(c *gin.Context) {
	var menu dto.MenuRequest
	if err := c.ShouldBindJSON(&menu); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}
	memberID, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Success: false, Error: "Unauthorized"})
		return
	}
	response, err := h.menuAppService.Create(&menu, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	if !response.Success {
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}

func (h *MenuHandler) Update(c *gin.Context) {
	// 從 URL 路徑獲取 ID
	idParam := c.Param("id")
	parsedID, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid ID format"})
		return
	}

	var menu dto.MenuRequest
	if err := c.ShouldBindJSON(&menu); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	// 使用 URL 中的 ID，而不是 JSON body 中的 ID
	menu.ID = uint(parsedID)

	memberID, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{Success: false, Error: "Unauthorized"})
		return
	}

	response, err := h.menuAppService.Update(&menu, memberID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	if !response.Success {
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}

func (h *MenuHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid ID format"})
		return
	}

	if err := h.menuAppService.Delete(uint(parsedID)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}

func (h *MenuHandler) GetByRoleId(c *gin.Context) {
	roleId := c.GetHeader("X-Role-ID")
	roleID, err := strconv.ParseUint(roleId, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid role ID format"})
		return
	}
	response := h.menuAppService.GetByRoleId(uint(roleID))

	c.JSON(http.StatusOK, response)
}
