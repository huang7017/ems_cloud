package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"ems_backend/internal/application/dto"
	"ems_backend/internal/application/services"

	"github.com/gin-gonic/gin"
)

// CompanyHandler 公司管理處理器
type CompanyHandler struct {
	companyAppService  *services.CompanyApplicationService
	scheduleAppService *services.ScheduleApplicationService
}

// NewCompanyHandler 創建公司管理處理器
func NewCompanyHandler(
	companyAppService *services.CompanyApplicationService,
	scheduleAppService *services.ScheduleApplicationService,
) *CompanyHandler {
	return &CompanyHandler{
		companyAppService:  companyAppService,
		scheduleAppService: scheduleAppService,
	}
}

// GetAll 獲取所有可訪問的公司
// @Summary 獲取公司列表
// @Tags companies
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /companies [get]
func (h *CompanyHandler) GetAll(c *gin.Context) {
	memberID, roleID, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	companies, err := h.companyAppService.GetAccessibleCompanies(memberID, roleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    companies,
	})
}

// GetByID 根據 ID 獲取公司
// @Summary 獲取公司詳情
// @Tags companies
// @Produce json
// @Param id path int true "公司 ID"
// @Success 200 {object} map[string]interface{}
// @Router /companies/{id} [get]
func (h *CompanyHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	memberID, roleID, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	company, err := h.companyAppService.GetByID(uint(id), memberID, roleID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    company,
	})
}

// Create 創建公司
// @Summary 創建公司
// @Tags companies
// @Accept json
// @Produce json
// @Param company body dto.CreateCompanyRequest true "公司信息"
// @Success 201 {object} map[string]interface{}
// @Router /companies [post]
func (h *CompanyHandler) Create(c *gin.Context) {
	var req dto.CreateCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	memberID, _, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	company, err := h.companyAppService.Create(&req, memberID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    company,
		"message": "公司創建成功",
	})
}

// Update 更新公司
// @Summary 更新公司
// @Tags companies
// @Accept json
// @Produce json
// @Param id path int true "公司 ID"
// @Param company body dto.UpdateCompanyRequest true "公司信息"
// @Success 200 {object} map[string]interface{}
// @Router /companies/{id} [put]
func (h *CompanyHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	var req dto.UpdateCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	memberID, roleID, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	company, err := h.companyAppService.Update(uint(id), &req, memberID, roleID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    company,
		"message": "公司更新成功",
	})
}

// Delete 刪除公司
// @Summary 刪除公司
// @Tags companies
// @Produce json
// @Param id path int true "公司 ID"
// @Success 200 {object} map[string]interface{}
// @Router /companies/{id} [delete]
func (h *CompanyHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	memberID, _, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	if err := h.companyAppService.Delete(uint(id), memberID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "公司刪除成功",
	})
}

// GetTree 獲取公司樹結構
// @Summary 獲取公司樹結構
// @Tags companies
// @Produce json
// @Param id path int true "公司 ID"
// @Success 200 {object} map[string]interface{}
// @Router /companies/{id}/tree [get]
func (h *CompanyHandler) GetTree(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	memberID, roleID, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	tree, err := h.companyAppService.GetCompanyTree(uint(id), memberID, roleID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    tree,
	})
}

// CreateManager 為公司創建管理員
// @Summary 創建公司管理員
// @Tags companies
// @Accept json
// @Produce json
// @Param id path int true "公司 ID"
// @Param manager body dto.CreateCompanyManagerRequest true "管理員信息"
// @Success 201 {object} map[string]interface{}
// @Router /companies/{id}/manager [post]
func (h *CompanyHandler) CreateManager(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	var req dto.CreateCompanyManagerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	memberID, _, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	if err := h.companyAppService.CreateCompanyManager(uint(id), &req, memberID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "管理員創建成功",
	})
}

// CreateUser 為公司創建用戶
// @Summary 創建公司用戶
// @Tags companies
// @Accept json
// @Produce json
// @Param id path int true "公司 ID"
// @Param user body dto.CreateCompanyManagerRequest true "用戶信息"
// @Success 201 {object} map[string]interface{}
// @Router /companies/{id}/user [post]
func (h *CompanyHandler) CreateUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	var req dto.CreateCompanyManagerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	memberID, roleID, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	if err := h.companyAppService.CreateCompanyUser(uint(id), &req, memberID, roleID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "用戶創建成功",
	})
}

// GetMembers 獲取公司成員列表
// @Summary 獲取公司成員
// @Tags companies
// @Produce json
// @Param id path int true "公司 ID"
// @Success 200 {object} map[string]interface{}
// @Router /companies/{id}/members [get]
func (h *CompanyHandler) GetMembers(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	memberID, roleID, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	members, err := h.companyAppService.GetCompanyMembers(uint(id), memberID, roleID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    members,
	})
}

// AddMember 添加成員到公司
// @Summary 添加公司成員
// @Tags companies
// @Accept json
// @Produce json
// @Param id path int true "公司 ID"
// @Param member body dto.AddCompanyMemberRequest true "成員信息"
// @Success 201 {object} map[string]interface{}
// @Router /companies/{id}/members [post]
func (h *CompanyHandler) AddMember(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	var req dto.AddCompanyMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	memberID, roleID, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	if err := h.companyAppService.AddMemberToCompany(uint(id), &req, memberID, roleID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "成員添加成功",
	})
}

