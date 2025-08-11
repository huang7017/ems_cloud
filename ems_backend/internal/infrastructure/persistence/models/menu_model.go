package models

import "time"

type MenuModel struct {
	ID          uint      `gorm:"primaryKey"`
	Title       string    `gorm:"not null"`
	Icon        string    `gorm:"not null"`
	Url         string    `gorm:"not null"`
	Parent      uint      `gorm:" null"`
	Description string    `gorm:" null"`
	Sort        int       `gorm:" null"`
	IsEnable    bool      `gorm:"not null"`
	IsShow      bool      `gorm:"not null"`
	CreateID    uint      `gorm:"not null"`
	CreateTime  time.Time `gorm:"not null"`
	ModifyID    uint      `gorm:"not null"`
	ModifyTime  time.Time `gorm:"not null"`
}

func (MenuModel) TableName() string {
	return "menu"
}
