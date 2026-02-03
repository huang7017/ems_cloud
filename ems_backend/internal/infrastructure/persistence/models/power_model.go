package models

import "time"

type PowerModel struct {
	ID          uint      `gorm:"primaryKey"`
	MenuID      uint      `gorm:"not null"`
	Title       string    `gorm:"not null"`
	Code        string    `gorm:"not null;unique"` // 權限代碼，唯一
	Description string    `gorm:"null"`
	Sort        int       `gorm:"null"`
	IsEnable    bool      `gorm:"not null"`
	CreateID    uint      `gorm:"not null"`
	CreateTime  time.Time `gorm:"not null"`
	ModifyID    uint      `gorm:"not null"`
	ModifyTime  time.Time `gorm:"not null"`
}

func (PowerModel) TableName() string {
	return "power"
}
