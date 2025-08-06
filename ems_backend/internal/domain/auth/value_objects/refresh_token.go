package value_objects

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

type RefreshToken struct {
	value     string
	memberID  uint
	expiresAt time.Time
}

func NewRefreshToken(memberID uint) *RefreshToken {
	return &RefreshToken{
		value:     generateToken(),
		memberID:  memberID,
		expiresAt: time.Now().Add(7 * 24 * time.Hour), // 7天
	}
}

func (t *RefreshToken) String() string {
	return t.value
}

func (t *RefreshToken) GetMemberID() uint {
	return t.memberID
}

func (t *RefreshToken) IsExpired() bool {
	return time.Now().After(t.expiresAt)
}

func generateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}
