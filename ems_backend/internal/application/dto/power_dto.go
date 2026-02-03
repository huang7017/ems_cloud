package dto

// PowerRequest 權限創建/更新請求
type PowerRequest struct {
	ID          uint   `json:"id"`
	MenuID      uint   `json:"menu_id" binding:"required"`
	Title       string `json:"title" binding:"required"`
	Code        string `json:"code" binding:"required"` // 權限代碼，如 "menu:create"
	Description string `json:"description"`
	Sort        int    `json:"sort"`
	IsEnable    bool   `json:"is_enable"`
}

// PowerResponse 權限響應
type PowerResponse struct {
	ID          uint   `json:"id"`
	MenuID      uint   `json:"menu_id"`
	Title       string `json:"title"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Sort        int    `json:"sort"`
	IsEnable    bool   `json:"is_enable"`
}

// PowersByRoleResponse 角色權限列表響應
type PowersByRoleResponse struct {
	RoleID uint            `json:"role_id"`
	Powers []PowerResponse `json:"powers"`
}