// RemoveMember 從公司移除成員
// @Summary 移除公司成員
// @Tags companies
// @Produce json
// @Param id path int true "公司 ID"
// @Param memberId path int true "成員 ID"
// @Success 200 {object} map[string]interface{}
// @Router /companies/{id}/members/{memberId} [delete]
func (h *CompanyHandler) RemoveMember(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	targetMemberID, err := strconv.ParseUint(c.Param("memberId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid member ID",
		})
		return
	}

	memberID, roleID, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	if err := h.companyAppService.RemoveMemberFromCompany(uint(id), uint(targetMemberID), memberID, roleID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "成員移除成功",
	})
}

// GetDevices 獲取公司設備列表
// @Summary 獲取公司設備
// @Tags companies
// @Produce json
// @Param id path int true "公司 ID"
// @Success 200 {object} map[string]interface{}
// @Router /companies/{id}/devices [get]
func (h *CompanyHandler) GetDevices(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	memberID, roleID, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	devices, err := h.companyAppService.GetCompanyDevices(uint(id), memberID, roleID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    devices,
	})
}

// AssignDevice 分配設備給公司
// @Summary 分配設備
// @Tags companies
// @Accept json
// @Produce json
// @Param id path int true "公司 ID"
// @Param device body dto.AssignDeviceRequest true "設備信息"
// @Success 201 {object} map[string]interface{}
// @Router /companies/{id}/devices [post]
func (h *CompanyHandler) AssignDevice(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	var req dto.AssignDeviceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	memberID, _, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	if err := h.companyAppService.AssignDeviceToCompany(uint(id), &req, memberID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "設備分配成功",
	})
}

// RemoveDevice 從公司移除設備
// @Summary 移除設備
// @Tags companies
// @Produce json
// @Param id path int true "公司 ID"
// @Param deviceId path int true "設備 ID"
// @Success 200 {object} map[string]interface{}
// @Router /companies/{id}/devices/{deviceId} [delete]
func (h *CompanyHandler) RemoveDevice(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	deviceID, err := strconv.ParseUint(c.Param("deviceId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid device ID",
		})
		return
	}

	memberID, _, err := getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	if err := h.companyAppService.RemoveDeviceFromCompany(uint(id), uint(deviceID), memberID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "設備移除成功",
	})
}

// SyncDeviceSchedule 同步設備排程
// @Summary 同步設備排程到設備
// @Tags companies
// @Produce json
// @Param id path int true "公司 ID"
// @Param deviceId path int true "設備 ID (device.id)"
// @Success 200 {object} map[string]interface{}
// @Router /companies/{id}/devices/{deviceId}/sync [post]
func (h *CompanyHandler) SyncDeviceSchedule(c *gin.Context) {
	companyID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	deviceID, err := strconv.ParseUint(c.Param("deviceId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid device ID",
		})
		return
	}

	// Verify access
	_, _, err = getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Find company_device by company_id and device_id
	companyDevice, err := h.companyAppService.GetCompanyDeviceByCompanyAndDevice(uint(companyID), uint(deviceID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "company device not found",
		})
		return
	}

	// Send getSchedule command to device via MQTT to fetch schedule from device
	if err := h.scheduleAppService.QueryScheduleFromDevice(companyDevice.ID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"message":    "已發送排程查詢請求",
		"company_id": companyID,
		"device_id":  deviceID,
	})
}

// QueryDeviceInfo 查詢設備資訊
// @Summary 查詢設備資訊
// @Tags companies
// @Produce json
// @Param id path int true "公司 ID"
// @Param deviceId path int true "設備 ID (device.id)"
// @Success 200 {object} map[string]interface{}
// @Router /companies/{id}/devices/{deviceId}/info [post]
func (h *CompanyHandler) QueryDeviceInfo(c *gin.Context) {
	companyID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid company ID",
		})
		return
	}

	deviceID, err := strconv.ParseUint(c.Param("deviceId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "invalid device ID",
		})
		return
	}

	// Verify access
	_, _, err = getMemberAndRoleFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Find company_device by company_id and device_id
	companyDevice, err := h.companyAppService.GetCompanyDeviceByCompanyAndDevice(uint(companyID), uint(deviceID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "company device not found",
		})
		return
	}

	// Send deviceInfo command via MQTT using company_device.ID
	if err := h.scheduleAppService.QueryDeviceInfo(companyDevice.ID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"message":    "已發送設備資訊查詢請求",
		"company_id": companyID,
		"device_id":  deviceID,
	})
}

// ==================== 輔助函數 ====================

// getMemberAndRoleFromContext 從上下文獲取 member_id 和 role_id
func getMemberAndRoleFromContext(c *gin.Context) (uint, uint, error) {
	memberIDVal, exists := c.Get("member_id")
	if !exists {
		return 0, 0, errors.New("unauthorized")
	}
	memberID, ok := memberIDVal.(uint)
	if !ok {
		return 0, 0, errors.New("invalid member_id")
	}

	roleIDVal, exists := c.Get("current_role_id")
	if !exists {
		return 0, 0, errors.New("no role selected")
	}
	roleID, ok := roleIDVal.(uint)
	if !ok {
		return 0, 0, errors.New("invalid role_id")
	}

	return memberID, roleID, nil
}

