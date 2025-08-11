package repositories

import "ems_backend/internal/domain/menu/entities"

type MenuRepository interface {
	GetAll() ([]*entities.Menu, error)
	Create(menu *entities.Menu, memberID uint) error
	Update(menu *entities.Menu, memberID uint) error
	Delete(id uint) error
}
