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

// DeviceContent - 設備內容結構 (matches ems_vrv)
type DeviceContent struct {
	Areas      []Area     `json:"areas"`
	Packages   []Package  `json:"packages"`      // Package AC systems
	VRFs       []VRF      `json:"vrfs"`          // VRF systems
	Schedule   *Schedule  `json:"schedule,omitempty"` // Device schedule
	Version    int64      `json:"version,omitempty"`
	LastSyncAt string     `json:"last_sync_at,omitempty"`
}

// ============================================
// Area structures (matches ems_vrv/area)
// ============================================

type Area struct {
	ID            string         `json:"id"`
	Name          string         `json:"name"`
	ACMappings    []ACMapping    `json:"ac_mappings"`
	MeterMappings []MeterMapping `json:"meter_mappings"`
}

type ACMapping struct {
	ID     string `json:"id"`
	Type   any    `json:"type"` // Can be int (0=VRF, 1=Package) or string ("vrf", "package")
	ACID   string `json:"ac_id"`
	AreaID string `json:"area_id"`
}

// IsVRF checks if this mapping is for a VRF unit
func (m *ACMapping) IsVRF() bool {
	switch t := m.Type.(type) {
	case float64:
		return t == 0
	case int:
		return t == 0
	case string:
		return t == "vrf"
	}
	return false
}

// IsPackage checks if this mapping is for a Package AC
func (m *ACMapping) IsPackage() bool {
	switch t := m.Type.(type) {
	case float64:
		return t == 1
	case int:
		return t == 1
	case string:
		return t == "package"
	}
	return false
}

type MeterMapping struct {
	ID            string `json:"ID"`
	AreaID        string `json:"AreaID"`
	DeviceMeterID string `json:"DeviceMeterID"`
}

// ============================================
// Package AC structures (matches ems_vrv/package_ac)
// ============================================

type Package struct {
	ID                  string               `json:"id"`
	Name                string               `json:"name,omitempty"`
	AreaName            string               `json:"area_name,omitempty"`
	TemperatureSensorID string               `json:"temperature_sensor_id,omitempty"`
	Compressors         []Compressor         `json:"compressors"`
	Temperatures        []TemperatureMapping `json:"temperatures,omitempty"` // Alias for backward compatibility
}

type Compressor struct {
	ID              string  `json:"id"`
	PackageAcID     string  `json:"package_ac_id,omitempty"`
	Address         int     `json:"address"` // Modbus device address
	RunStatus       bool    `json:"run_status"`
	ErrorStatus     bool    `json:"error_status"`
	RuntimeSeconds  int64   `json:"runtime_seconds"`
	LastSwitchAt    *string `json:"last_switch_at,omitempty"`
	StartsInHour    int     `json:"starts_in_hour"`
	HourWindowStart *string `json:"hour_window_start,omitempty"`
}

type TemperatureMapping struct {
	ID                  string `json:"id"`
	PackageAcID         string `json:"package_ac_id,omitempty"`
	TemperatureSensorID string `json:"temperature_sensor_id"`
	SensorID            string `json:"sensor_id"` // Alias for backward compatibility
	Address             int    `json:"address"`
}

// ============================================
// VRF structures (matches ems_vrv/vrf)
// ============================================

type VRF struct {
	ID                  string                 `json:"id"`
	Address             string                 `json:"address"` // Modbus device address
	ACUnits             []ACUnit               `json:"ac_units,omitempty"`
	ACs                 []ACUnit               `json:"acs,omitempty"` // Alternative field name used by some devices
	TemperatureMappings []ACTemperatureMapping `json:"temperature_mappings,omitempty"`
	MeterMappings       []VRFMeterMapping      `json:"meter_mappings,omitempty"`
}

// GetUnits returns AC units from either ACUnits or ACs field
func (v *VRF) GetUnits() []ACUnit {
	if len(v.ACs) > 0 {
		return v.ACs
	}
	return v.ACUnits
}

