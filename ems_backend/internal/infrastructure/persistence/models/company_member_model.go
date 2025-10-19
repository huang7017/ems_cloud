package models

import (
	"time"
)

const (
	TableNameCompanyMember = "company_member"
)

type CompanyMemberModel struct {
	ID         uint      `gorm:"primaryKey"`
	CompanyID  uint      `gorm:"not null;uniqueIndex:idx_company_member"`
	MemberID   uint      `gorm:"not null;uniqueIndex:idx_company_member"`
	CreateID   uint      `gorm:"not null"`
	CreateTime time.Time `gorm:"not null"`
	ModifyID   uint      `gorm:"not null"`
	ModifyTime time.Time `gorm:"not null"`
}

func (CompanyMemberModel) TableName() string {
	return TableNameCompanyMember
}
