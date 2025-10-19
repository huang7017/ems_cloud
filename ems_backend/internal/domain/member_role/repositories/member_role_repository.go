package repositories

import (
	"ems_backend/internal/domain/member_role/entities"
)

type MemberRoleRepository interface {
	GetByMemberID(memberID uint) ([]*entities.MemberRole, error)
}
