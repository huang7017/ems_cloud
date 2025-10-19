package handlers

import (
	"ems_backend/internal/application/dto"
	"ems_backend/internal/application/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	dashboardAppService  *services.DashboardApplicationService
	dashboardTempService *services.DashboardTemperatureService
	dashboardAreaService *services.DashboardAreaService
}

func NewDashboardHandler(
	dashboardAppService *services.DashboardApplicationService,
	dashboardTempService *services.DashboardTemperatureService,
	dashboardAreaService *services.DashboardAreaService,
) *DashboardHandler {
	return &DashboardHandler{
		dashboardAppService:  dashboardAppService,
		dashboardTempService: dashboardTempService,
		dashboardAreaService: dashboardAreaService,
	}
}

// GetMeterData - 獲取電表數據
func (h *DashboardHandler) GetMeterData(c *gin.Context) {
	// 從 context 中獲取 memberID (由 auth middleware 設置)
	memberIDValue, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{
			Success: false,
			Error:   "unauthorized: member_id not found",
		})
		return
	}

	memberID, ok := memberIDValue.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   "invalid member_id type",
		})
		return
	}

	// 綁定請求參數
	var req dto.DashboardMeterRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		// 即使綁定失敗也繼續，使用默認值
	}

	// 解析時間參數（如果提供了字符串格式）
	if startTimeStr := c.Query("start_time"); startTimeStr != "" {
		if t, err := time.Parse(time.RFC3339, startTimeStr); err == nil {
			req.StartTime = &t
		}
	}
	if endTimeStr := c.Query("end_time"); endTimeStr != "" {
		if t, err := time.Parse(time.RFC3339, endTimeStr); err == nil {
			req.EndTime = &t
		}
	}

	response, err := h.dashboardAppService.GetMeterData(memberID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Data:    response,
	})
}

// GetDashboardSummary - 獲取 Dashboard 總覽
func (h *DashboardHandler) GetDashboardSummary(c *gin.Context) {
	// 從 context 中獲取 memberID (由 auth middleware 設置)
	memberIDValue, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{
			Success: false,
			Error:   "unauthorized: member_id not found",
		})
		return
	}

	memberID, ok := memberIDValue.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   "invalid member_id type",
		})
		return
	}

	// 創建請求對象（雖然目前不需要參數，但保持一致性）
	req := &dto.DashboardSummaryRequest{}

	response, err := h.dashboardAppService.GetDashboardSummary(memberID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Data:    response,
	})
}

// GetTemperatureData - 獲取溫度數據
func (h *DashboardHandler) GetTemperatureData(c *gin.Context) {
	// 從 context 中獲取 memberID (由 auth middleware 設置)
	memberIDValue, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{
			Success: false,
			Error:   "unauthorized: member_id not found",
		})
		return
	}

	memberID, ok := memberIDValue.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   "invalid member_id type",
		})
		return
	}

	// 綁定請求參數
	var req dto.DashboardTemperatureRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		// 即使綁定失敗也繼續，使用默認值
	}

	// 解析時間參數（如果提供了字符串格式）
	if startTimeStr := c.Query("start_time"); startTimeStr != "" {
		if t, err := time.Parse(time.RFC3339, startTimeStr); err == nil {
			req.StartTime = &t
		}
	}
	if endTimeStr := c.Query("end_time"); endTimeStr != "" {
		if t, err := time.Parse(time.RFC3339, endTimeStr); err == nil {
			req.EndTime = &t
		}
	}

	response, err := h.dashboardTempService.GetTemperatureData(memberID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Data:    response,
	})
}

// GetCompanyList - 獲取用戶有權限的公司列表（用於下拉選單）
func (h *DashboardHandler) GetCompanyList(c *gin.Context) {
	// 從 context 中獲取 memberID (由 auth middleware 設置)
	memberIDValue, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{
			Success: false,
			Error:   "unauthorized: member_id not found",
		})
		return
	}

	memberID, ok := memberIDValue.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   "invalid member_id type",
		})
		return
	}

	// 創建請求對象
	req := &dto.DashboardCompanyListRequest{}

	response, err := h.dashboardAppService.GetCompanyList(memberID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Data:    response,
	})
}

// GetAreaList - 獲取指定公司的區域列表（用於下拉選單）
func (h *DashboardHandler) GetAreaList(c *gin.Context) {
	// 從 context 中獲取 memberID (由 auth middleware 設置)
	memberIDValue, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{
			Success: false,
			Error:   "unauthorized: member_id not found",
		})
		return
	}

	memberID, ok := memberIDValue.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   "invalid member_id type",
		})
		return
	}

	// 綁定請求參數
	var req dto.DashboardAreaListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{
			Success: false,
			Error:   "company_id is required",
		})
		return
	}

	response, err := h.dashboardAppService.GetAreaList(memberID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Data:    response,
	})
}

// GetAreaOverview - 獲取區域總覽（區域解構視圖）
func (h *DashboardHandler) GetAreaOverview(c *gin.Context) {
	// 從 context 中獲取 memberID (由 auth middleware 設置)
	memberIDValue, exists := c.Get("member_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.APIResponse{
			Success: false,
			Error:   "unauthorized: member_id not found",
		})
		return
	}

	memberID, ok := memberIDValue.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   "invalid member_id type",
		})
		return
	}

	// 綁定請求參數
	var req dto.DashboardAreaRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.APIResponse{
			Success: false,
			Error:   "company_id is required",
		})
		return
	}

	response, err := h.dashboardAreaService.GetAreaOverview(memberID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Data:    response,
	})
}
