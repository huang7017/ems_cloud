package dto

type MenuRequest struct {
	ID       uint   `json:"id"`
	Title    string `json:"title" binding:"required"`
	Icon     string `json:"icon"`
	Url      string `json:"url" binding:"required"`
	Parent   uint   `json:"parent"`
	Sort     int    `json:"sort"`
	IsEnable bool   `json:"is_enable"`
	IsShow   bool   `json:"is_show"`
}

type MenuResponse struct {
	ID       uint   `json:"id"`
	Title    string `json:"title"`
	Icon     string `json:"icon"`
	Url      string `json:"url"`
	Parent   uint   `json:"parent"`
	Sort     int    `json:"sort"`
	IsEnable bool   `json:"is_enable"`
	IsShow   bool   `json:"is_show"`
}
