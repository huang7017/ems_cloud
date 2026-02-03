package entities

import "time"

// Device 設備實體
type Device struct {
	ID         uint
	SN         string
	CreateID   uint
	CreateTime time.Time
	ModifyID   uint
	ModifyTime time.Time
}

// NewDevice 創建新設備
func NewDevice(sn string, createID uint) *Device {
	now := time.Now()
	return &Device{
		SN:         sn,
		CreateID:   createID,
		CreateTime: now,
		ModifyID:   createID,
		ModifyTime: now,
	}
}

// Update 更新設備
func (d *Device) Update(sn string, modifyID uint) {
	d.SN = sn
	d.ModifyID = modifyID
	d.ModifyTime = time.Now()
}
