package value_objects

import (
	"errors"
	"regexp"
	"strings"
)

type Name struct {
	value string
}

func NewName(value string) (Name, error) {
	if strings.TrimSpace(value) == "" {
		return Name{}, errors.New("name cannot be empty")
	}

	// 用戶名規則：3-20個字符，只能包含字母、數字、下劃線
	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_]{3,20}$`)
	if !usernameRegex.MatchString(value) {
		return Name{}, errors.New("invalid name format")
	}

	return Name{value: value}, nil
}

func (n Name) String() string {
	return n.value
}
