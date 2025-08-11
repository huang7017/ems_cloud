package entities

// Menu - 選單
type Menu struct {
	ID       uint   `json:"id"`
	Parent   uint   `json:"parent"`
	Title    string `json:"title"`
	Url      string `json:"url"`
	Icon     string `json:"icon"`
	Sort     int    `json:"sort"`
	IsEnable bool   `json:"is_enable"`
	IsShow   bool   `json:"is_show"`
}
