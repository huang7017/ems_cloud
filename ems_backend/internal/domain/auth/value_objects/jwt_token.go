package value_objects

import (
	"errors"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTToken struct {
	value string
}

func NewJWTToken(value string) (JWTToken, error) {
	if strings.TrimSpace(value) == "" {
		return JWTToken{}, errors.New("jwt token cannot be empty")
	}
	return JWTToken{value: value}, nil
}

func (t JWTToken) String() string {
	return t.value
}

// JWTClaims - JWT 聲明
type JWTClaims struct {
	MemberID string `json:"member_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func NewJWTClaims(memberID, username string, expirationTime time.Time) *JWTClaims {
	return &JWTClaims{
		MemberID: memberID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}
}
