# RBAC 系統部署指南

本指南將幫助您部署和配置完整的 RBAC（基於角色的訪問控制）系統。

## 📋 目錄
- [系統概述](#系統概述)
- [部署步驟](#部署步驟)
- [功能說明](#功能說明)
- [API 端點](#api-端點)
- [測試指南](#測試指南)
- [故障排除](#故障排除)

---

## 系統概述

### 已實現的功能
✅ **後端 (100%)**
- JWT 環境變量配置
- 完整的 DDD + Clean Architecture 實現
- 權限檢查中間件（RequirePermission）
- 審計日誌中間件（自動記錄所有敏感操作）
- Role、Power、AuditLog 完整 CRUD API

✅ **前端 (80%)**
- RoleSwitch 組件（多角色切換）
- RoleManagement 頁面（角色管理）
- PowerManagement 頁面（權限管理）
- Login 存儲所有角色

---

## 部署步驟

### 1. 數據庫遷移

#### 步驟 1.1: 創建 audit_log 表
```bash
psql -U ems_user -d ems -f ems_backend/internal/infrastructure/persistence/migrations/audit_log_table.sql
```

#### 步驟 1.2: 添加菜單項和權限
```bash
psql -U ems_user -d ems -f sql/rbac_menu_items.sql
```

驗證：
```sql
-- 檢查 audit_log 表是否創建成功
SELECT * FROM audit_log LIMIT 1;

-- 檢查菜單項
SELECT id, title, url FROM menu WHERE title IN ('權限管理', '角色管理');

-- 檢查權限
SELECT * FROM power WHERE code LIKE 'role:%' OR code LIKE 'power:%';
```

### 2. 後端配置

#### 步驟 2.1: 設置環境變量

創建 `.env` 文件或設置環境變量：

```bash
# JWT 配置（必須設置！）
export JWT_ACCESS_SECRET="your-secure-access-secret-key-change-this"
export JWT_REFRESH_SECRET="your-secure-refresh-secret-key-change-this"
export JWT_ACCESS_EXPIRY="24h"
export JWT_REFRESH_EXPIRY="168h"

# 數據庫配置（可選，有默認值）
export DB_HOST="220.132.191.5"
export DB_PORT="9432"
export DB_USER="ems_user"
export DB_CODE="ji394@ems_user"
export DB_NAME="ems"
```

#### 步驟 2.2: 編譯並運行後端

```bash
cd ems_backend

# 編譯
go build -o ems_server cmd/api/main.go

# 運行
./ems_server
# 或
go run cmd/api/main.go
```

驗證：
```bash
# 檢查服務器是否啟動
curl http://localhost:8080/auth/login
```

### 3. 前端配置

#### 步驟 3.1: 安裝依賴並運行

```bash
cd ems_frontend

# 安裝依賴
npm install

# 運行開發服務器
npm run dev
```

#### 步驟 3.2: 驗證前端功能

打開瀏覽器訪問 `http://localhost:5173`，登錄後檢查：

1. ✅ Header 右側應該顯示 "角色" 下拉選單（如果用戶有多個角色）
2. ✅ 側邊欄應該顯示 "權限管理" 和 "角色管理" 菜單項
3. ✅ 點擊 "角色管理" 應該看到角色列表頁面
4. ✅ 點擊 "權限管理" 應該看到權限列表頁面

---

## 功能說明

### 1. 角色切換 (RoleSwitch)

**位置**: Header 右側，Profile 圖標左邊

**功能**:
- 自動檢測用戶的所有角色
- 如果只有一個角色，組件不顯示
- 切換角色後自動重新加載菜單和權限
- 當前角色ID存儲在Cookie中（`roleId`）

**Cookie 結構**:
```json
{
  "roles": "[{\"id\":\"1\",\"name\":\"SystemAdmin\"},{\"id\":\"2\",\"name\":\"Manager\"}]",
  "roleId": "1"
}
```

### 2. 角色管理 (RoleManagement)

**路由**: `/setting/role`

**功能**:
- ✅ 查看所有角色
- ✅ 創建新角色
- ✅ 編輯角色信息
- ✅ 刪除角色
- ✅ 啟用/禁用角色

**操作**:
1. 點擊 "新增角色" 按鈕打開創建對話框
2. 填寫角色名稱、描述、排序等信息
3. 點擊 "保存" 創建角色
4. 點擊表格中的編輯圖標修改角色
5. 點擊刪除圖標刪除角色（會提示確認）

### 3. 權限管理 (PowerManagement)

**路由**: `/setting/power`

**功能**:
- ✅ 查看所有權限
- ✅ 創建新權限
- ✅ 編輯權限信息
- ✅ 刪除權限
- ✅ 關聯到菜單項

**權限代碼格式**: `resource:action`

示例：
- `menu:create` - 創建菜單
- `menu:update` - 更新菜單
- `menu:delete` - 刪除菜單
- `role:query` - 查看角色
- `power:assign` - 分配權限

### 4. 審計日誌 (AuditLog)

**自動記錄的操作**:
- ✅ 菜單的創建、更新、刪除
- ✅ 角色的創建、更新、刪除
- ✅ 權限的創建、更新、刪除
- ✅ 角色權限分配
- ✅ 角色成員分配

**日誌內容**:
- 操作人（member_id）
- 當前角色（role_id）
- 操作類型（action: CREATE, UPDATE, DELETE）
- 資源類型（resource_type: MENU, ROLE, POWER）
- 資源ID（resource_id）
- 詳細信息（details: JSON）
- IP地址和User-Agent
- 操作結果（status: SUCCESS/FAILURE）

---

## API 端點

### 認證相關
```
POST   /auth/login          登錄
POST   /auth/refresh        刷新Token
POST   /auth/logout         登出
```

### 角色管理
```
GET    /roles               獲取所有角色
GET    /roles/:id           獲取單個角色
POST   /roles               創建角色
PUT    /roles/:id           更新角色
DELETE /roles/:id           刪除角色

GET    /roles/:id/powers    獲取角色的權限列表
POST   /roles/:id/powers    為角色分配權限
DELETE /roles/:id/powers    移除角色的權限

GET    /roles/:id/members   獲取角色的成員列表
POST   /roles/:id/members   為角色分配成員
DELETE /roles/:id/members   從角色移除成員
```

### 權限管理
```
GET    /powers              獲取所有權限
GET    /powers/:id          獲取單個權限
GET    /powers/menu?menu_id=1  根據菜單ID獲取權限
GET    /powers/role?role_id=1  根據角色ID獲取權限
POST   /powers              創建權限
PUT    /powers/:id          更新權限
DELETE /powers/:id          刪除權限
```

### 審計日誌
```
GET    /audit-logs          查詢審計日誌（支持過濾）
GET    /audit-logs/:id      獲取單個日誌
GET    /audit-logs/member/:memberId    根據成員ID獲取日誌
GET    /audit-logs/resource/:type      根據資源類型獲取日誌
```

**查詢參數**:
- `member_id` - 成員ID
- `role_id` - 角色ID
- `action` - 操作類型
- `resource_type` - 資源類型
- `status` - 狀態（SUCCESS/FAILURE）
- `start_time` - 開始時間（RFC3339格式）
- `end_time` - 結束時間（RFC3339格式）
- `limit` - 返回數量（默認50，最大1000）
- `offset` - 偏移量

---

## 測試指南

### 1. 測試角色切換

```bash
# 1. 以 SystemAdmin 登錄
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"system@ems.com","password":"your-password"}'

# 2. 檢查返回的 member_roles 數組
# 應該看到所有角色

# 3. 在前端切換角色，觀察 Cookie 中的 roleId 變化
```

### 2. 測試權限檢查

```bash
# 1. 創建一個沒有 menu:create 權限的測試角色

# 2. 使用該角色的 Token 嘗試創建菜單
curl -X POST http://localhost:8080/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Role-ID: $ROLE_ID" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Menu","url":"/test"}'

# 預期結果: 403 Forbidden
```

### 3. 測試審計日誌

```bash
# 1. 執行一些敏感操作（創建角色、分配權限等）

# 2. 查詢審計日誌
curl -X GET "http://localhost:8080/audit-logs?limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Role-ID: $ROLE_ID"

# 3. 驗證日誌內容是否正確記錄
```

### 4. 測試多角色權限合併

```bash
# 1. 創建兩個角色
#    - Role A: 只有 menu:create 權限
#    - Role B: 只有 menu:update 權限

# 2. 將用戶同時分配到這兩個角色

# 3. 使用 Role A 嘗試更新菜單 → 應該失敗
# 4. 使用 Role B 嘗試創建菜單 → 應該失敗
# 5. 驗證權限檢查是否正確
```

---

## 故障排除

### 問題 1: 編譯錯誤 "JSONB redeclared"

**原因**: audit_log_model.go 重複定義了 JSONB 類型

**解決**: 已修復，確保使用最新代碼

### 問題 2: 菜單不顯示角色管理/權限管理

**原因**:
1. 數據庫中沒有菜單項
2. 當前角色沒有訪問權限

**解決**:
```sql
-- 檢查菜單是否存在
SELECT * FROM menu WHERE title IN ('權限管理', '角色管理');

-- 檢查角色是否有權限
SELECT * FROM role_power WHERE role_id = YOUR_ROLE_ID;

-- 為角色分配菜單權限
INSERT INTO role_power (role_id, menu_id, power_id, create_id, create_time, modify_id, modify_time)
VALUES (YOUR_ROLE_ID, MENU_ID, NULL, 1, NOW(), 1, NOW());
```

### 問題 3: 切換角色後頁面沒有刷新

**原因**: RoleSwitch 組件設計為切換後自動刷新頁面

**驗證**:
1. 檢查 Cookie 中的 `roleId` 是否改變
2. 檢查網絡請求是否使用新的 `X-Role-ID` header
3. 確保 axios 攔截器正確添加 header

### 問題 4: 審計日誌沒有記錄

**原因**:
1. 路由沒有添加 audit middleware
2. audit_log 表不存在

**解決**:
```bash
# 檢查 audit_log 表
psql -U ems_user -d ems -c "\d audit_log"

# 手動創建表
psql -U ems_user -d ems -f ems_backend/internal/infrastructure/persistence/migrations/audit_log_table.sql
```

### 問題 5: 403 Forbidden 錯誤

**原因**: 當前角色沒有執行該操作的權限

**調試步驟**:
1. 檢查請求中的 `X-Role-ID` header
2. 查詢該角色擁有的權限
3. 確認 API 端點要求的權限代碼

```sql
-- 查詢角色的所有權限
SELECT p.code
FROM power p
JOIN role_power rp ON rp.power_id = p.id
WHERE rp.role_id = YOUR_ROLE_ID;
```

---

## 下一步

### 建議的後續開發

1. **審計日誌前端頁面** - 創建查詢和查看審計日誌的界面
2. **角色權限分配界面** - 在角色詳情頁添加權限分配功能
3. **用戶管理整合** - 在用戶管理頁面添加角色分配功能
4. **權限預設模板** - 創建常用的角色權限模板
5. **批量操作** - 支持批量分配權限/角色
6. **權限繼承** - 實現角色繼承機制

### 安全建議

1. ✅ **JWT Secret** - 生產環境必須使用強密鑰
2. ✅ **審計日誌** - 定期備份和歸檔日誌
3. ⚠️ **權限檢查** - 為所有敏感API添加權限檢查
4. ⚠️ **HTTPS** - 生產環境使用HTTPS
5. ⚠️ **SQL 注入** - 使用參數化查詢（已實現）

---

## 聯繫支持

如遇問題，請檢查：
1. 後端日誌: `ems_backend/logs/`
2. 瀏覽器控制台錯誤
3. 網絡請求響應

**日誌位置**:
- 後端: `stdout` 或配置的日誌文件
- 前端: 瀏覽器 DevTools Console

---

**部署完成！** 🎉

您的 RBAC 系統現在已經可以使用了。
