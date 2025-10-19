# Dashboard API 快速開始指南

## 🚀 API 使用順序

根據前端開發需求，推薦以下 API 調用順序：

### 步驟 1: 用戶登入 ✅

**目的**: 獲取 JWT Token

```bash
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "account": "company_manager@surewell.com",
  "password": "your_password"
}
```

**成功響應**:
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
    "expires_in": 3600,
    "token_type": "Bearer"
  }
}
```

**重要**: 保存 `access_token`，後續所有 API 都需要在 Header 中帶上：
```
Authorization: Bearer {access_token}
```

---

### 步驟 2: 獲取公司列表 🏢 【新增】

**目的**: 獲取用戶有權限的公司列表，用於下拉選單

```bash
GET http://localhost:8080/dashboard/companies
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**成功響應**:
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

**前端使用**:
```jsx
// React 示例
const [companies, setCompanies] = useState([]);
const [selectedCompanyId, setSelectedCompanyId] = useState(null);

// 組件加載時獲取公司列表
useEffect(() => {
  fetch('http://localhost:8080/dashboard/companies', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      setCompanies(data.data.companies);
      // 預設選擇第一個公司
      if (data.data.companies.length > 0) {
        setSelectedCompanyId(data.data.companies[0].company_id);
      }
    }
  });
}, []);

// 下拉選單
<select value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)}>
  {companies.map(company => (
    <option key={company.company_id} value={company.company_id}>
      {company.company_name}
    </option>
  ))}
</select>
```

---

### 步驟 3: 獲取區域列表 📍 【新增】

**目的**: 根據選擇的公司，獲取該公司下的所有區域列表

```bash
GET http://localhost:8080/dashboard/company/areas?company_id=1
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**成功響應**:
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

**前端使用**:
```jsx
// React 示例
const [areas, setAreas] = useState([]);
const [selectedAreaId, setSelectedAreaId] = useState(null);

