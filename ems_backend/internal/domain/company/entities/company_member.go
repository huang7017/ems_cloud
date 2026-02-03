package entities

import (
	"time"
)

// CompanyMember - 公司成員關聯實體
type CompanyMember struct {
	ID         uint
	CompanyID  uint
	MemberID   uint
	CreateID   uint
	CreateTime time.Time
	ModifyID   uint
	ModifyTime time.Time
}

// CompanyMemberWithDetails - 帶詳細信息的公司成員
type CompanyMemberWithDetails struct {
	ID         uint
	CompanyID  uint
	MemberID   uint
	MemberName string
	Email      string
	RoleTitle  string
}
