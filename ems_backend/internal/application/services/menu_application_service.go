package services

import (
	"ems_backend/internal/application/dto"
	"ems_backend/internal/domain/menu/entities"
	"ems_backend/internal/domain/menu/services"
)

type MenuApplicationService struct {
	menuService *services.MenuService
}

func NewMenuApplicationService(menuService *services.MenuService) *MenuApplicationService {
	return &MenuApplicationService{menuService: menuService}
}

func (s *MenuApplicationService) GetAll() ([]*dto.MenuResponse, error) {
	menus, err := s.menuService.GetAll()
	if err != nil {
		return nil, err
	}
	menuResponses := make([]*dto.MenuResponse, len(menus))
	for i, menu := range menus {
		menuResponses[i] = &dto.MenuResponse{
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
	return menuResponses, nil
}

func (s *MenuApplicationService) Create(menu *dto.MenuRequest, memberID uint) (*dto.APIResponse, error) {
	var parent uint
	if menu.Parent != 0 {
		parent = menu.Parent
	}

	err := s.menuService.Create(&entities.Menu{
		Title:    menu.Title,
		Icon:     menu.Icon,
		Url:      menu.Url,
		Parent:   parent,
		Sort:     menu.Sort,
		IsEnable: menu.IsEnable,
		IsShow:   menu.IsShow,
	}, memberID)
	if err != nil {
		return &dto.APIResponse{Success: false, Error: err.Error()}, err
	}
	return &dto.APIResponse{Success: true}, nil
}

func (s *MenuApplicationService) Update(menu *dto.MenuRequest, memberID uint) (*dto.APIResponse, error) {
	err := s.menuService.Update(&entities.Menu{
		ID:       menu.ID,
		Title:    menu.Title,
		Icon:     menu.Icon,
		Url:      menu.Url,
		Parent:   menu.Parent,
		Sort:     menu.Sort,
		IsEnable: menu.IsEnable,
		IsShow:   menu.IsShow,
	}, memberID)

	if err != nil {
		return &dto.APIResponse{Success: false, Error: err.Error()}, err
	}
	return &dto.APIResponse{Success: true}, nil

}

func (s *MenuApplicationService) Delete(id uint) error {
	return s.menuService.Delete(id)
}

func (s *MenuApplicationService) GetByRoleId(roleId uint) *dto.APIResponse {
	menus, err := s.menuService.GetByRoleId(roleId)
	if err != nil {
		return &dto.APIResponse{Success: false, Error: err.Error()}
	}
	menuResponses := make([]*dto.MenuResponse, len(menus))
	for i, menu := range menus {
		menuResponses[i] = &dto.MenuResponse{
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
	return &dto.APIResponse{Success: true, Data: menuResponses}
}
