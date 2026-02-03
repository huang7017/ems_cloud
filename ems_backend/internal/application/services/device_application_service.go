package services

import (
	"errors"

	"ems_backend/internal/application/dto"
	"ems_backend/internal/domain/device/entities"
	"ems_backend/internal/domain/device/repositories"
)

// DeviceApplicationService 設備應用服務
type DeviceApplicationService struct {
	deviceRepo repositories.DeviceRepository
}

// NewDeviceApplicationService 創建設備應用服務
func NewDeviceApplicationService(deviceRepo repositories.DeviceRepository) *DeviceApplicationService {
	return &DeviceApplicationService{
		deviceRepo: deviceRepo,
	}
}

// GetAllDevices 獲取所有設備
func (s *DeviceApplicationService) GetAllDevices() ([]*dto.DeviceResponse, error) {
	devices, err := s.deviceRepo.FindAll()
	if err != nil {
		return nil, err
	}
	return dto.NewDeviceResponseList(devices), nil
}

// GetDeviceByID 根據 ID 獲取設備
func (s *DeviceApplicationService) GetDeviceByID(id uint) (*dto.DeviceResponse, error) {
	device, err := s.deviceRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return dto.NewDeviceResponse(device), nil
}

// CreateDevice 創建設備
func (s *DeviceApplicationService) CreateDevice(req *dto.DeviceCreateRequest, createID uint) (*dto.DeviceResponse, error) {
	// 檢查 SN 是否已存在
	exists, err := s.deviceRepo.ExistsBySN(req.SN)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("SN 已存在")
	}

	// 創建設備
	device := entities.NewDevice(req.SN, createID)
	if err := s.deviceRepo.Create(device); err != nil {
		return nil, err
	}

	return dto.NewDeviceResponse(device), nil
}

// UpdateDevice 更新設備
func (s *DeviceApplicationService) UpdateDevice(id uint, req *dto.DeviceUpdateRequest, modifyID uint) (*dto.DeviceResponse, error) {
	// 獲取現有設備
	device, err := s.deviceRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// 檢查 SN 是否已被其他設備使用
	exists, err := s.deviceRepo.ExistsBySNExcludeID(req.SN, id)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("SN 已被其他設備使用")
	}

	// 更新設備
	device.Update(req.SN, modifyID)
	if err := s.deviceRepo.Update(device); err != nil {
		return nil, err
	}

	return dto.NewDeviceResponse(device), nil
}

// DeleteDevice 刪除設備
func (s *DeviceApplicationService) DeleteDevice(id uint) error {
	// 檢查設備是否存在
	_, err := s.deviceRepo.FindByID(id)
	if err != nil {
		return err
	}

	return s.deviceRepo.Delete(id)
}

// GetUnassignedDevices 獲取未被綁定到任何公司的設備
func (s *DeviceApplicationService) GetUnassignedDevices() ([]*dto.DeviceResponse, error) {
	devices, err := s.deviceRepo.FindUnassigned()
	if err != nil {
		return nil, err
	}
	return dto.NewDeviceResponseList(devices), nil
}
