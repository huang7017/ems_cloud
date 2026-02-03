package entities

// Power - 權限
type Power struct {
	ID          uint   `json:"id"`
	MenuID      uint   `json:"menu_id"`
	Title       string `json:"title"`
	Code        string `json:"code"`         // 權限代碼，如 "menu:create", "user:delete"
	Description string `json:"description"`
	Sort        int    `json:"sort"`
	IsEnable    bool   `json:"is_enable"`
}