// 當公司改變時，獲取該公司的區域列表
useEffect(() => {
  if (selectedCompanyId) {
    fetch(`http://localhost:8080/dashboard/company/areas?company_id=${selectedCompanyId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setAreas(data.data.areas);
        // 預設選擇第一個區域或全部區域
        if (data.data.areas.length > 0) {
          setSelectedAreaId(data.data.areas[0].area_id);
        }
      }
    });
  }
}, [selectedCompanyId]);

// 區域下拉選單
<select value={selectedAreaId || ''} onChange={(e) => setSelectedAreaId(e.target.value)}>
  <option value="">全部區域</option>
  {areas.map(area => (
    <option key={area.area_id} value={area.area_id}>
      {area.area_name}
    </option>
  ))}
</select>
```

---

### 步驟 4: 獲取 Dashboard 總覽 📊

**目的**: 顯示所有公司的總體統計

```bash
GET http://localhost:8080/dashboard/summary
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**成功響應**:
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
      }
    ]
  }
}
```

**適用場景**: 首頁總覽頁面

---

### 步驟 5: 根據選擇的公司和區域獲取詳細數據 🔍

用戶在下拉選單選擇公司後，可以調用以下 API：

#### 5.1 獲取區域總覽（推薦） ⭐

**最完整的 API**，一次獲取所有數據（包含所有區域）：

```bash
GET http://localhost:8080/dashboard/areas?company_id=1
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**包含內容**:
- ✅ 區域統計（電量、溫度、設備）
- ✅ 電表數據
- ✅ 溫度感測器數據
- ✅ 冷氣設備狀態

**適用場景**: 
- 區域詳情頁
- 綜合監控頁面
- 需要完整數據的儀表板

**前端篩選特定區域**:
```javascript
// 獲取所有區域數據後，前端可以根據 selectedAreaId 篩選
const filteredData = areaData.areas.filter(area => 
  selectedAreaId === '' || area.area_id === selectedAreaId
);
```

#### 5.2 只獲取電表數據

```bash
GET http://localhost:8080/dashboard/meters?company_id=1
Authorization: Bearer YOUR_ACCESS_TOKEN

# 查詢歷史數據
GET http://localhost:8080/dashboard/meters?company_id=1&start_time=2025-10-19T00:00:00Z&end_time=2025-10-19T23:59:59Z
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**適用場景**: 電量分析頁面

#### 5.3 只獲取溫度數據

```bash
GET http://localhost:8080/dashboard/temperatures?company_id=1
Authorization: Bearer YOUR_ACCESS_TOKEN

# 查詢歷史數據
GET http://localhost:8080/dashboard/temperatures?company_id=1&start_time=2025-10-19T00:00:00Z&end_time=2025-10-19T23:59:59Z
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**適用場景**: 環境監控頁面

---

## 📱 前端頁面建議結構

### 1. 登入頁 (Login Page)
```
[ 帳號輸入框 ]
[ 密碼輸入框 ]
[ 登入按鈕 ]
```
**API**: `POST /auth/login`

---

### 2. 首頁總覽 (Dashboard Overview)
```
+----------------------------------+
| 總公司數: 2  |  總設備數: 5      |
+----------------------------------+
| 公司 A - 總電量: 1500.5 kWh     |
| 公司 B - 總電量: 980.3 kWh      |
+----------------------------------+
```
**API**: `GET /dashboard/summary`

---

### 3. 詳細監控頁 (Detail Monitoring)
```
+----------------------------------+
| [公司下拉選單: 測試公司 A ▼]     |
| [區域下拉選單: 賣場 ▼] (新增)    |
+----------------------------------+
| 區域: 賣場                        |
|   📊 統計                         |
|     - 總電量: 1500.5 kWh         |
|     - 平均溫度: 27.5°C           |
|     - 運行冷氣: 2/3              |
|   ⚡ 電表列表                    |
|     - 電表 ID: xxx (75.2 kW)    |
|   🌡️ 溫度感測器                 |
|     - 感測器 ID: xxx (28.5°C)   |
|   ❄️ 冷氣設備                   |
|     - 冷氣1: 運行中              |
+----------------------------------+
```
**API 調用順序**:
1. `GET /dashboard/companies` → 填充公司下拉選單
2. 用戶選擇公司後 → `GET /dashboard/company/areas?company_id={selected}` → 填充區域下拉選單
3. `GET /dashboard/areas?company_id={selected}` → 顯示所有區域數據
4. 前端根據選擇的區域 ID 篩選顯示

---

## 🔧 常見問題排查

### 問題 1: 404 Not Found
```
Request URL: http://localhost:3000/api/dashboard/temperatures
Status: 404 Not Found
```

**原因**: API 路徑錯誤

**解決方案**:
- ✅ 正確路徑: `http://localhost:8080/dashboard/temperatures`
- ❌ 錯誤路徑: `http://localhost:3000/api/dashboard/temperatures`

**檢查事項**:
1. 後端服務是否運行在 port 8080
2. 是否有反向代理配置
3. 路徑中是否多了 `/api` 前綴

---

### 問題 2: 500 Internal Server Error
```
Request URL: http://localhost:3000/api/dashboard/summary
Status: 500 Internal Server Error
```

**可能原因**:
1. ❌ 資料庫連接失敗
2. ❌ 缺少必要的資料表
3. ❌ 用戶沒有關聯任何公司

**排查步驟**:

#### Step 1: 檢查資料庫連接
```bash
# 查看後端日誌
tail -f /path/to/backend/logs
```

#### Step 2: 確認資料表存在
```sql
-- 檢查必要的表
SELECT * FROM company LIMIT 1;
SELECT * FROM company_member LIMIT 1;
SELECT * FROM company_device LIMIT 1;
SELECT * FROM meters LIMIT 1;
SELECT * FROM temperatures LIMIT 1;
```

#### Step 3: 確認用戶有關聯公司
```sql
-- 假設用戶 member_id = 2
SELECT cm.*, c.name as company_name
FROM company_member cm
JOIN company c ON cm.company_id = c.id
WHERE cm.member_id = 2;
```

**如果沒有數據，需要建立關聯**:
```sql
-- 關聯用戶到公司
INSERT INTO company_member (company_id, member_id, create_id, create_time, modify_id, modify_time)
VALUES (1, 2, 1, NOW(), 1, NOW());
```

---

### 問題 3: 401 Unauthorized
```json
{
  "success": false,
  "error": "unauthorized: member_id not found"
}
```

**原因**: Token 無效或未提供

**解決方案**:
```javascript
// 確保所有請求都帶上 Authorization header
fetch('http://localhost:8080/dashboard/companies', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,  // ✅ 正確
    'Content-Type': 'application/json'
  }
})

// ❌ 錯誤：忘記帶 Authorization
fetch('http://localhost:8080/dashboard/companies', {
  headers: {
    'Content-Type': 'application/json'
  }
})
```

---

## 🧪 完整測試流程

### 使用 cURL 測試

```bash
# 1. 登入取得 Token
TOKEN=$(curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"company_manager@surewell.com","password":"your_password"}' \
  | jq -r '.data.access_token')

echo "Token: $TOKEN"

# 2. 測試獲取公司列表
curl -X GET http://localhost:8080/dashboard/companies \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. 測試獲取區域列表（假設 company_id = 1）
curl -X GET "http://localhost:8080/dashboard/company/areas?company_id=1" \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. 測試 Dashboard 總覽
curl -X GET http://localhost:8080/dashboard/summary \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. 測試區域完整數據（假設 company_id = 1）
curl -X GET "http://localhost:8080/dashboard/areas?company_id=1" \
  -H "Authorization: Bearer $TOKEN" | jq

# 6. 測試電表數據
curl -X GET "http://localhost:8080/dashboard/meters?company_id=1" \
  -H "Authorization: Bearer $TOKEN" | jq

# 7. 測試溫度數據
curl -X GET "http://localhost:8080/dashboard/temperatures?company_id=1" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**輸出範例 - 區域列表**:
```json
{
  "success": true,
  "data": {
    "company_id": 1,
    "areas": [
      {
        "area_id": "4f61a222-2ada-46b1-b929-16f1110c1c99",
        "area_name": "賣場"
      }
    ]
  }
}
```

---

## 📋 API 調用流程圖

```
用戶打開前端應用
    ↓
[ 1 ] 登入頁面
    ↓ POST /auth/login
獲取 Access Token
    ↓
[ 2 ] 儲存 Token 到狀態管理 (Redux/Context)
    ↓
+-----------------------------------+
| [ 3 ] 首頁載入                     |
|   ↓                                |
|   GET /dashboard/summary           |
|   ↓                                |
|   顯示所有公司的總覽                |
+-----------------------------------+
    ↓
用戶點擊「詳細監控」
    ↓
+-----------------------------------+
| [ 4 ] 詳細監控頁載入                |
|   ↓                                |
|   GET /dashboard/companies         |
|   ↓                                |
|   填充公司下拉選單                  |
|   ↓                                |
|   用戶選擇公司 ID = 1              |
|   ↓                                |
|   GET /dashboard/company/areas?    |
|   company_id=1                     |
|   ↓                                |
|   填充區域下拉選單 (新增)           |
|   ↓                                |
|   GET /dashboard/areas?company_id=1|
|   ↓                                |
|   顯示該公司的所有區域數據          |
|   ↓                                |
|   前端根據選擇的區域 ID 篩選顯示    |
+-----------------------------------+
```

---

## 🎯 前端實作範例 (React + TypeScript)

### 1. API Client 設置

```typescript
// src/api/dashboard.ts
const API_BASE_URL = 'http://localhost:8080';

export const dashboardAPI = {
  // 獲取公司列表
  getCompanies: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/companies`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // 獲取指定公司的區域列表 (新增)
  getCompanyAreas: async (token: string, companyId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/company/areas?company_id=${companyId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.json();
  },

  // 獲取總覽
  getSummary: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // 獲取區域詳細數據
  getAreas: async (token: string, companyId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/areas?company_id=${companyId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.json();
  }
};
```

### 2. 公司和區域選擇組件

```typescript
// src/components/CompanyAreaSelector.tsx
import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../api/dashboard';

interface Company {
  company_id: number;
  company_name: string;
  is_active: boolean;
}

interface Area {
  area_id: string;
  area_name: string;
}

export const CompanyAreaSelector: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const token = localStorage.getItem('access_token');

  // 載入公司列表
  useEffect(() => {
    if (token) {
      dashboardAPI.getCompanies(token).then(res => {
        if (res.success) {
          setCompanies(res.data.companies);
          if (res.data.companies.length > 0) {
            setSelectedCompanyId(res.data.companies[0].company_id);
          }
        }
      });
    }
  }, [token]);

  // 當公司改變時，載入該公司的區域列表
  useEffect(() => {
    if (token && selectedCompanyId) {
      dashboardAPI.getCompanyAreas(token, selectedCompanyId).then(res => {
        if (res.success) {
          setAreas(res.data.areas);
          setSelectedAreaId(''); // 重置為"全部區域"
        }
      });
    }
  }, [selectedCompanyId, token]);

  return (
    <div className="selector-container">
      {/* 公司下拉選單 */}
      <select 
        value={selectedCompanyId || ''} 
        onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
        className="form-select"
      >
        <option value="">請選擇公司</option>
        {companies.map(company => (
          <option key={company.company_id} value={company.company_id}>
            {company.company_name}
          </option>
        ))}
      </select>

      {/* 區域下拉選單 (新增) */}
      {selectedCompanyId && (
        <select 
          value={selectedAreaId} 
          onChange={(e) => setSelectedAreaId(e.target.value)}
          className="form-select"
        >
          <option value="">全部區域</option>
          {areas.map(area => (
            <option key={area.area_id} value={area.area_id}>
              {area.area_name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
```

---

## 🚨 重要提醒

### ✅ 必須先完成的設置

1. **建立公司數據**
```sql
INSERT INTO company (name, is_active, create_id, create_time, modify_id, modify_time)
VALUES ('測試公司 A', true, 1, NOW(), 1, NOW());
```

2. **關聯用戶到公司**
```sql
INSERT INTO company_member (company_id, member_id, create_id, create_time, modify_id, modify_time)
VALUES (1, 2, 1, NOW(), 1, NOW());
```

3. **建立設備配置**
```sql
INSERT INTO company_device (company_id, device_id, content, create_id, create_time, modify_id, modify_time)
VALUES (1, 1, '{"areas": [...], "packages": [...]}'::jsonb, 1, NOW(), 1, NOW());
```

4. **準備測試數據**
```sql
-- 電表數據
INSERT INTO meters (timestamp, meter_id, k_wh, kw)
VALUES (NOW(), 'test-meter-001', 1500.5, 75.2);

-- 溫度數據
INSERT INTO temperatures (timestamp, temperature_id, temperature, humidity)
VALUES (NOW(), 'test-sensor-001', 28.5, 65.0);
```

---

## 📞 需要幫助？

如果遇到問題，請提供以下信息：

1. 完整的錯誤訊息
2. API 請求 URL
3. 請求 Headers
4. 後端日誌輸出
5. 資料庫是否有相關數據

這樣可以更快速地定位和解決問題！

