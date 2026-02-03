package services

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"ems_backend/internal/application/dto"
	companyEntities "ems_backend/internal/domain/company/entities"
	companyRepos "ems_backend/internal/domain/company/repositories"
	companyDeviceEntities "ems_backend/internal/domain/company_device/entities"
	companyDeviceRepos "ems_backend/internal/domain/company_device/repositories"
	deviceRepos "ems_backend/internal/domain/device/repositories"
	memberEntities "ems_backend/internal/domain/member/entities"
	memberRepos "ems_backend/internal/domain/member/repositories"
	memberValueObjects "ems_backend/internal/domain/member/value_objects"
	memberHistoryEntities "ems_backend/internal/domain/member_history/entities"
	memberHistoryRepos "ems_backend/internal/domain/member_history/repositories"
	roleRepos "ems_backend/internal/domain/role/repositories"
	roleService "ems_backend/internal/domain/role/services"
)

// Role IDs - should match database
const (
	RoleSystemAdmin     = 1
	RoleCompanyManager  = 2
	RoleCompanyUser     = 3
)

// CompanyApplicationService 公司管理應用服務
type CompanyApplicationService struct {
	companyRepo       companyRepos.CompanyRepository
	companyMemberRepo companyRepos.CompanyMemberRepository
	companyDeviceRepo companyDeviceRepos.CompanyDeviceRepository
	deviceRepo        deviceRepos.DeviceRepository
	memberRepo        memberRepos.MemberRepository
	memberHistoryRepo memberHistoryRepos.MemberHistoryRepository
	roleRepo          roleRepos.RoleRepository
	roleService       *roleService.RoleService
}

// NewCompanyApplicationService 創建公司管理應用服務
func NewCompanyApplicationService(
	companyRepo companyRepos.CompanyRepository,
	companyMemberRepo companyRepos.CompanyMemberRepository,
	companyDeviceRepo companyDeviceRepos.CompanyDeviceRepository,
	deviceRepo deviceRepos.DeviceRepository,
	memberRepo memberRepos.MemberRepository,
	memberHistoryRepo memberHistoryRepos.MemberHistoryRepository,
	roleRepo roleRepos.RoleRepository,
	roleService *roleService.RoleService,
) *CompanyApplicationService {
	return &CompanyApplicationService{
		companyRepo:       companyRepo,
		companyMemberRepo: companyMemberRepo,
		companyDeviceRepo: companyDeviceRepo,
		deviceRepo:        deviceRepo,
		memberRepo:        memberRepo,
		memberHistoryRepo: memberHistoryRepo,
		roleRepo:          roleRepo,
		roleService:       roleService,
	}
}

// GetAccessibleCompanies 獲取當前用戶可訪問的公司列表
func (s *CompanyApplicationService) GetAccessibleCompanies(memberID, roleID uint) ([]*dto.CompanyResponse, error) {
	companies, err := s.getAccessibleCompanyEntities(memberID, roleID)
	if err != nil {
		return nil, err
	}

	// 構建帶層級結構的響應
	return dto.BuildCompanyHierarchy(companies), nil
}

// GetByID 根據 ID 獲取公司詳情
func (s *CompanyApplicationService) GetByID(id, memberID, roleID uint) (*dto.CompanyResponse, error) {
	// 檢查訪問權限
	if !s.canAccessCompany(memberID, roleID, id) {
		return nil, errors.New("access denied")
	}

	company, err := s.companyRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	return dto.NewCompanyResponse(company), nil
}

