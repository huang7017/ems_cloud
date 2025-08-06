package entities

import (
	"ems_backend/internal/domain/member/value_objects"
	"encoding/base64"
	"time"

	"golang.org/x/crypto/argon2"
)

// MemberHistory - 會員歷史實體
type MemberHistory struct {
	ID         uint
	MemberID   value_objects.MemberID
	Salt       string
	Hash       string
	ErrorCount int
	CreateID   uint
	CreateTime time.Time
	ModifyID   uint
	ModifyTime time.Time
}

func (m *MemberHistory) ValidatePassword(input, salt, hash string) bool {
	return m.HashPassword(input, salt) == hash
}

func (m *MemberHistory) HashPassword(password, salt string) string {
	saltBytes, _ := base64.StdEncoding.DecodeString(salt)
	hash := argon2.IDKey([]byte(password), saltBytes, 1, 64*1024, 4, 32)
	return base64.StdEncoding.EncodeToString(hash)
}
