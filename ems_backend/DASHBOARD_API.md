# Dashboard API 文檔

## 概述

Dashboard API 提供了電表數據查詢和總覽功能。系統會自動通過 JWT Token 獲取用戶的 `member_id`，並只返回該用戶有權限訪問的公司數據，確保數據安全。

## 認證

所有 Dashboard API 都需要在 HTTP Header 中提供 JWT Token：

```http
Authorization: Bearer <your_jwt_token>
```

## 安全機制

### 權限控制

1. **自動權限驗證**：系統通過 `company_member` 表自動驗證用戶對公司的訪問權限
2. **防止越權訪問**：即使用戶指定不屬於自己的 `company_id`，系統也會拒絕並返回錯誤
3. **Token 驗證**：所有請求都需要有效的 JWT Token

### 訪問流程

```
用戶請求 → Token 驗證 → 獲取 member_id → 查詢授權公司列表 → 過濾數據 → 返回結果
```

## API 端點

### 0. 獲取公司列表（用於下拉選單）🆕

獲取用戶有權限訪問的所有公司列表，用於前端下拉選單。

**端點**: `GET /dashboard/companies`

**請求參數**: 無（從 Token 自動獲取 member_id）

**請求示例**:
```bash
curl -X GET "http://localhost:8080/dashboard/companies" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**成功響應** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "company_id": 1,
        "company_name": "測試公司 A",
        "is_active": true
      },
      {
        "company_id": 2,
        "company_name": "測試公司 B",
        "is_active": true
      }
    ]
  }
}
```

**使用場景**:
- ✅ 頁面初始化時調用
- ✅ 填充公司下拉選單
- ✅ 讓用戶選擇要查看的公司

**前端示例**:
```javascript
// 獲取公司列表
fetch('http://localhost:8080/dashboard/companies', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    // 填充下拉選單
    const companies = data.data.companies;
    // 設置第一個為預設值
    const defaultCompanyId = companies[0]?.company_id;
  }
});
```

---

### 0.5 獲取指定公司的區域列表 🆕

獲取指定公司下的所有區域列表，用於區域下拉選單。

**端點**: `GET /dashboard/company/areas`

**查詢參數**:

| 參數 | 類型 | 必填 | 說明 | 示例 |
|------|------|------|------|------|
| `company_id` | uint | **是** | 公司 ID | `1` |

**請求示例**:
```bash
curl -X GET "http://localhost:8080/dashboard/company/areas?company_id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**成功響應** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "company_id": 1,
    "areas": [
      {
        "area_id": "4f61a222-2ada-46b1-b929-16f1110c1c99",
        "area_name": "賣場"
      },
      {
        "area_id": "5g72b333-3beb-57c2-c040-27g2221d2d00",
        "area_name": "辦公區"
      },
      {
        "area_id": "6h83c444-4cfc-68d3-d151-38h3332e3e11",
        "area_name": "倉庫"
      }
    ]
  }
}
```

**使用場景**:
- ✅ 用戶選擇公司後調用
- ✅ 填充區域下拉選單
- ✅ 讓用戶選擇特定區域查看數據

**前端使用流程**:
```javascript
// 1. 用戶選擇公司
onCompanyChange(companyId) {
  // 2. 獲取該公司的區域列表
  fetch(`http://localhost:8080/dashboard/company/areas?company_id=${companyId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
  .then(res => res.json())
  .then(data => {
    // 3. 填充區域下拉選單
    setAreas(data.data.areas);
  });
}

