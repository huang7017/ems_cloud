package services

import (
	"crypto/rand"
	"ems_backend/internal/application/dto"
	memberEntities "ems_backend/internal/domain/member/entities"
	memberRepo "ems_backend/internal/domain/member/repositories"
	memberValueObjects "ems_backend/internal/domain/member/value_objects"
	memberHistoryEntities "ems_backend/internal/domain/member_history/entities"
	memberHistoryRepo "ems_backend/internal/domain/member_history/repositories"
	memberRoleRepo "ems_backend/internal/domain/member_role/repositories"
	roleService "ems_backend/internal/domain/role/services"
	"encoding/base64"
	"fmt"
	"time"
)

type MemberApplicationService struct {
	memberRepo        memberRepo.MemberRepository
	memberRoleRepo    memberRoleRepo.MemberRoleRepository
	memberHistoryRepo memberHistoryRepo.MemberHistoryRepository
	roleService       *roleService.RoleService
}

func NewMemberApplicationService(
	memberRepo memberRepo.MemberRepository,
	memberRoleRepo memberRoleRepo.MemberRoleRepository,
	memberHistoryRepo memberHistoryRepo.MemberHistoryRepository,
	roleService *roleService.RoleService,
) *MemberApplicationService {
	return &MemberApplicationService{
		memberRepo:        memberRepo,
		memberRoleRepo:    memberRoleRepo,
		memberHistoryRepo: memberHistoryRepo,
		roleService:       roleService,
	}
}

// GetAll 獲取所有成員
func (s *MemberApplicationService) GetAll() (*dto.APIResponse, error) {
	members, err := s.memberRepo.FindAll()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch members: %w", err)
	}

	// 轉換為 DTO
	memberDTOs := make([]dto.MemberDTO, 0, len(members))
	for _, member := range members {
		// 獲取成員的所有角色
		memberRoles, err := s.memberRoleRepo.GetByMemberID(uint(member.ID.Value()))
		if err != nil {
			return nil, fmt.Errorf("failed to fetch member roles: %w", err)
		}

		roles := make([]dto.RoleInfo, 0, len(memberRoles))
		for _, mr := range memberRoles {
			roles = append(roles, dto.RoleInfo{
				ID:   mr.RoleID,
				Name: mr.RoleName,
			})
		}

		memberDTO := dto.MemberDTO{
			ID:       uint(member.ID.Value()),
			Name:     member.Name.String(),
			Email:    member.Email.String(),
			IsEnable: member.IsEnable,
			Roles:    roles,
		}
		memberDTOs = append(memberDTOs, memberDTO)
	}

	return &dto.APIResponse{
		Success: true,
		Data:    memberDTOs,
	}, nil
}

// GetByID 根據ID獲取成員
func (s *MemberApplicationService) GetByID(id uint) (*dto.APIResponse, error) {
	member, err := s.memberRepo.FindByID(fmt.Sprintf("%d", id))
	if err != nil {
		return nil, fmt.Errorf("member not found: %w", err)
	}

	// 獲取成員的所有角色
	memberRoles, err := s.memberRoleRepo.GetByMemberID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch member roles: %w", err)
	}

	roles := make([]dto.RoleInfo, 0, len(memberRoles))
	for _, mr := range memberRoles {
		roles = append(roles, dto.RoleInfo{
			ID:   mr.RoleID,
			Name: mr.RoleName,
		})
	}

	memberDTO := dto.MemberDTO{
		ID:       uint(member.ID.Value()),
		Name:     member.Name.String(),
		Email:    member.Email.String(),
		IsEnable: member.IsEnable,
		Roles:    roles,
	}

	return &dto.APIResponse{
		Success: true,
		Data:    memberDTO,
	}, nil
}

// UpdateStatus 更新成員狀態
func (s *MemberApplicationService) UpdateStatus(id uint, isEnable bool, modifyID uint) (*dto.APIResponse, error) {
	member, err := s.memberRepo.FindByID(fmt.Sprintf("%d", id))
	if err != nil {
		return nil, fmt.Errorf("member not found: %w", err)
	}

	member.IsEnable = isEnable
	if err := s.memberRepo.Update(member); err != nil {
		return nil, fmt.Errorf("failed to update member status: %w", err)
	}

	return &dto.APIResponse{
		Success: true,
		Data:    "Member status updated successfully",
	}, nil
}

