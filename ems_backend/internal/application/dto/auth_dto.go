package dto

// LoginRequest - 登入請求
type LoginRequest struct {
	Account  string `json:"account" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// RefreshTokenRequest - 刷新 Token 請求
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// LogoutRequest - 登出請求
type LogoutRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// AuthResponse - 認證回應
type AuthResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	Member       MemberInfo   `json:"member"`
	MemberRoles  []MemberRole `json:"member_roles"`
	ExpiresIn    int64        `json:"expires_in"`
	TokenType    string       `json:"token_type"`
}

// MemberInfo - 會員信息
type MemberInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// MemberRole - 會員角色
type MemberRole struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}