type ACUnit struct {
	ID                       string    `json:"id"`
	VRFID                    string    `json:"vrf_id,omitempty"`
	Name                     *string   `json:"name,omitempty"`
	Location                 *string   `json:"location,omitempty"`
	Number                   *int      `json:"number,omitempty"`
	Status                   any       `json:"status"` // Can be int (0/1) or object {power_on: bool, ...}
	TemperatureSensorID      string    `json:"temperature_sensor_id,omitempty"`
	TemperatureSensorAddress int       `json:"temperature_sensor_address,omitempty"`
}

// IsRunning checks if the AC unit is running (handles both status formats)
func (u *ACUnit) IsRunning() bool {
	switch s := u.Status.(type) {
	case float64:
		return s == 1
	case int:
		return s == 1
	case map[string]interface{}:
		if powerOn, ok := s["power_on"].(bool); ok {
			return powerOn
		}
	}
	return false
}

type ACTemperatureMapping struct {
	ID                  string `json:"id"`
	ACUnitID            string `json:"ac_unit_id"`
	TemperatureSensorID string `json:"temperature_sensor_id"`
}

type VRFMeterMapping struct {
	ID      string `json:"id"`
	VRFID   string `json:"vrf_id"`
	MeterID string `json:"meter_id"`
}

// ============================================
// Schedule structures (matches ems_vrv/schedule)
// ============================================

type Schedule struct {
	ID         string                `json:"id"`
	Command    string                `json:"command"` // typically "schedule"
	DailyRules map[string]*DailyRule `json:"daily_rules"` // Keyed by day name (Monday-Sunday)
	Exceptions []string              `json:"exceptions,omitempty"` // YYYY-MM-DD format dates to skip
}

type DailyRule struct {
	ID        string      `json:"id,omitempty"`
	DayOfWeek string      `json:"day_of_week"` // Monday, Tuesday, etc.
	RunPeriod *TimePeriod `json:"run_period,omitempty"` // Efficiency mode period
	Actions   []Action    `json:"actions,omitempty"`
}

type TimePeriod struct {
	ID    string `json:"id,omitempty"`
	Start string `json:"start"` // HH:MM format
	End   string `json:"end"`   // HH:MM format
}

type Action struct {
	ID   string `json:"id,omitempty"`
	Type string `json:"type"` // closeOnce, skip, forceCloseAfter
	Time string `json:"time,omitempty"` // HH:MM format (optional for "skip")
}

// ============================================
// Temperature Sensor structures
// ============================================

type TemperatureSensor struct {
	ID      string `json:"id"`
	Address int    `json:"address"`
}

type TemperatureReading struct {
	ID          string  `json:"id"`
	SensorID    string  `json:"sensor_id"`
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	HeatIndex   float64 `json:"heat_index"`
	ReadAt      string  `json:"read_at"`
}

// ============================================
// Device Meter structures
// ============================================

type DeviceMeter struct {
	ID        string `json:"id"`
	Address   int    `json:"address"`
	AreaName  string `json:"area_name"`
	Type      int    `json:"type"` // 0=BtcMeterType, 1=P60MeterType
	Loops     string `json:"loops"` // "true,true,false,false" format
	VirtualKW bool   `json:"virtual_kw"`
}

// ============================================
// Helper functions
// ============================================

// ParseContent - 解析 JSONB 內容
func (cd *CompanyDevice) ParseContent() (*DeviceContent, error) {
	var content DeviceContent
	if err := json.Unmarshal(cd.Content, &content); err != nil {
		return nil, err
	}
	return &content, nil
}

// ACType constants (matches ems_vrv)
const (
	ACTypeVRF     = 0
	ACTypePackage = 1
)

// MeterType constants (matches ems_vrv)
const (
	MeterTypeBTC = 0
	MeterTypeP60 = 1
)

// ActionType constants (matches ems_vrv)
const (
	ActionTypeCloseOnce       = "closeOnce"
	ActionTypeSkip            = "skip"
	ActionTypeForceCloseAfter = "forceCloseAfter"
)

// DayOfWeek valid values
var ValidDaysOfWeek = []string{
	"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
}
