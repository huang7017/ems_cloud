package models

import (
	"time"
)

const (
	TableNameAccessToken = "access_token"
)

type AccessTokenModel struct {
	ID           uint
	MemberID     uint
	AccessToken  string
	RefreshToken string
	CreateID     uint
	CreateTime   time.Time
	ModifyID     uint
	ModifyTime   time.Time
}

// TableName 返回表名
func (AccessTokenModel) TableName() string {
	return TableNameAccessToken
}
