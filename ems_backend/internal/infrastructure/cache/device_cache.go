package cache

import (
	"ems_backend/internal/domain/company_device/entities"
	deviceRepo "ems_backend/internal/domain/company_device/repositories"
	"log"
	"sync"
)

// DeviceCache - 設備快取，用於快速查找 package/compressor/vrf 對應的 device
type DeviceCache struct {
	mu sync.RWMutex

	// package_id -> company_device_id
	packageToDevice map[string]uint

	// compressor_id -> company_device_id
	compressorToDevice map[string]uint

	// vrf_id -> company_device_id
	vrfToDevice map[string]uint

	// company_device_id -> *entities.CompanyDevice (完整設備資料快取)
	devices map[uint]*entities.CompanyDevice

	repo deviceRepo.CompanyDeviceRepository
}

// NewDeviceCache - 建立設備快取
func NewDeviceCache(repo deviceRepo.CompanyDeviceRepository) *DeviceCache {
	cache := &DeviceCache{
		packageToDevice:    make(map[string]uint),
		compressorToDevice: make(map[string]uint),
		vrfToDevice:        make(map[string]uint),
		devices:            make(map[uint]*entities.CompanyDevice),
		repo:               repo,
	}
	return cache
}

// Initialize - 初始化快取（從資料庫載入）
func (c *DeviceCache) Initialize() error {
	devices, err := c.repo.FindAll()
	if err != nil {
		return err
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	for _, device := range devices {
		c.indexDevice(device)
	}

	log.Printf("[DeviceCache] Initialized with %d devices, %d packages, %d compressors, %d VRFs",
		len(c.devices), len(c.packageToDevice), len(c.compressorToDevice), len(c.vrfToDevice))

	return nil
}

// indexDevice - 為單一設備建立索引
func (c *DeviceCache) indexDevice(device *entities.CompanyDevice) {
	c.devices[device.ID] = device

	content, err := device.ParseContent()
	if err != nil {
		return
	}

	// 索引 packages 和 compressors
	for _, pkg := range content.Packages {
		c.packageToDevice[pkg.ID] = device.ID
		for _, comp := range pkg.Compressors {
			c.compressorToDevice[comp.ID] = device.ID
		}
	}

	// 索引 VRFs
	for _, vrf := range content.VRFs {
		c.vrfToDevice[vrf.ID] = device.ID
	}
}

// GetDeviceByPackageID - 根據 package_id 獲取設備
func (c *DeviceCache) GetDeviceByPackageID(packageID string) (*entities.CompanyDevice, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	deviceID, exists := c.packageToDevice[packageID]
	if !exists {
		return nil, false
	}

	device, exists := c.devices[deviceID]
	return device, exists
}

// GetDeviceByCompressorID - 根據 compressor_id 獲取設備
func (c *DeviceCache) GetDeviceByCompressorID(compressorID string) (*entities.CompanyDevice, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	deviceID, exists := c.compressorToDevice[compressorID]
	if !exists {
		return nil, false
	}

	device, exists := c.devices[deviceID]
	return device, exists
}

// GetDeviceByVRFID - 根據 vrf_id 獲取設備
func (c *DeviceCache) GetDeviceByVRFID(vrfID string) (*entities.CompanyDevice, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	deviceID, exists := c.vrfToDevice[vrfID]
	if !exists {
		return nil, false
	}

	device, exists := c.devices[deviceID]
	return device, exists
}

// GetDeviceByID - 根據 device_id 獲取設備
func (c *DeviceCache) GetDeviceByID(deviceID uint) (*entities.CompanyDevice, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	device, exists := c.devices[deviceID]
	return device, exists
}

// UpdateDevice - 更新設備快取
func (c *DeviceCache) UpdateDevice(device *entities.CompanyDevice) {
	c.mu.Lock()
	defer c.mu.Unlock()

	// 先移除舊的索引
	if oldDevice, exists := c.devices[device.ID]; exists {
		c.removeDeviceIndex(oldDevice)
	}

	// 重新建立索引
	c.indexDevice(device)
}

// removeDeviceIndex - 移除設備索引
func (c *DeviceCache) removeDeviceIndex(device *entities.CompanyDevice) {
	content, err := device.ParseContent()
	if err != nil {
		return
	}

	for _, pkg := range content.Packages {
		delete(c.packageToDevice, pkg.ID)
		for _, comp := range pkg.Compressors {
			delete(c.compressorToDevice, comp.ID)
		}
	}

	for _, vrf := range content.VRFs {
		delete(c.vrfToDevice, vrf.ID)
	}

	delete(c.devices, device.ID)
}

// RefreshDevice - 從資料庫重新載入單一設備
func (c *DeviceCache) RefreshDevice(deviceID uint) error {
	device, err := c.repo.FindByID(deviceID)
	if err != nil {
		return err
	}

	c.UpdateDevice(device)
	return nil
}

// RefreshAll - 重新載入所有設備
func (c *DeviceCache) RefreshAll() error {
	devices, err := c.repo.FindAll()
	if err != nil {
		return err
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	// 清空現有快取
	c.packageToDevice = make(map[string]uint)
	c.compressorToDevice = make(map[string]uint)
	c.vrfToDevice = make(map[string]uint)
	c.devices = make(map[uint]*entities.CompanyDevice)

	// 重新建立索引
	for _, device := range devices {
		c.indexDevice(device)
	}

	log.Printf("[DeviceCache] Refreshed with %d devices", len(c.devices))
	return nil
}
