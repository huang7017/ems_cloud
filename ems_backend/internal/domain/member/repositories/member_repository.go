package repositories

import "ems_backend/internal/domain/member/entities"

type MemberRepository interface {
	FindByID(id string) (*entities.Member, error)
	FindByEmail(email string) (*entities.Member, error)
	FindAll() ([]*entities.Member, error)
	Save(member *entities.Member) error
	Update(member *entities.Member) error
	Delete(id string) error
}
