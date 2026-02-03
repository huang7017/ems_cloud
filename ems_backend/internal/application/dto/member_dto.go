package dto

// MemberDTO 成員數據傳輸對象
type MemberDTO struct {
	ID       uint       `json:"id"`
	Name     string     `json:"name"`
	Email    string     `json:"email"`
	IsEnable bool       `json:"is_enable"`
	Roles    []RoleInfo `json:"roles"`
}

// MemberUpdateStatusRequest 更新成員狀態請求
type MemberUpdateStatusRequest struct {
	IsEnable bool `json:"is_enable" binding:"required"`
}

// RoleInfo 角色信息
type RoleInfo struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

// MemberCreateRequest 創建成員請求
type MemberCreateRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	IsEnable bool   `json:"is_enable"`
	RoleIDs  []uint `json:"role_ids" binding:"required,min=1"`
}

// MemberUpdateRequest 更新成員請求
type MemberUpdateRequest struct {
	Name     string  `json:"name" binding:"required"`
	Email    string  `json:"email" binding:"required,email"`
	Password *string `json:"password,omitempty"`
	IsEnable bool    `json:"is_enable"`
	RoleIDs  []uint  `json:"role_ids" binding:"required,min=1"`
}
