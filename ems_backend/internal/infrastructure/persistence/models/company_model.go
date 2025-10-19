package models

import (
	"time"
)

const (
	TableNameCompany = "company"
)

type CompanyModel struct {
	ID            uint      `gorm:"primaryKey"`
	Name          string    `gorm:"size:256;not null"`
	Address       string    `gorm:"size:512"`
	ContactPerson string    `gorm:"size:128"`
	ContactPhone  string    `gorm:"size:32"`
	IsActive      bool      `gorm:"default:true"`
	ParentID      *uint     `gorm:"index"`
	CreateID      uint      `gorm:"not null"`
	CreateTime    time.Time `gorm:"not null"`
	ModifyID      uint      `gorm:"not null"`
	ModifyTime    time.Time `gorm:"not null"`
}

func (CompanyModel) TableName() string {
	return TableNameCompany
}