// Create 創建公司 (僅 SystemAdmin)
func (s *CompanyApplicationService) Create(req *dto.CreateCompanyRequest, memberID uint) (*dto.CompanyResponse, error) {
	// 如果指定了 ParentID，檢查父公司是否存在
	if req.ParentID != nil {
		exists, err := s.companyRepo.ExistsByID(*req.ParentID)
		if err != nil {
			return nil, err
		}
		if !exists {
			return nil, errors.New("parent company not found")
		}
	}

	now := time.Now()
	company := &companyEntities.Company{
		Name:          req.Name,
		Address:       req.Address,
		ContactPerson: req.ContactPerson,
		ContactPhone:  req.ContactPhone,
		IsActive:      true,
		ParentID:      req.ParentID,
		CreateID:      memberID,
		CreateTime:    now,
		ModifyID:      memberID,
		ModifyTime:    now,
	}

	if err := s.companyRepo.Save(company); err != nil {
		return nil, err
	}

	return dto.NewCompanyResponse(company), nil
}

// Update 更新公司
func (s *CompanyApplicationService) Update(id uint, req *dto.UpdateCompanyRequest, memberID, roleID uint) (*dto.CompanyResponse, error) {
	// 檢查訪問權限
	if !s.canAccessCompany(memberID, roleID, id) {
		return nil, errors.New("access denied")
	}

	company, err := s.companyRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// 如果指定了新的 ParentID，檢查是否會造成循環引用
	if req.ParentID != nil {
		if *req.ParentID == id {
			return nil, errors.New("company cannot be its own parent")
		}
		// 檢查是否會造成循環 (新 parent 是否是當前公司的子公司)
		descendants, _ := s.companyRepo.FindDescendants(id)
		for _, d := range descendants {
			if d.ID == *req.ParentID {
				return nil, errors.New("circular reference detected")
			}
		}
	}

	company.Name = req.Name
	company.Address = req.Address
	company.ContactPerson = req.ContactPerson
	company.ContactPhone = req.ContactPhone
	company.IsActive = req.IsActive
	company.ParentID = req.ParentID
	company.ModifyID = memberID
	company.ModifyTime = time.Now()

	if err := s.companyRepo.Update(company); err != nil {
		return nil, err
	}

	return dto.NewCompanyResponse(company), nil
}

// Delete 刪除公司 (僅 SystemAdmin)
func (s *CompanyApplicationService) Delete(id, memberID uint) error {
	// 檢查公司是否存在
	_, err := s.companyRepo.FindByID(id)
	if err != nil {
		return err
	}

	// 檢查是否有子公司
	children, err := s.companyRepo.FindByParentID(&id)
	if err != nil {
		return err
	}
	if len(children) > 0 {
		return errors.New("cannot delete company with subsidiaries")
	}

	return s.companyRepo.Delete(id)
}

// GetCompanyTree 獲取公司樹結構
func (s *CompanyApplicationService) GetCompanyTree(companyID, memberID, roleID uint) (*dto.CompanyTreeResponse, error) {
	// 檢查訪問權限
	if !s.canAccessCompany(memberID, roleID, companyID) {
		return nil, errors.New("access denied")
	}

	// 獲取公司及其所有子公司
	companies, err := s.companyRepo.FindWithDescendants(companyID)
	if err != nil {
		return nil, err
	}

	return dto.BuildCompanyTree(companies, companyID), nil
}

