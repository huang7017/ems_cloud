package entities

// Role - 角色
type Role struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Sort        int    `json:"sort"`
	IsEnable    bool   `json:"is_enable"`
}
