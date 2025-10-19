package entities

import (
	"time"
)

// Company - 公司實體
type Company struct {
	ID            uint
	Name          string
	Address       string
	ContactPerson string
	ContactPhone  string
	IsActive      bool
	ParentID      *uint
	CreateID      uint
	CreateTime    time.Time
	ModifyID      uint
	ModifyTime    time.Time
}