// 4. 用戶可以選擇特定區域或"全部區域"
```

---

### 1. 獲取 Dashboard 總覽

獲取用戶所有關聯公司的總覽數據。

**端點**: `GET /dashboard/summary`

**請求參數**: 無（從 Token 自動獲取 member_id）

**請求示例**:
```bash
curl -X GET "http://localhost:8080/dashboard/summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**成功響應** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "total_companies": 2,
    "total_devices": 5,
    "companies": [
      {
        "company_id": 1,
        "company_name": "測試公司 A",
        "device_count": 3,
        "total_k_wh": 1500.5,
        "total_kw": 75.2,
        "last_updated_at": "2025-10-19T10:30:00Z"
      },
      {
        "company_id": 2,
        "company_name": "測試公司 B",
        "device_count": 2,
        "total_k_wh": 980.3,
        "total_kw": 45.8,
        "last_updated_at": "2025-10-19T10:25:00Z"
      }
    ]
  }
}
```

**錯誤響應**:
```json
{
  "success": false,
  "error": "no companies found for this member"
}
```

---

### 2. 獲取電表數據

獲取用戶關聯公司的詳細電表數據，支持時間範圍查詢和公司篩選。

**端點**: `GET /dashboard/meters`

**查詢參數**:

| 參數 | 類型 | 必填 | 說明 | 示例 |
|------|------|------|------|------|
| `company_id` | uint | 否 | 指定公司 ID，為 0 或不提供則返回所有關聯公司 | `1` |
| `start_time` | string | 否 | 開始時間，RFC3339 格式 | `2025-10-19T00:00:00Z` |
| `end_time` | string | 否 | 結束時間，RFC3339 格式 | `2025-10-19T23:59:59Z` |

**注意事項**:
- 如果只提供 `start_time` 和 `end_time` 其中之一，歷史數據查詢將不生效
- 如果不提供時間參數，只返回最新數據
- 如果提供 `company_id`，系統會驗證用戶是否有權限訪問該公司

**請求示例 1 - 獲取所有公司的最新數據**:
```bash
curl -X GET "http://localhost:8080/dashboard/meters" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**請求示例 2 - 獲取特定公司的數據**:
```bash
curl -X GET "http://localhost:8080/dashboard/meters?company_id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**請求示例 3 - 獲取歷史數據**:
```bash
curl -X GET "http://localhost:8080/dashboard/meters?company_id=1&start_time=2025-10-19T00:00:00Z&end_time=2025-10-19T23:59:59Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**成功響應** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "company_id": 1,
        "company_name": "測試公司 A",
        "areas": [
          {
            "area_id": "4f61a222-2ada-46b1-b929-16f1110c1c99",
            "area_name": "賣場",
            "meters": [
              {
                "meter_id": "20f4f767-10f0-47c6-8631-8bd68f72b935",
                "latest_data": {
                  "timestamp": "2025-10-19T10:30:00Z",
                  "k_wh": 1500.5,
                  "kw": 75.2
                },
                "history_data": [
                  {
                    "timestamp": "2025-10-19T00:00:00Z",
                    "k_wh": 1450.0,
                    "kw": 70.5
                  },
                  {
                    "timestamp": "2025-10-19T01:00:00Z",
                    "k_wh": 1460.2,
                    "kw": 71.8
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**錯誤響應 - 越權訪問**:
```json
{
  "success": false,
  "error": "access denied: you do not have permission to access this company"
}
```

**錯誤響應 - 無公司權限**:
```json
{
  "success": false,
  "error": "no companies found for this member"
}
```

---

### 3. 獲取溫度、濕度、體感數據

獲取用戶關聯公司的溫度感測器數據，包含溫度、濕度和計算出的體感溫度。

**端點**: `GET /dashboard/temperatures`

**查詢參數**:

| 參數 | 類型 | 必填 | 說明 | 示例 |
|------|------|------|------|------|
| `company_id` | uint | 否 | 指定公司 ID，為 0 或不提供則返回所有關聯公司 | `1` |
| `start_time` | string | 否 | 開始時間，RFC3339 格式 | `2025-10-19T00:00:00Z` |
| `end_time` | string | 否 | 結束時間，RFC3339 格式 | `2025-10-19T23:59:59Z` |

**注意事項**:
- 體感溫度（Heat Index）會根據溫度和濕度自動計算
- 當溫度低於 27°C 時，體感溫度約等於實際溫度
- 使用 Steadman 公式計算熱指數

**請求示例 1 - 獲取所有公司的最新溫度數據**:
```bash
curl -X GET "http://localhost:8080/dashboard/temperatures" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**請求示例 2 - 獲取特定公司的溫度歷史數據**:
```bash
curl -X GET "http://localhost:8080/dashboard/temperatures?company_id=1&start_time=2025-10-19T00:00:00Z&end_time=2025-10-19T23:59:59Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**成功響應** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "company_id": 1,
        "company_name": "測試公司 A",
        "areas": [
          {
            "area_id": "4f61a222-2ada-46b1-b929-16f1110c1c99",
            "area_name": "賣場",
            "sensors": [
              {
                "sensor_id": "2a61306e-4864-4cda-9533-c9a35dfcfc83",
                "latest_data": {
                  "timestamp": "2025-10-19T10:30:00Z",
                  "temperature": 28.5,
                  "humidity": 65.0,
                  "heat_index": 30.2
                },
                "history_data": [
                  {
                    "timestamp": "2025-10-19T00:00:00Z",
                    "temperature": 25.0,
                    "humidity": 60.0,
                    "heat_index": 25.0
                  },
                  {
                    "timestamp": "2025-10-19T01:00:00Z",
                    "temperature": 26.5,
                    "humidity": 62.0,
                    "heat_index": 26.5
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**錯誤響應** - 越權訪問:
```json
{
  "success": false,
  "error": "access denied: you do not have permission to access this company"
}
```

---

### 4. 獲取區域總覽（區域解構視圖）

獲取特定公司的完整區域解構數據，包含每個區域的統計信息、電表、溫度感測器和冷氣設備狀態。

**端點**: `GET /dashboard/areas`

**查詢參數**:

| 參數 | 類型 | 必填 | 說明 | 示例 |
|------|------|------|------|------|
| `company_id` | uint | **是** | 指定公司 ID | `1` |

**特色功能**:
- 📊 **區域級別統計**：每個區域的電量、溫度統計
- 🌡️ **環境監控**：平均溫度、濕度、最高/最低溫度
- ❄️ **設備狀態**：冷氣運行狀態、壓縮機狀態
- 📈 **多維度數據**：同時提供電表和溫度感測器數據

**請求示例**:
```bash
curl -X GET "http://localhost:8080/dashboard/areas?company_id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**成功響應** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "company_id": 1,
    "company_name": "測試公司 A",
    "areas": [
      {
        "area_id": "4f61a222-2ada-46b1-b929-16f1110c1c99",
        "area_name": "賣場",
        "statistics": {
          "total_meters": 1,
          "total_k_wh": 1500.5,
          "total_kw": 75.2,
          "total_sensors": 3,
          "avg_temperature": 27.5,
          "avg_humidity": 63.5,
          "avg_heat_index": 28.2,
          "min_temperature": 25.0,
          "max_temperature": 29.0,
          "total_ac_packages": 3,
          "running_ac_count": 2,
          "last_updated_at": "2025-10-19T10:30:00Z"
        },
        "meters": [
          {
            "meter_id": "20f4f767-10f0-47c6-8631-8bd68f72b935",
            "latest_data": {
              "timestamp": "2025-10-19T10:30:00Z",
              "k_wh": 1500.5,
              "kw": 75.2
            }
          }
        ],
        "sensors": [
          {
            "sensor_id": "2a61306e-4864-4cda-9533-c9a35dfcfc83",
            "latest_data": {
              "timestamp": "2025-10-19T10:30:00Z",
              "temperature": 28.5,
              "humidity": 65.0,
              "heat_index": 30.2
            }
          }
        ],
        "ac_packages": [
          {
            "package_id": "efcd7bc2-b9fe-492b-ab32-4b8db95c193b",
            "package_name": "冷氣1",
            "compressors": [
              {
                "compressor_id": "a89aa651-0ca3-4e7f-9e60-0e1e9174b179",
                "address": 31,
                "is_running": true,
                "has_error": false
              },
              {
                "compressor_id": "491398fa-6e09-44cb-ab65-02e904c45f71",
                "address": 32,
                "is_running": true,
                "has_error": false
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**錯誤響應** - 缺少必填參數:
```json
{
  "success": false,
  "error": "company_id is required"
}
```

---

## 數據模型

### DTO 結構

#### DashboardSummaryRequest
```go
type DashboardSummaryRequest struct {
    // 無參數，member_id 從 token 中獲取
}
```

#### DashboardSummaryResponse
```go
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
```

#### DashboardMeterRequest
```go
type DashboardMeterRequest struct {
    CompanyID uint       `form:"company_id"` // 0 表示查詢所有公司
    StartTime *time.Time `form:"start_time"` // 可選
    EndTime   *time.Time `form:"end_time"`   // 可選
}
```

#### DashboardMeterResponse
```go
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
```

#### DashboardTemperatureRequest
```go
type DashboardTemperatureRequest struct {
    CompanyID uint       `form:"company_id"` // 0 表示查詢所有公司
    StartTime *time.Time `form:"start_time"` // 可選
    EndTime   *time.Time `form:"end_time"`   // 可選
}
```

#### DashboardTemperatureResponse
```go
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
```

#### DashboardAreaRequest
```go
type DashboardAreaRequest struct {
    CompanyID uint `form:"company_id" binding:"required"` // 必填
}
```

#### DashboardAreaResponse
```go
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
    ACPackages []ACPackageInfo         `json:"ac_packages"`
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
    TotalACPackages int        `json:"total_ac_packages"`
    RunningACCount  int        `json:"running_ac_count"`
    LastUpdatedAt   *time.Time `json:"last_updated_at,omitempty"`
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
```

---

## 數據庫表結構

### company (公司表)
```sql
CREATE TABLE public.company(
    id bigserial PRIMARY KEY NOT NULL,
    "name" varchar(256) NOT NULL,
    "address" varchar(512),
    "contact_person" varchar(128),
    "contact_phone" varchar(32),
    "is_active" boolean DEFAULT true,
    "parent_id" bigint REFERENCES public.company(id),
    "create_id" bigint NOT NULL,
    "create_time" timestamp NOT NULL,
    "modify_id" bigint NOT NULL,
    "modify_time" timestamp NOT NULL
);
```

### company_member (公司成員關聯表)
```sql
CREATE TABLE public.company_member(
    id bigserial PRIMARY KEY NOT NULL,
    "company_id" bigint REFERENCES public.company(id) NOT NULL,
    "member_id" bigint REFERENCES public.member(id) NOT NULL,
    "create_id" bigint NOT NULL,
    "create_time" timestamp NOT NULL,
    "modify_id" bigint NOT NULL,
    "modify_time" timestamp NOT NULL,
    UNIQUE("company_id", "member_id")
);
```

**重要**：此表是權限控制的核心，決定哪些用戶可以訪問哪些公司的數據。

### company_device (公司設備表)
```sql
CREATE TABLE public.company_device(
    id bigserial PRIMARY KEY NOT NULL,
    "company_id" bigint REFERENCES public.company(id) NOT NULL,
    "device_id" bigint REFERENCES public.device(id) NOT NULL, 
    "content" jsonb NOT NULL,
    "create_id" bigint NOT NULL,
    "create_time" timestamp NOT NULL,
    "modify_id" bigint NOT NULL,
    "modify_time" timestamp NOT NULL
);
```

**content JSONB 結構**:
```json
{
  "areas": [
    {
      "id": "4f61a222-2ada-46b1-b929-16f1110c1c99",
      "name": "賣場",
      "ac_mappings": [...],
      "meter_mappings": [
        {
          "ID": "8ba9bb43-4436-4c55-a891-2b98701b9f19",
          "AreaID": "4f61a222-2ada-46b1-b929-16f1110c1c99",
          "DeviceMeterID": "20f4f767-10f0-47c6-8631-8bd68f72b935"
        }
      ]
    }
  ],
  "packages": [...]
}
```

### meters (電表數據表)
```sql
CREATE TABLE public.meters(
    id bigserial PRIMARY KEY NOT NULL,
    "timestamp" timestamp NOT NULL,
    "meter_id" text NOT NULL,
    "k_wh" double precision,
    "kw" double precision
);

-- 建議建立索引以提升查詢效能
CREATE INDEX idx_meters_meter_id ON public.meters(meter_id);
CREATE INDEX idx_meters_timestamp ON public.meters(timestamp);
CREATE INDEX idx_meters_meter_id_timestamp ON public.meters(meter_id, timestamp);
```

### temperatures (溫度數據表)
```sql
CREATE TABLE public.temperatures(
    id bigserial PRIMARY KEY NOT NULL,
    "timestamp" timestamp NOT NULL,
    "temperature_id" text NOT NULL,
    "temperature" double precision,
    "humidity" double precision
);

-- 建議建立索引以提升查詢效能
CREATE INDEX idx_temperatures_temperature_id ON public.temperatures(temperature_id);
CREATE INDEX idx_temperatures_timestamp ON public.temperatures(timestamp);
CREATE INDEX idx_temperatures_temperature_id_timestamp ON public.temperatures(temperature_id, timestamp);
```

---

## 完整使用流程

### 1. 登入獲取 Token
```bash
curl -X POST "http://localhost:8080/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "account": "company_manager@surewell.com",
    "password": "your_password"
  }'
```

**響應**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "...",
    "member": {
      "id": "2",
      "name": "surewell.com"
    },
    "member_roles": [...],
    "expires_in": 3600,
    "token_type": "Bearer"
  }
}
```

### 2. 查看 Dashboard 總覽
```bash
curl -X GET "http://localhost:8080/dashboard/summary" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. 查詢特定公司的電表數據
```bash
curl -X GET "http://localhost:8080/dashboard/meters?company_id=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. 查詢電表歷史數據（今天 00:00 到現在）
```bash
START_TIME=$(date -u +"%Y-%m-%dT00:00:00Z")
END_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

curl -X GET "http://localhost:8080/dashboard/meters?company_id=1&start_time=${START_TIME}&end_time=${END_TIME}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. 查詢溫度數據
```bash
# 獲取最新溫度數據
curl -X GET "http://localhost:8080/dashboard/temperatures" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 獲取特定時間範圍的溫度歷史數據
START_TIME=$(date -u +"%Y-%m-%dT00:00:00Z")
END_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

curl -X GET "http://localhost:8080/dashboard/temperatures?company_id=1&start_time=${START_TIME}&end_time=${END_TIME}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. 查詢區域解構數據
```bash
# 獲取特定公司的所有區域詳細資料
curl -X GET "http://localhost:8080/dashboard/areas?company_id=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 錯誤處理

所有 API 錯誤都返回統一格式：

```json
{
  "success": false,
  "error": "錯誤訊息描述"
}
```

### 常見錯誤

| HTTP 狀態碼 | 錯誤訊息 | 原因 | 解決方法 |
|------------|---------|------|---------|
| 401 | `unauthorized: member_id not found` | Token 無效或過期 | 重新登入獲取新 Token |
| 401 | `unauthorized` | 未提供 Token | 在 Header 中添加 Authorization |
| 403 | `access denied: you do not have permission to access this company` | 嘗試訪問無權限的公司 | 檢查 company_id 是否正確 |
| 404 | `no companies found for this member` | 用戶沒有關聯任何公司 | 在 company_member 表中添加關聯 |
| 500 | `internal server error` | 服務器內部錯誤 | 查看服務器日誌 |

---

## 測試數據設置

### 1. 創建測試角色
```sql
INSERT INTO "role" (title, description, sort, is_enable, create_id, create_time, modify_id, modify_time)
VALUES('company_manager', '公司管理員', 0, true, 1, NOW(), 1, NOW());
```

### 2. 創建測試用戶
```sql
INSERT INTO "member" ("name", "email", "is_enable", "create_id", "create_time", "modify_id", "modify_time")
VALUES('測試公司管理員', 'company_manager@surewell.com', true, 1, NOW(), 1, NOW());
```

### 3. 設置用戶密碼（假設 member_id = 2）
```sql
INSERT INTO member_history ("member_id", "hash", "salt", "error_count", "create_id", "create_time", "modify_id", "modify_time")
VALUES(2, '3792befe07dac37ccdb205c289c28f77', 'HWQiZ4lxTYGWujgW', 0, 1, NOW(), 1, NOW());
```

### 4. 創建測試公司
```sql
INSERT INTO company ("name", "address", "contact_person", "contact_phone", "is_active", "create_id", "create_time", "modify_id", "modify_time")
VALUES('測試公司 A', '台北市信義區', '張三', '02-1234-5678', true, 1, NOW(), 1, NOW());
```

### 5. 關聯用戶與公司（假設 company_id = 1, member_id = 2）
```sql
INSERT INTO company_member ("company_id", "member_id", "create_id", "create_time", "modify_id", "modify_time")
VALUES(1, 2, 1, NOW(), 1, NOW());
```

### 6. 添加設備和電表數據
```sql
-- 添加設備（假設已有 device 表和 device_id = 1）
INSERT INTO company_device ("company_id", "device_id", "content", "create_id", "create_time", "modify_id", "modify_time")
VALUES(1, 1, '{
  "areas": [{
    "id": "4f61a222-2ada-46b1-b929-16f1110c1c99",
    "name": "賣場",
    "ac_mappings": [],
    "meter_mappings": [{
      "ID": "8ba9bb43-4436-4c55-a891-2b98701b9f19",
      "AreaID": "4f61a222-2ada-46b1-b929-16f1110c1c99",
      "DeviceMeterID": "20f4f767-10f0-47c6-8631-8bd68f72b935"
    }]
  }],
  "packages": []
}'::jsonb, 1, NOW(), 1, NOW());

-- 添加電表數據
INSERT INTO meters ("timestamp", "meter_id", "k_wh", "kw")
VALUES
  (NOW(), '20f4f767-10f0-47c6-8631-8bd68f72b935', 1500.5, 75.2),
  (NOW() - INTERVAL '1 hour', '20f4f767-10f0-47c6-8631-8bd68f72b935', 1450.0, 70.5);

-- 添加溫度數據
INSERT INTO temperatures ("timestamp", "temperature_id", "temperature", "humidity")
VALUES
  (NOW(), '2a61306e-4864-4cda-9533-c9a35dfcfc83', 28.5, 65.0),
  (NOW() - INTERVAL '1 hour', '2a61306e-4864-4cda-9533-c9a35dfcfc83', 27.0, 63.0),
  (NOW() - INTERVAL '2 hours', '2a61306e-4864-4cda-9533-c9a35dfcfc83', 26.5, 62.0);
```

---

## 性能優化建議

### 1. 數據庫索引
```sql
-- meters 表索引
CREATE INDEX idx_meters_meter_id ON meters(meter_id);
CREATE INDEX idx_meters_timestamp ON meters(timestamp);
CREATE INDEX idx_meters_meter_id_timestamp ON meters(meter_id, timestamp);

-- temperatures 表索引
CREATE INDEX idx_temperatures_temperature_id ON temperatures(temperature_id);
CREATE INDEX idx_temperatures_timestamp ON temperatures(timestamp);
CREATE INDEX idx_temperatures_temperature_id_timestamp ON temperatures(temperature_id, timestamp);

-- company_member 表索引
CREATE INDEX idx_company_member_member_id ON company_member(member_id);
CREATE INDEX idx_company_member_company_id ON company_member(company_id);

-- company_device 表索引
CREATE INDEX idx_company_device_company_id ON company_device(company_id);
```

### 2. 查詢優化
- 使用時間範圍查詢時，盡量限制在較短的時間內（如 1 天或 1 週）
- 如果數據量很大，考慮實現分頁功能
- 對於實時數據展示，使用 `latest_data` 而不是 `history_data`

### 3. 緩存策略
- 可以考慮對 `dashboard/summary` 添加短期緩存（如 5 分鐘）
- 使用 Redis 緩存公司設備配置（`company_device.content`）
- 溫度數據可以緩存 1-2 分鐘，因為溫度變化相對緩慢

### 4. 體感溫度計算說明

系統使用 **Steadman 公式**計算體感溫度（Heat Index）：

**計算邏輯**:
1. 當溫度 < 27°C 時，體感溫度 ≈ 實際溫度
2. 當溫度 ≥ 27°C 時，使用完整的熱指數公式計算

**公式** (T = 華氏溫度, RH = 相對濕度):
```
HI = -42.379 + 2.04901523×T + 10.14333127×RH 
     - 0.22475541×T×RH - 0.00683783×T² 
     - 0.05481717×RH² + 0.00122874×T²×RH 
     + 0.00085282×T×RH² - 0.00000199×T²×RH²
```

**使用場景**:
- 幫助用戶了解真實的舒適度
- 輔助空調系統調節決策
- 提供更準確的環境舒適度評估

---

## 架構說明

### DDD 分層架構

```
┌─────────────────────────────────────────┐
│         Interface Layer (API)           │
│  - dashboard_handler.go                 │
│    · GetDashboardSummary                │
│    · GetMeterData                       │
│    · GetTemperatureData                 │
│    · GetAreaOverview (NEW)              │
│  - auth_router.go                       │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Application Layer (Service)        │
│  - dashboard_application_service.go     │
│  - dashboard_temperature_service.go     │
│  - dashboard_area_service.go (NEW)      │
│  - dashboard_dto.go                     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Domain Layer                    │
│  - company (entities, repositories)     │
│  - company_device                       │
│  - meter                                │
│  - temperature                          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│    Infrastructure Layer (Persistence)   │
│  - company_repository.go                │
│  - company_device_repository.go         │
│  - meter_repository.go                  │
│  - temperature_repository.go            │
│  - models (GORM)                        │
└─────────────────────────────────────────┘
```

### 數據流向

```
1. 用戶請求 → Handler 驗證 Token → 提取 member_id
2. Handler → Application Service (傳遞 member_id + Request DTO)
3. Application Service → Domain Repository (查詢授權公司)
4. 權限驗證 → 過濾公司列表
5. 查詢設備和電表數據
6. 組裝 Response DTO → 返回給用戶
```

---

## API 端點總覽

| 端點 | 方法 | 說明 | 需要認證 | 參數 | 優先級 |
|------|------|------|----------|------|--------|
| `/dashboard/companies` | GET | **獲取公司列表（下拉選單）** 🆕 | ✓ | - | ⭐⭐⭐ **第一步** |
| `/dashboard/company/areas` | GET | **獲取區域列表（下拉選單）** 🆕 | ✓ | `company_id` **(必填)** | ⭐⭐⭐ **第二步** |
| `/dashboard/summary` | GET | 獲取 Dashboard 總覽（公司、設備統計） | ✓ | - | ⭐⭐ |
| `/dashboard/meters` | GET | 獲取電表數據（最新/歷史） | ✓ | `company_id`, `start_time`, `end_time` | ⭐ |
| `/dashboard/temperatures` | GET | 獲取溫度、濕度、體感數據 | ✓ | `company_id`, `start_time`, `end_time` | ⭐ |
| `/dashboard/areas` | GET | **獲取區域解構視圖（完整統計）** | ✓ | `company_id` **(必填)** | ⭐⭐⭐ **推薦** |

## 數據關聯圖

```
Member (用戶)
    ↓ (company_member)
Company (公司)
    ↓ (company_device)
CompanyDevice (設備配置 JSONB)
    ├─→ Areas → MeterMappings → DeviceMeterID
    │                              ↓
    │                          Meters (電表數據表)
    │
    └─→ Packages → Temperatures → SensorID
                                     ↓
                                 Temperatures (溫度數據表)
```

## 版本資訊

- **API 版本**: v1.1
- **最後更新**: 2025-10-19
- **相容性**: Go 1.21+, PostgreSQL 12+
- **新功能**: 
  - 溫度、濕度、體感溫度查詢 API
  - **區域解構視圖 API**（提供完整的區域級別統計和設備狀態）

---

## 支援與反饋

如有問題或建議，請聯繫開發團隊。
