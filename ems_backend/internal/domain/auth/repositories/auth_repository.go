package repositories

import "ems_backend/internal/domain/auth/entities"

type AuthRepository interface {
	SaveSession(session *entities.AuthSession) error
	FindSessionByRefreshToken(refreshToken string) (*entities.AuthSession, error)
	FindSessionByMemberID(memberID uint) (*entities.AuthSession, error)
	InvalidateSession(sessionID uint) error
	InvalidateAllSessionsByMemberID(memberID uint) error
}
