package services

import (
	"ems_backend/internal/domain/menu/entities"
	"ems_backend/internal/domain/menu/repositories"
)

type MenuService struct {
	menuRepo repositories.MenuRepository
}

func NewMenuService(menuRepo repositories.MenuRepository) *MenuService {
	return &MenuService{menuRepo: menuRepo}
}

func (s *MenuService) GetAll() ([]*entities.Menu, error) {
	return s.menuRepo.GetAll()
}

func (s *MenuService) Create(menu *entities.Menu, memberID uint) error {
	return s.menuRepo.Create(menu, memberID)
}

func (s *MenuService) Update(menu *entities.Menu, memberID uint) error {
	return s.menuRepo.Update(menu, memberID)
}

func (s *MenuService) Delete(id uint) error {
	return s.menuRepo.Delete(id)
}

func (s *MenuService) GetByRoleId(roleId uint) ([]*entities.Menu, error) {
	return s.menuRepo.GetByRoleId(roleId)
}
