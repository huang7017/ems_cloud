package repositories

import (
	"ems_backend/internal/domain/menu/entities"
	"ems_backend/internal/infrastructure/persistence/models"
	"time"

	"gorm.io/gorm"
)

type MenuRepository struct {
	db *gorm.DB
}

func NewMenuRepository(db *gorm.DB) *MenuRepository {
	return &MenuRepository{db: db}
}

func (r *MenuRepository) GetAll() ([]*entities.Menu, error) {
	var menus []*models.MenuModel
	if err := r.db.Find(&menus).Error; err != nil {
		return nil, err
	}
	return r.mapToDomain(menus), nil
}

func (r *MenuRepository) Create(menu *entities.Menu, memberID uint) error {
	return r.db.Create(&models.MenuModel{
		Title:      menu.Title,
		Icon:       menu.Icon,
		Url:        menu.Url,
		Parent:     menu.Parent,
		Sort:       menu.Sort,
		IsEnable:   menu.IsEnable,
		IsShow:     menu.IsShow,
		CreateID:   memberID,
		CreateTime: time.Now(),
		ModifyID:   memberID,
		ModifyTime: time.Now(),
	}).Error
}

func (r *MenuRepository) Update(menu *entities.Menu, memberID uint) error {
	return r.db.Model(&models.MenuModel{}).Where("id = ?", menu.ID).Updates(map[string]interface{}{
		"title":       menu.Title,
		"icon":        menu.Icon,
		"url":         menu.Url,
		"parent":      menu.Parent,
		"sort":        menu.Sort,
		"is_enable":   menu.IsEnable,
		"is_show":     menu.IsShow,
		"modify_id":   memberID,
		"modify_time": time.Now(),
	}).Error
}

func (r *MenuRepository) Delete(id uint) error {
	return r.db.Delete(&models.MenuModel{}, id).Error
}

func (r *MenuRepository) mapToDomain(menus []*models.MenuModel) []*entities.Menu {
	menuEntities := make([]*entities.Menu, len(menus))
	for i, menu := range menus {
		menuEntities[i] = &entities.Menu{
			ID:       menu.ID,
			Title:    menu.Title,
			Icon:     menu.Icon,
			Url:      menu.Url,
			Parent:   menu.Parent,
			Sort:     menu.Sort,
			IsEnable: menu.IsEnable,
			IsShow:   menu.IsShow,
		}
	}
	return menuEntities
}
