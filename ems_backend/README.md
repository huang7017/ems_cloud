# EMS Backend

基於 DDD (Domain-Driven Design) 和 Clean Architecture 的 EMS 後端系統。

## 項目結構

```
ems_backend/
├── cmd/
│   └── api/
│       └── main.go                    # 應用程序入口點
├── internal/
│   ├── domain/                        # 領域層
│   │   ├── auth/                      # 認證限界上下文
│   │   │   ├── entities/
│   │   │   │   ├── auth_session.go
│   │   │   │   └── auth_result.go
│   │   │   ├── value_objects/
│   │   │   │   ├── jwt_token.go
│   │   │   │   └── refresh_token.go
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.go
│   │   │   └── services/
│   │   │       └── auth_service.go
│   │   └── member/                    # 會員限界上下文
│   │       ├── entities/
│   │       │   ├── member.go
│   │       │   └── member_public_info.go
│   │       ├── value_objects/
│   │       │   ├── user_id.go
│   │       │   ├── email.go
│   │       │   └── username.go
│   │       └── repositories/
│   │           └── member_repository.go
│   ├── application/                   # 應用層
│   │   ├── dto/
│   │   │   └── auth_dto.go
│   │   └── services/
│   │       └── auth_application_service.go
│   ├── infrastructure/                # 基礎設施層
│   │   └── persistence/
│   │       ├── models/
│   │       │   ├── member_model.go
│   │       │   └── auth_session_model.go
│   │       └── repositories/
│   │           ├── member_repository.go
│   │           └── auth_repository.go
│   └── interface/                     # 接口層
│       └── api/
│           ├── handlers/
│           │   └── auth_handler.go
│           ├── middleware/
│           │   └── auth_middleware.go
│           └── router/
│               └── auth_router.go
├── go.mod
└── go.sum
```

## 架構特點

### 1. DDD 設計
- **Domain Layer**: 包含業務邏輯和領域規則
- **Value Objects**: 封裝業務概念（如 Email、UserID）
- **Entities**: 包含業務行為的實體
- **Repository Pattern**: 抽象數據訪問

### 2. Clean Architecture
- **Domain**: 最內層，包含業務邏輯
- **Application**: 協調領域服務
- **Infrastructure**: 技術實現（數據庫、外部服務）
- **Interface**: 處理 HTTP 請求和回應

### 3. JWT 認證
- Access Token: 短期訪問令牌（24小時）
- Refresh Token: 長期刷新令牌（7天）
- 安全的 Token 驗證和刷新機制

## API 端點

### 認證相關
- `POST /api/auth/login` - 用戶登入
- `POST /api/auth/refresh` - 刷新 Token
- `POST /api/auth/logout` - 用戶登出

### 回應格式
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "abc123def456...",
    "member": {
      "id": "1",
      "name": "John Doe"
    },
    "expires_in": 86400,
    "token_type": "Bearer"
  }
}
```

## 運行方式

1. 設置環境變量
2. 運行 `go run cmd/api/main.go`
3. 服務器將在 `:8080` 啟動

## 技術棧

- **Framework**: Gin
- **ORM**: GORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Architecture**: DDD + Clean Architecture 