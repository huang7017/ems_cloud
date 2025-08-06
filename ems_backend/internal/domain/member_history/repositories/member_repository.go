package repositories

import "ems_backend/internal/domain/member_history/entities"

type MemberHistoryRepository interface {
	Save(member *entities.MemberHistory) error
	Update(member *entities.MemberHistory) error
	LastMemberHistory(memberID uint) (*entities.MemberHistory, error)
}
