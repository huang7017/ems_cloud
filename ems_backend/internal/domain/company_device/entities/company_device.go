package entities

import (
	"encoding/json"
	"time"
)

// CompanyDevice - 公司設備實體
type CompanyDevice struct {
	ID         uint
	CompanyID  uint
	DeviceID   uint
	Content    json.RawMessage // JSONB content
	CreateID   uint
	CreateTime time.Time
	ModifyID   uint
	ModifyTime time.Time
}

// DeviceContent - 設備內容結構
type DeviceContent struct {
	Areas    []Area    `json:"areas"`
	Packages []Package `json:"packages"`
}

type Area struct {
	ID            string         `json:"id"`
	Name          string         `json:"name"`
	ACMappings    []ACMapping    `json:"ac_mappings"`
	MeterMappings []MeterMapping `json:"meter_mappings"`
}

type ACMapping struct {
	ID     string `json:"id"`
	Type   string `json:"type"`
	ACID   string `json:"ac_id"`
	AreaID string `json:"area_id"`
}

type MeterMapping struct {
	ID            string `json:"ID"`
	AreaID        string `json:"AreaID"`
	DeviceMeterID string `json:"DeviceMeterID"`
}

type Package struct {
	ID           string        `json:"id"`
	Name         string        `json:"name"`
	Compressors  []Compressor  `json:"compressors"`
	Temperatures []Temperature `json:"temperatures"`
}

type Compressor struct {
	ID              string `json:"id"`
	Address         int    `json:"address"`
	RunStatus       bool   `json:"run_status"`
	ErrorStatus     bool   `json:"error_status"`
	LastSwitchAt    string `json:"last_switch_at"`
	StartsInHour    int    `json:"starts_in_hour"`
	RuntimeSeconds  int    `json:"runtime_seconds"`
	HourWindowStart string `json:"hour_window_start"`
}

type Temperature struct {
	ID       string `json:"id"`
	Address  int    `json:"address"`
	SensorID string `json:"sensor_id"`
}

// ParseContent - 解析 JSONB 內容
func (cd *CompanyDevice) ParseContent() (*DeviceContent, error) {
	var content DeviceContent
	if err := json.Unmarshal(cd.Content, &content); err != nil {
		return nil, err
	}
	return &content, nil
}
