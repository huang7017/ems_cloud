package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

const (
	TableNameCompanyDevice = "company_device"
)

type CompanyDeviceModel struct {
	ID         uint      `gorm:"primaryKey"`
	CompanyID  uint      `gorm:"not null;index"`
	DeviceID   uint      `gorm:"not null"`
	Content    JSONB     `gorm:"type:jsonb;not null"`
	CreateID   uint      `gorm:"not null"`
	CreateTime time.Time `gorm:"not null"`
	ModifyID   uint      `gorm:"not null"`
	ModifyTime time.Time `gorm:"not null"`
}

func (CompanyDeviceModel) TableName() string {
	return TableNameCompanyDevice
}

// JSONB - 自定義 JSONB 類型
type JSONB json.RawMessage

// Value - 實現 driver.Valuer 接口
func (j JSONB) Value() (driver.Value, error) {
	if len(j) == 0 {
		return nil, nil
	}
	return json.RawMessage(j).MarshalJSON()
}

// Scan - 實現 sql.Scanner 接口
func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	// 直接賦值，不需要 Unmarshal（因為 JSONB 本身就是 []byte）
	*j = JSONB(bytes)
	return nil
}
