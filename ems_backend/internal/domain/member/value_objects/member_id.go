package value_objects

import (
	"errors"
	"strconv"
)

type MemberID struct {
	value uint
}

func NewMemberID(value uint) (MemberID, error) {
	if value == 0 {
		return MemberID{}, errors.New("member id cannot be empty")
	}
	return MemberID{value: value}, nil
}

func (id MemberID) String() string {
	return strconv.Itoa(int(id.value))
}

func (id MemberID) Value() uint {
	return id.value
}
