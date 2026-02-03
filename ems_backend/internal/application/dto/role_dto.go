package dto

// RoleRequest 角色創建/更新請求
type RoleRequest struct {
	ID          uint   `json:"id"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Sort        int    `json:"sort"`
	IsEnable    bool   `json:"is_enable"`
}

// RoleResponse 角色響應
type RoleResponse struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Sort        int    `json:"sort"`
	IsEnable    bool   `json:"is_enable"`
}

// AssignPowersRequest 分配權限請求
type AssignPowersRequest struct {
	PowerIDs []uint `json:"power_ids" binding:"required"`
}

// AssignMembersRequest 分配成員請求
type AssignMembersRequest struct {
	MemberIDs []uint `json:"member_ids" binding:"required"`
}

// RoleMembersResponse 角色成員響應
type RoleMembersResponse struct {
	RoleID    uint   `json:"role_id"`
	MemberIDs []uint `json:"member_ids"`
}

// RolePowersResponse 角色權限響應
type RolePowersResponse struct {
	RoleID   uint   `json:"role_id"`
	PowerIDs []uint `json:"power_ids"`
}