// CreateCompanyManager 為公司創建管理員 (僅 SystemAdmin)
func (s *CompanyApplicationService) CreateCompanyManager(companyID uint, req *dto.CreateCompanyManagerRequest, createID uint) error {
	// 檢查公司是否存在
	_, err := s.companyRepo.FindByID(companyID)
	if err != nil {
		return errors.New("company not found")
	}

	// 檢查郵箱是否已存在
	existingMember, _ := s.memberRepo.FindByEmail(req.Email)
	if existingMember != nil {
		return errors.New("email already exists")
	}

	// 創建成員
	memberID, err := memberValueObjects.NewMemberID(0)
	if err != nil {
		return fmt.Errorf("failed to create member ID: %w", err)
	}

	name, err := memberValueObjects.NewName(req.Name)
	if err != nil {
		return fmt.Errorf("invalid name: %w", err)
	}

	email, err := memberValueObjects.NewEmail(req.Email)
	if err != nil {
		return fmt.Errorf("invalid email: %w", err)
	}

	member := &memberEntities.Member{
		ID:        memberID,
		Name:      name,
		Email:     email,
		IsEnable:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.memberRepo.Save(member); err != nil {
		return fmt.Errorf("failed to save member: %w", err)
	}

	// 生成密碼
	salt, err := s.generateSalt()
	if err != nil {
		return fmt.Errorf("failed to generate salt: %w", err)
	}

	memberHistory := &memberHistoryEntities.MemberHistory{}
	hash := memberHistory.HashPassword(req.Password, salt)

	memberHistory.MemberID = member.ID
	memberHistory.Salt = salt
	memberHistory.Hash = hash
	memberHistory.ErrorCount = 0
	memberHistory.CreateID = createID
	memberHistory.CreateTime = time.Now()
	memberHistory.ModifyID = createID
	memberHistory.ModifyTime = time.Now()

	if err := s.memberHistoryRepo.Save(memberHistory); err != nil {
		return fmt.Errorf("failed to save member history: %w", err)
	}

	// 分配 company_manager 角色
	if err := s.roleService.AssignMembers(RoleCompanyManager, []uint{uint(member.ID.Value())}, createID); err != nil {
		return fmt.Errorf("failed to assign role: %w", err)
	}

	// 關聯到公司
	now := time.Now()
	companyMember := &companyEntities.CompanyMember{
		CompanyID:  companyID,
		MemberID:   uint(member.ID.Value()),
		CreateID:   createID,
		CreateTime: now,
		ModifyID:   createID,
		ModifyTime: now,
	}

	if err := s.companyMemberRepo.Save(companyMember); err != nil {
		return fmt.Errorf("failed to associate member with company: %w", err)
	}

	return nil
}

// CreateCompanyUser 創建公司用戶 (company_manager 可用)
func (s *CompanyApplicationService) CreateCompanyUser(companyID uint, req *dto.CreateCompanyManagerRequest, createID, roleID uint) error {
	// 檢查訪問權限
	if !s.canAccessCompany(createID, roleID, companyID) {
		return errors.New("access denied")
	}

	// 檢查郵箱是否已存在
	existingMember, _ := s.memberRepo.FindByEmail(req.Email)
	if existingMember != nil {
		return errors.New("email already exists")
	}

	// 創建成員
	memberID, err := memberValueObjects.NewMemberID(0)
	if err != nil {
		return fmt.Errorf("failed to create member ID: %w", err)
	}

	name, err := memberValueObjects.NewName(req.Name)
	if err != nil {
		return fmt.Errorf("invalid name: %w", err)
	}

	email, err := memberValueObjects.NewEmail(req.Email)
	if err != nil {
		return fmt.Errorf("invalid email: %w", err)
	}

	member := &memberEntities.Member{
		ID:        memberID,
		Name:      name,
		Email:     email,
		IsEnable:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.memberRepo.Save(member); err != nil {
		return fmt.Errorf("failed to save member: %w", err)
	}

	// 生成密碼
	salt, err := s.generateSalt()
	if err != nil {
		return fmt.Errorf("failed to generate salt: %w", err)
	}

	memberHistory := &memberHistoryEntities.MemberHistory{}
	hash := memberHistory.HashPassword(req.Password, salt)

	memberHistory.MemberID = member.ID
	memberHistory.Salt = salt
	memberHistory.Hash = hash
	memberHistory.ErrorCount = 0
	memberHistory.CreateID = createID
	memberHistory.CreateTime = time.Now()
	memberHistory.ModifyID = createID
	memberHistory.ModifyTime = time.Now()

	if err := s.memberHistoryRepo.Save(memberHistory); err != nil {
		return fmt.Errorf("failed to save member history: %w", err)
	}

	// 分配 company_user 角色
	if err := s.roleService.AssignMembers(RoleCompanyUser, []uint{uint(member.ID.Value())}, createID); err != nil {
		return fmt.Errorf("failed to assign role: %w", err)
	}

	// 關聯到公司
	now := time.Now()
	companyMember := &companyEntities.CompanyMember{
		CompanyID:  companyID,
		MemberID:   uint(member.ID.Value()),
		CreateID:   createID,
		CreateTime: now,
		ModifyID:   createID,
		ModifyTime: now,
	}

	if err := s.companyMemberRepo.Save(companyMember); err != nil {
		return fmt.Errorf("failed to associate member with company: %w", err)
	}

	return nil
}

// GetCompanyMembers 獲取公司成員列表
func (s *CompanyApplicationService) GetCompanyMembers(companyID, memberID, roleID uint) ([]*dto.CompanyMemberResponse, error) {
	// 檢查訪問權限
	if !s.canAccessCompany(memberID, roleID, companyID) {
		return nil, errors.New("access denied")
	}

	members, err := s.companyMemberRepo.FindByCompanyIDWithDetails(companyID)
	if err != nil {
		return nil, err
	}

	return dto.NewCompanyMemberResponseList(members), nil
}

// AddMemberToCompany 添加成員到公司
func (s *CompanyApplicationService) AddMemberToCompany(companyID uint, req *dto.AddCompanyMemberRequest, createID, roleID uint) error {
	// 檢查訪問權限
	if !s.canAccessCompany(createID, roleID, companyID) {
		return errors.New("access denied")
	}

	// 檢查成員是否存在
	_, err := s.memberRepo.FindByID(fmt.Sprintf("%d", req.MemberID))
	if err != nil {
		return errors.New("member not found")
	}

	// 檢查關聯是否已存在
	exists, err := s.companyMemberRepo.ExistsByCompanyAndMember(companyID, req.MemberID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("member already in company")
	}

	now := time.Now()
	companyMember := &companyEntities.CompanyMember{
		CompanyID:  companyID,
		MemberID:   req.MemberID,
		CreateID:   createID,
		CreateTime: now,
		ModifyID:   createID,
		ModifyTime: now,
	}

	return s.companyMemberRepo.Save(companyMember)
}

// RemoveMemberFromCompany 從公司移除成員
func (s *CompanyApplicationService) RemoveMemberFromCompany(companyID, targetMemberID, memberID, roleID uint) error {
	// 檢查訪問權限
	if !s.canAccessCompany(memberID, roleID, companyID) {
		return errors.New("access denied")
	}

	return s.companyMemberRepo.DeleteByCompanyAndMember(companyID, targetMemberID)
}

// GetCompanyDevices 獲取公司設備列表
func (s *CompanyApplicationService) GetCompanyDevices(companyID, memberID, roleID uint) ([]*dto.CompanyDeviceResponse, error) {
	// 檢查訪問權限
	if !s.canAccessCompany(memberID, roleID, companyID) {
		return nil, errors.New("access denied")
	}

	companyDevices, err := s.companyDeviceRepo.FindByCompanyID(companyID)
	if err != nil {
		return nil, err
	}

	// 獲取設備詳情
	result := make([]*dto.CompanyDeviceResponse, 0, len(companyDevices))
	for _, cd := range companyDevices {
		device, err := s.deviceRepo.FindByID(cd.DeviceID)
		deviceSN := ""
		if err == nil && device != nil {
			deviceSN = device.SN
		}
		result = append(result, dto.NewCompanyDeviceResponse(cd, deviceSN))
	}

	return result, nil
}

// AssignDeviceToCompany 分配設備給公司 (僅 SystemAdmin)
func (s *CompanyApplicationService) AssignDeviceToCompany(companyID uint, req *dto.AssignDeviceRequest, memberID uint) error {
	// 檢查公司是否存在
	_, err := s.companyRepo.FindByID(companyID)
	if err != nil {
		return errors.New("company not found")
	}

	// 檢查設備是否存在
	_, err = s.deviceRepo.FindByID(req.DeviceID)
	if err != nil {
		return errors.New("device not found")
	}

	// 檢查設備是否已分配給其他公司
	existing, _ := s.companyDeviceRepo.FindByDeviceID(req.DeviceID)
	if existing != nil {
		return errors.New("device already assigned to a company")
	}

	// 處理 content，如果為空則使用默認空 JSON
	content := req.Content
	if content == nil {
		content = json.RawMessage(`{}`)
	}

	now := time.Now()
	companyDevice := &companyDeviceEntities.CompanyDevice{
		CompanyID:  companyID,
		DeviceID:   req.DeviceID,
		Content:    content,
		CreateID:   memberID,
		CreateTime: now,
		ModifyID:   memberID,
		ModifyTime: now,
	}

	return s.companyDeviceRepo.Save(companyDevice)
}

// RemoveDeviceFromCompany 從公司移除設備 (僅 SystemAdmin)
func (s *CompanyApplicationService) RemoveDeviceFromCompany(companyID, deviceID, memberID uint) error {
	return s.companyDeviceRepo.DeleteByCompanyAndDevice(companyID, deviceID)
}

// GetCompanyDeviceByCompanyAndDevice 根據公司 ID 和設備 ID 獲取公司設備關聯
func (s *CompanyApplicationService) GetCompanyDeviceByCompanyAndDevice(companyID, deviceID uint) (*companyDeviceEntities.CompanyDevice, error) {
	return s.companyDeviceRepo.FindByCompanyAndDevice(companyID, deviceID)
}

// ==================== 私有輔助方法 ====================

// getAccessibleCompanyEntities 獲取當前用戶可訪問的公司實體列表
func (s *CompanyApplicationService) getAccessibleCompanyEntities(memberID, roleID uint) ([]*companyEntities.Company, error) {
	role, err := s.roleRepo.GetByID(roleID)
	if err != nil {
		return nil, err
	}

	switch role.Title {
	case "SystemAdmin":
		// SystemAdmin 可以訪問所有公司
		return s.companyRepo.FindAll()

	case "company_manager":
		// company_manager 可以訪問自己的公司及其所有子公司
		memberCompanies, err := s.companyRepo.FindByMemberID(memberID)
		if err != nil {
			return nil, err
		}
		if len(memberCompanies) == 0 {
			return []*companyEntities.Company{}, nil
		}

		// 收集所有可訪問的公司（自己的公司 + 所有子公司）
		accessibleMap := make(map[uint]*companyEntities.Company)
		for _, c := range memberCompanies {
			accessibleMap[c.ID] = c
			descendants, err := s.companyRepo.FindDescendants(c.ID)
			if err != nil {
				continue
			}
			for _, d := range descendants {
				accessibleMap[d.ID] = d
			}
		}

		result := make([]*companyEntities.Company, 0, len(accessibleMap))
		for _, c := range accessibleMap {
			result = append(result, c)
		}
		return result, nil

	case "company_user":
		// company_user 只能訪問自己被分配的公司
		return s.companyRepo.FindByMemberID(memberID)

	default:
		return []*companyEntities.Company{}, nil
	}
}

// canAccessCompany 檢查用戶是否可以訪問指定公司
func (s *CompanyApplicationService) canAccessCompany(memberID, roleID, companyID uint) bool {
	accessibleCompanies, err := s.getAccessibleCompanyEntities(memberID, roleID)
	if err != nil {
		return false
	}

	for _, c := range accessibleCompanies {
		if c.ID == companyID {
			return true
		}
	}
	return false
}

// generateSalt 生成隨機鹽值
func (s *CompanyApplicationService) generateSalt() (string, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(salt), nil
}

// GetAllCompanies 獲取所有公司 (僅 SystemAdmin 使用)
func (s *CompanyApplicationService) GetAllCompanies() ([]*dto.CompanyResponse, error) {
	companies, err := s.companyRepo.FindAll()
	if err != nil {
		return nil, err
	}
	return dto.BuildCompanyHierarchy(companies), nil
}