// Create 創建成員
func (s *MemberApplicationService) Create(req *dto.MemberCreateRequest, createID uint) (*dto.APIResponse, error) {
	// 1. 檢查郵箱是否已存在
	existingMember, _ := s.memberRepo.FindByEmail(req.Email)
	if existingMember != nil {
		return nil, fmt.Errorf("email already exists")
	}

	// 2. 創建成員實體
	memberID, err := memberValueObjects.NewMemberID(0) // 新成員 ID 為 0，由資料庫自動生成
	if err != nil {
		return nil, fmt.Errorf("failed to create member ID: %w", err)
	}

	name, err := memberValueObjects.NewName(req.Name)
	if err != nil {
		return nil, fmt.Errorf("invalid name: %w", err)
	}

	email, err := memberValueObjects.NewEmail(req.Email)
	if err != nil {
		return nil, fmt.Errorf("invalid email: %w", err)
	}

	member := &memberEntities.Member{
		ID:        memberID,
		Name:      name,
		Email:     email,
		IsEnable:  req.IsEnable,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// 3. 保存成員
	if err := s.memberRepo.Save(member); err != nil {
		return nil, fmt.Errorf("failed to save member: %w", err)
	}

	// 4. 生成鹽值和密碼哈希
	salt, err := s.generateSalt()
	if err != nil {
		return nil, fmt.Errorf("failed to generate salt: %w", err)
	}

	memberHistory := &memberHistoryEntities.MemberHistory{}
	hash := memberHistory.HashPassword(req.Password, salt)

	// 5. 保存密碼歷史
	memberHistory.MemberID = member.ID
	memberHistory.Salt = salt
	memberHistory.Hash = hash
	memberHistory.ErrorCount = 0
	memberHistory.CreateID = createID
	memberHistory.CreateTime = time.Now()
	memberHistory.ModifyID = createID
	memberHistory.ModifyTime = time.Now()

	if err := s.memberHistoryRepo.Save(memberHistory); err != nil {
		return nil, fmt.Errorf("failed to save member history: %w", err)
	}

	// 6. 分配角色
	for _, roleID := range req.RoleIDs {
		if err := s.roleService.AssignMembers(roleID, []uint{uint(member.ID.Value())}, createID); err != nil {
			return nil, fmt.Errorf("failed to assign role %d: %w", roleID, err)
		}
	}

	// 7. 返回創建的成員
	return s.GetByID(uint(member.ID.Value()))
}

// Update 更新成員
func (s *MemberApplicationService) Update(id uint, req *dto.MemberUpdateRequest, modifyID uint) (*dto.APIResponse, error) {
	// 1. 查找成員
	member, err := s.memberRepo.FindByID(fmt.Sprintf("%d", id))
	if err != nil {
		return nil, fmt.Errorf("member not found: %w", err)
	}

	// 2. 檢查郵箱是否被其他成員使用
	if req.Email != member.Email.String() {
		existingMember, _ := s.memberRepo.FindByEmail(req.Email)
		if existingMember != nil && uint(existingMember.ID.Value()) != id {
			return nil, fmt.Errorf("email already exists")
		}
	}

	// 3. 更新基本信息
	name, err := memberValueObjects.NewName(req.Name)
	if err != nil {
		return nil, fmt.Errorf("invalid name: %w", err)
	}

	email, err := memberValueObjects.NewEmail(req.Email)
	if err != nil {
		return nil, fmt.Errorf("invalid email: %w", err)
	}

	member.Name = name
	member.Email = email
	member.IsEnable = req.IsEnable
	member.UpdatedAt = time.Now()

	if err := s.memberRepo.Update(member); err != nil {
		return nil, fmt.Errorf("failed to update member: %w", err)
	}

	// 4. 如果提供了新密碼，則更新密碼
	if req.Password != nil && *req.Password != "" {
		salt, err := s.generateSalt()
		if err != nil {
			return nil, fmt.Errorf("failed to generate salt: %w", err)
		}

		memberHistory := &memberHistoryEntities.MemberHistory{}
		hash := memberHistory.HashPassword(*req.Password, salt)

		memberHistory.MemberID = member.ID
		memberHistory.Salt = salt
		memberHistory.Hash = hash
		memberHistory.ErrorCount = 0
		memberHistory.CreateID = modifyID
		memberHistory.CreateTime = time.Now()
		memberHistory.ModifyID = modifyID
		memberHistory.ModifyTime = time.Now()

		if err := s.memberHistoryRepo.Save(memberHistory); err != nil {
			return nil, fmt.Errorf("failed to save member history: %w", err)
		}
	}

	// 5. 更新角色分配
	// 獲取當前角色
	currentMemberRoles, err := s.memberRoleRepo.GetByMemberID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get current roles: %w", err)
	}

	currentRoleIDs := make(map[uint]bool)
	for _, mr := range currentMemberRoles {
		currentRoleIDs[mr.RoleID] = true
	}

	newRoleIDs := make(map[uint]bool)
	for _, roleID := range req.RoleIDs {
		newRoleIDs[roleID] = true
	}

	// 找出需要添加的角色
	for _, roleID := range req.RoleIDs {
		if !currentRoleIDs[roleID] {
			if err := s.roleService.AssignMembers(roleID, []uint{id}, modifyID); err != nil {
				return nil, fmt.Errorf("failed to assign role %d: %w", roleID, err)
			}
		}
	}

	// 找出需要移除的角色
	for _, mr := range currentMemberRoles {
		if !newRoleIDs[mr.RoleID] {
			if err := s.roleService.RemoveMembers(mr.RoleID, []uint{id}); err != nil {
				return nil, fmt.Errorf("failed to remove role %d: %w", mr.RoleID, err)
			}
		}
	}

	// 6. 返回更新後的成員
	return s.GetByID(id)
}

// generateSalt 生成隨機鹽值
func (s *MemberApplicationService) generateSalt() (string, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(salt), nil
}
