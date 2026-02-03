package dto

import (
	"encoding/json"
	"time"

	companyEntities "ems_backend/internal/domain/company/entities"
	companyDeviceEntities "ems_backend/internal/domain/company_device/entities"
)

// ==================== Request DTOs ====================

// CreateCompanyRequest 創建公司請求
type CreateCompanyRequest struct {
	Name          string `json:"name" binding:"required"`
	Address       string `json:"address"`
	ContactPerson string `json:"contact_person"`
	ContactPhone  string `json:"contact_phone"`
	ParentID      *uint  `json:"parent_id"`
}

// UpdateCompanyRequest 更新公司請求
type UpdateCompanyRequest struct {
	Name          string `json:"name" binding:"required"`
	Address       string `json:"address"`
	ContactPerson string `json:"contact_person"`
	ContactPhone  string `json:"contact_phone"`
	IsActive      bool   `json:"is_active"`
	ParentID      *uint  `json:"parent_id"`
}

// CreateCompanyManagerRequest 創建公司管理員請求
type CreateCompanyManagerRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// AddCompanyMemberRequest 添加公司成員請求
type AddCompanyMemberRequest struct {
	MemberID uint `json:"member_id" binding:"required"`
}

// AssignDeviceRequest 分配設備請求
type AssignDeviceRequest struct {
	DeviceID uint            `json:"device_id" binding:"required"`
	Content  json.RawMessage `json:"content"`
}

// ==================== Response DTOs ====================

// CompanyResponse 公司響應
type CompanyResponse struct {
	ID            uint               `json:"id"`
	Name          string             `json:"name"`
	Address       string             `json:"address"`
	ContactPerson string             `json:"contact_person"`
	ContactPhone  string             `json:"contact_phone"`
	IsActive      bool               `json:"is_active"`
	ParentID      *uint              `json:"parent_id"`
	Children      []*CompanyResponse `json:"children,omitempty"`
	CreateID      uint               `json:"create_id"`
	CreateTime    time.Time          `json:"create_time"`
	ModifyID      uint               `json:"modify_id"`
	ModifyTime    time.Time          `json:"modify_time"`
}

// CompanyTreeResponse 公司樹結構響應
type CompanyTreeResponse struct {
	Company  *CompanyResponse       `json:"company"`
	Children []*CompanyTreeResponse `json:"children"`
}

// CompanyMemberResponse 公司成員響應
type CompanyMemberResponse struct {
	ID       uint   `json:"id"`
	MemberID uint   `json:"member_id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

// CompanyDeviceResponse 公司設備響應
type CompanyDeviceResponse struct {
	ID         uint            `json:"id"`
	CompanyID  uint            `json:"company_id"`
	DeviceID   uint            `json:"device_id"`
	DeviceSN   string          `json:"device_sn"`
	Content    json.RawMessage `json:"content"`
	CreateID   uint            `json:"create_id"`
	CreateTime time.Time       `json:"create_time"`
	ModifyID   uint            `json:"modify_id"`
	ModifyTime time.Time       `json:"modify_time"`
}

// ==================== Mapper Functions ====================

// NewCompanyResponse 從實體創建公司響應
func NewCompanyResponse(e *companyEntities.Company) *CompanyResponse {
	return &CompanyResponse{
		ID:            e.ID,
		Name:          e.Name,
		Address:       e.Address,
		ContactPerson: e.ContactPerson,
		ContactPhone:  e.ContactPhone,
		IsActive:      e.IsActive,
		ParentID:      e.ParentID,
		CreateID:      e.CreateID,
		CreateTime:    e.CreateTime,
		ModifyID:      e.ModifyID,
		ModifyTime:    e.ModifyTime,
	}
}

// NewCompanyResponseList 從實體列表創建公司響應列表
func NewCompanyResponseList(companies []*companyEntities.Company) []*CompanyResponse {
	result := make([]*CompanyResponse, len(companies))
	for i, c := range companies {
		result[i] = NewCompanyResponse(c)
	}
	return result
}

// NewCompanyMemberResponse 從實體創建公司成員響應
func NewCompanyMemberResponse(e *companyEntities.CompanyMemberWithDetails) *CompanyMemberResponse {
	return &CompanyMemberResponse{
		ID:       e.ID,
		MemberID: e.MemberID,
		Name:     e.MemberName,
		Email:    e.Email,
		Role:     e.RoleTitle,
	}
}

// NewCompanyMemberResponseList 從實體列表創建公司成員響應列表
func NewCompanyMemberResponseList(members []*companyEntities.CompanyMemberWithDetails) []*CompanyMemberResponse {
	result := make([]*CompanyMemberResponse, len(members))
	for i, m := range members {
		result[i] = NewCompanyMemberResponse(m)
	}
	return result
}

// NewCompanyDeviceResponse 從實體創建公司設備響應
func NewCompanyDeviceResponse(e *companyDeviceEntities.CompanyDevice, deviceSN string) *CompanyDeviceResponse {
	return &CompanyDeviceResponse{
		ID:         e.ID,
		CompanyID:  e.CompanyID,
		DeviceID:   e.DeviceID,
		DeviceSN:   deviceSN,
		Content:    e.Content,
		CreateID:   e.CreateID,
		CreateTime: e.CreateTime,
		ModifyID:   e.ModifyID,
		ModifyTime: e.ModifyTime,
	}
}

// BuildCompanyTree 構建公司樹結構
func BuildCompanyTree(companies []*companyEntities.Company, rootID uint) *CompanyTreeResponse {
	// 建立 ID -> Company 映射
	companyMap := make(map[uint]*companyEntities.Company)
	for _, c := range companies {
		companyMap[c.ID] = c
	}

	// 找到根公司
	root, exists := companyMap[rootID]
	if !exists {
		return nil
	}

	return buildTreeNode(root, companies)
}

func buildTreeNode(company *companyEntities.Company, allCompanies []*companyEntities.Company) *CompanyTreeResponse {
	node := &CompanyTreeResponse{
		Company:  NewCompanyResponse(company),
		Children: []*CompanyTreeResponse{},
	}

	// 找到所有子公司
	for _, c := range allCompanies {
		if c.ParentID != nil && *c.ParentID == company.ID {
			childNode := buildTreeNode(c, allCompanies)
			node.Children = append(node.Children, childNode)
		}
	}

	return node
}

// BuildCompanyHierarchy 構建公司層級列表（包含 children）
func BuildCompanyHierarchy(companies []*companyEntities.Company) []*CompanyResponse {
	// 建立 ID -> Response 映射
	responseMap := make(map[uint]*CompanyResponse)
	for _, c := range companies {
		responseMap[c.ID] = NewCompanyResponse(c)
	}

	// 建立父子關係
	var roots []*CompanyResponse
	for _, c := range companies {
		response := responseMap[c.ID]
		if c.ParentID == nil {
			roots = append(roots, response)
		} else if parent, exists := responseMap[*c.ParentID]; exists {
			if parent.Children == nil {
				parent.Children = []*CompanyResponse{}
			}
			parent.Children = append(parent.Children, response)
		} else {
			// 如果父公司不在列表中，視為頂層
			roots = append(roots, response)
		}
	}

	return roots
}
