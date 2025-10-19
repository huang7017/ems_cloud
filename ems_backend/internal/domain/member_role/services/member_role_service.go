package services

import (
	"ems_backend/internal/domain/member_role/entities"
	"ems_backend/internal/domain/member_role/repositories"
)

type MemberRoleService struct {
	memberRoleRepo repositories.MemberRoleRepository
}

func NewMemberRoleService(memberRoleRepo repositories.MemberRoleRepository) *MemberRoleService {
	return &MemberRoleService{memberRoleRepo: memberRoleRepo}
}

func (s *MemberRoleService) GetByMemberID(memberID uint) ([]*entities.MemberRole, error) {
	return s.memberRoleRepo.GetByMemberID(memberID)
}
