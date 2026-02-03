# EMS Cloud 部署指南

## 目錄

1. [資料庫設置](#資料庫設置)
2. [後端部署](#後端部署)
3. [前端部署](#前端部署)
4. [RBAC 權限初始化](#rbac-權限初始化)

---

## 資料庫設置

### 1. 確保資料表存在

如果是全新安裝，執行 `sql/database.sql` 創建所有表。

### 2. 初始化 RBAC 權限

**首次安裝或權限重置時執行：**

```bash
# 連接到資料庫
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d ems

# 執行 RBAC 初始化腳本
\i sql/rbac_full_reset.sql
```

或在 GUI 工具（如 DataGrip、pgAdmin）中執行 `sql/rbac_full_reset.sql`。

這個腳本會：
- 清空並重建所有權限數據
- 創建 `system` 角色（如果不存在）
- 為所有菜單創建對應的 CRUD 權限
- 將所有權限分配給 `system` 角色
- 確保 `member_id=1` (SystemAdmin) 屬於 `system` 角色

### 3. 添加設備管理菜單（可選）

如果需要設備管理功能：

```bash
\i sql/device_management_setup.sql
```

---

## 後端部署

### 1. 環境變數配置

在部署伺服器上設置以下環境變數：

```bash
export DB_HOST=your_db_host
export DB_PORT=5432
export DB_USER=ems_user
export DB_CODE=your_db_password
export DB_NAME=ems

export JWT_ACCESS_SECRET=your_secure_access_secret_here
export JWT_REFRESH_SECRET=your_secure_refresh_secret_here

export PORT=8080
export GIN_MODE=release

# 可選：SQS 配置
export ENABLE_SQS=false
export AWS_REGION=ap-southeast-2
```

### 2. 編譯後端

```bash
cd ems_backend

# Mac 上交叉編譯 Linux 版本
./build.sh

# 或直接編譯
GOOS=linux GOARCH=amd64 go build -o ems_backend_linux cmd/api/main.go
```

### 3. 部署到伺服器

```bash
# 上傳二進位檔
scp ems_backend_linux user@server:/opt/ems/

# SSH 到伺服器
ssh user@server

# 設置權限
chmod +x /opt/ems/ems_backend_linux

# 使用 systemd 管理服務
sudo cp ems-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ems-backend
sudo systemctl start ems-backend

# 查看日誌
sudo journalctl -u ems-backend -f
```

### 4. Systemd 服務檔案

`/etc/systemd/system/ems-backend.service`:

```ini
[Unit]
Description=EMS Backend Service
After=network.target

[Service]
Type=simple
User=ems
WorkingDirectory=/opt/ems
ExecStart=/opt/ems/ems_backend_linux
Restart=always
RestartSec=5

# 環境變數
Environment=DB_HOST=your_db_host
Environment=DB_PORT=5432
Environment=DB_USER=ems_user
Environment=DB_CODE=your_db_password
Environment=DB_NAME=ems
Environment=JWT_ACCESS_SECRET=your_secure_access_secret
Environment=JWT_REFRESH_SECRET=your_secure_refresh_secret
Environment=PORT=8080
Environment=GIN_MODE=release

[Install]
WantedBy=multi-user.target
```

---

## 前端部署

### 1. 配置環境

編輯 `ems_frontend/src/config/environment.ts`：

```typescript
export const config = {
  apiBaseUrl: 'https://your-api-domain.com',  // 後端 API 地址
  apiTimeout: 30000,
};
```

### 2. 編譯前端

```bash
cd ems_frontend
npm install
npm run build
```

### 3. 部署靜態檔案

將 `dist/` 目錄內容部署到：
- **Nginx**: `/var/www/ems/`
- **CDN**: 上傳到 S3/CloudFront
- **其他靜態服務器**

### 4. Nginx 配置範例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/ems;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理（如果後端在同一台伺服器）
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## RBAC 權限初始化

### 權限代碼對照表

| 功能模組 | 權限代碼 | 說明 |
|---------|---------|------|
| **菜單管理** | `menu:read` | 查看菜單 |
| | `menu:create` | 新增菜單 |
| | `menu:update` | 編輯菜單 |
| | `menu:delete` | 刪除菜單 |
| **用戶管理** | `member:read` | 查看用戶 |
| | `member:create` | 新增用戶 |
| | `member:update` | 編輯用戶 |
| | `member:update_status` | 啟用/停用用戶 |
| **角色管理** | `role:read` | 查看角色 |
| | `role:create` | 新增角色 |
| | `role:update` | 編輯角色 |
| | `role:delete` | 刪除角色 |
| | `role:assign_powers` | 分配權限 |
| | `role:remove_powers` | 移除權限 |
| | `role:assign_members` | 分配成員 |
| | `role:remove_members` | 移除成員 |
| **權限管理** | `power:read` | 查看權限 |
| | `power:create` | 新增權限 |
| | `power:update` | 編輯權限 |
| | `power:delete` | 刪除權限 |
| **設備管理** | `device:read` | 查看設備 |
| | `device:create` | 新增設備 |
| | `device:update` | 編輯設備 |
| | `device:delete` | 刪除設備 |

### 默認角色

- **system**: 系統管理員，擁有所有權限
- 可根據需求創建其他角色（如 admin, editor, viewer）

### 默認帳號

- **帳號**: system@ems.com
- **密碼**: 請查看資料庫中的密碼設置

---

## 常見問題

### Q: 登入後沒有權限

1. 確認用戶已分配角色：
   ```sql
   SELECT * FROM member_role WHERE member_id = <your_member_id>;
   ```

2. 確認角色已分配權限：
   ```sql
   SELECT * FROM role_power WHERE role_id = <your_role_id>;
   ```

3. 重新執行 `rbac_full_reset.sql` 重置權限

### Q: API 返回 401 Unauthorized

1. 檢查 JWT token 是否過期
2. 檢查 `JWT_ACCESS_SECRET` 環境變數是否正確
3. 重新登入獲取新 token

### Q: 前端頁面空白

1. 檢查瀏覽器 Console 是否有錯誤
2. 確認 API 地址配置正確
3. 確認 Nginx 的 `try_files` 配置正確

---

## 部署檢查清單

- [ ] 資料庫連接正常
- [ ] RBAC 權限已初始化
- [ ] 後端服務已啟動
- [ ] 前端已編譯並部署
- [ ] Nginx/代理配置正確
- [ ] HTTPS 證書配置（生產環境）
- [ ] 防火牆規則配置
- [ ] 日誌監控設置
