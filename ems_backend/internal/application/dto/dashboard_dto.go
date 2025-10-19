package dto

import "time"

// ========== Dashboard Company List ==========

// DashboardCompanyListRequest - 獲取公司列表請求
type DashboardCompanyListRequest struct {
	// 由 middleware 從 token 中取得 member_id，不需要額外參數
}

// DashboardCompanyListResponse - 公司列表回應
type DashboardCompanyListResponse struct {
	Companies []CompanyOption `json:"companies"`
}

type CompanyOption struct {
	CompanyID   uint   `json:"company_id"`
	CompanyName string `json:"company_name"`
	IsActive    bool   `json:"is_active"`
}

// DashboardAreaListRequest - 獲取區域列表請求
type DashboardAreaListRequest struct {
	CompanyID uint `json:"company_id" form:"company_id" binding:"required"` // 必填，指定公司 ID
}

// DashboardAreaListResponse - 區域列表回應
type DashboardAreaListResponse struct {
	CompanyID uint         `json:"company_id"`
	Areas     []AreaOption `json:"areas"`
}

type AreaOption struct {
	AreaID   string `json:"area_id"`
	AreaName string `json:"area_name"`
}

// ========== Dashboard Summary ==========

// DashboardSummaryRequest - Dashboard 總覽請求
type DashboardSummaryRequest struct {
	// 由 middleware 從 token 中取得 member_id，不需要額外參數
}

// DashboardSummaryResponse - Dashboard 總覽回應
type DashboardSummaryResponse struct {
	TotalCompanies int                  `json:"total_companies"`
	TotalDevices   int                  `json:"total_devices"`
	Companies      []CompanySummaryInfo `json:"companies"`
}

type CompanySummaryInfo struct {
	CompanyID     uint       `json:"company_id"`
	CompanyName   string     `json:"company_name"`
	DeviceCount   int        `json:"device_count"`
	TotalKWh      float64    `json:"total_k_wh"`
	TotalKW       float64    `json:"total_kw"`
	LastUpdatedAt *time.Time `json:"last_updated_at,omitempty"`
}

// ========== Dashboard Meter Data ==========

// DashboardMeterRequest - 查詢電表數據請求
type DashboardMeterRequest struct {
	CompanyID uint       `json:"company_id" form:"company_id"` // 可選，如果為 0 則查詢所有關聯公司
	StartTime *time.Time `json:"start_time" form:"start_time"` // 可選，提供則返回歷史數據
	EndTime   *time.Time `json:"end_time" form:"end_time"`     // 可選，提供則返回歷史數據
}

// DashboardMeterResponse - 電表數據回應
type DashboardMeterResponse struct {
	Companies []CompanyMeterInfo `json:"companies"`
}

type CompanyMeterInfo struct {
	CompanyID   uint            `json:"company_id"`
	CompanyName string          `json:"company_name"`
	Areas       []AreaMeterInfo `json:"areas"`
}

type AreaMeterInfo struct {
	AreaID   string      `json:"area_id"`
	AreaName string      `json:"area_name"`
	Meters   []MeterInfo `json:"meters"`
}

type MeterInfo struct {
	MeterID     string         `json:"meter_id"`
	LatestData  *MeterReading  `json:"latest_data,omitempty"`
	HistoryData []MeterReading `json:"history_data,omitempty"`
}

type MeterReading struct {
	Timestamp time.Time `json:"timestamp"`
	KWh       float64   `json:"k_wh"`
	KW        float64   `json:"kw"`
}

// ========== Dashboard Temperature Data ==========

// DashboardTemperatureRequest - 查詢溫度數據請求
type DashboardTemperatureRequest struct {
	CompanyID uint       `json:"company_id" form:"company_id"` // 可選，如果為 0 則查詢所有關聯公司
	StartTime *time.Time `json:"start_time" form:"start_time"` // 可選，提供則返回歷史數據
	EndTime   *time.Time `json:"end_time" form:"end_time"`     // 可選，提供則返回歷史數據
}

// DashboardTemperatureResponse - 溫度數據回應
type DashboardTemperatureResponse struct {
	Companies []CompanyTemperatureInfo `json:"companies"`
}

type CompanyTemperatureInfo struct {
	CompanyID   uint                  `json:"company_id"`
	CompanyName string                `json:"company_name"`
	Areas       []AreaTemperatureInfo `json:"areas"`
}

type AreaTemperatureInfo struct {
	AreaID   string                  `json:"area_id"`
	AreaName string                  `json:"area_name"`
	Sensors  []TemperatureSensorInfo `json:"sensors"`
}

type TemperatureSensorInfo struct {
	SensorID    string               `json:"sensor_id"`
	LatestData  *TemperatureReading  `json:"latest_data,omitempty"`
	HistoryData []TemperatureReading `json:"history_data,omitempty"`
}

type TemperatureReading struct {
	Timestamp   time.Time `json:"timestamp"`
	Temperature float64   `json:"temperature"` // 溫度（攝氏）
	Humidity    float64   `json:"humidity"`    // 濕度（百分比）
	HeatIndex   float64   `json:"heat_index"`  // 體感溫度（攝氏）
}

// ========== Dashboard Area Overview ==========

// DashboardAreaRequest - 查詢區域總覽請求
type DashboardAreaRequest struct {
	CompanyID uint `json:"company_id" form:"company_id" binding:"required"` // 必填，指定公司 ID
}

// DashboardAreaResponse - 區域總覽回應
type DashboardAreaResponse struct {
	CompanyID   uint       `json:"company_id"`
	CompanyName string     `json:"company_name"`
	Areas       []AreaInfo `json:"areas"`
}

type AreaInfo struct {
	AreaID     string                  `json:"area_id"`
	AreaName   string                  `json:"area_name"`
	Statistics AreaStatistics          `json:"statistics"`
	Meters     []MeterInfo             `json:"meters"`
	Sensors    []TemperatureSensorInfo `json:"sensors"`
	ACPackages []ACPackageInfo         `json:"ac_packages"` // 冷氣組包資訊
}

type AreaStatistics struct {
	// 電表統計
	TotalMeters int     `json:"total_meters"`
	TotalKWh    float64 `json:"total_k_wh"`
	TotalKW     float64 `json:"total_kw"`

	// 溫度統計
	TotalSensors   int     `json:"total_sensors"`
	AvgTemperature float64 `json:"avg_temperature"`
	AvgHumidity    float64 `json:"avg_humidity"`
	AvgHeatIndex   float64 `json:"avg_heat_index"`
	MinTemperature float64 `json:"min_temperature"`
	MaxTemperature float64 `json:"max_temperature"`

	// 設備統計
	TotalACPackages int `json:"total_ac_packages"`
	RunningACCount  int `json:"running_ac_count"`

	LastUpdatedAt *time.Time `json:"last_updated_at,omitempty"`
}

type ACPackageInfo struct {
	PackageID   string             `json:"package_id"`
	PackageName string             `json:"package_name"`
	Compressors []CompressorStatus `json:"compressors"`
}

type CompressorStatus struct {
	CompressorID string `json:"compressor_id"`
	Address      int    `json:"address"`
	IsRunning    bool   `json:"is_running"`
	HasError     bool   `json:"has_error"`
}
