package services

import (
	"ems_backend/internal/application/dto"
	companyEntities "ems_backend/internal/domain/company/entities"
	companyRepo "ems_backend/internal/domain/company/repositories"
	deviceRepo "ems_backend/internal/domain/company_device/repositories"
	temperatureEntities "ems_backend/internal/domain/temperature/entities"
	temperatureRepo "ems_backend/internal/domain/temperature/repositories"
	"errors"
	"log"
)

type DashboardTemperatureService struct {
	companyRepo       companyRepo.CompanyRepository
	companyDeviceRepo deviceRepo.CompanyDeviceRepository
	temperatureRepo   temperatureRepo.TemperatureRepository
}

func NewDashboardTemperatureService(
	companyRepo companyRepo.CompanyRepository,
	companyDeviceRepo deviceRepo.CompanyDeviceRepository,
	temperatureRepo temperatureRepo.TemperatureRepository,
) *DashboardTemperatureService {
	return &DashboardTemperatureService{
		companyRepo:       companyRepo,
		companyDeviceRepo: companyDeviceRepo,
		temperatureRepo:   temperatureRepo,
	}
}

// getAccessibleCompanies - 根據角色獲取可訪問的公司列表
func (s *DashboardTemperatureService) getAccessibleCompanies(memberID uint, roleID uint) ([]*companyEntities.Company, error) {
	if roleID == DashboardRoleSystemAdmin {
		return s.companyRepo.FindAll()
	}
	return s.companyRepo.FindByMemberID(memberID)
}

// GetTemperatureData - 獲取溫度數據（優化版：批量查詢）
func (s *DashboardTemperatureService) GetTemperatureData(memberID uint, roleID uint, req *dto.DashboardTemperatureRequest) (*dto.DashboardTemperatureResponse, error) {
	// 1. 根據角色獲取可訪問的公司
	companies, err := s.getAccessibleCompanies(memberID, roleID)
	if err != nil {
		return nil, err
	}

	if len(companies) == 0 {
		return nil, errors.New("no companies found for this member")
	}

	// 2. 如果指定了公司ID，驗證權限並過濾公司
	if req.CompanyID > 0 {
		hasAccess := false
		filteredCompanies := make([]*companyEntities.Company, 0)
		for _, company := range companies {
			if company.ID == req.CompanyID {
				filteredCompanies = append(filteredCompanies, company)
				hasAccess = true
				break
			}
		}
		if !hasAccess {
			return nil, errors.New("access denied: you do not have permission to access this company")
		}
		companies = filteredCompanies
	}

	response := &dto.DashboardTemperatureResponse{
		Companies: make([]dto.CompanyTemperatureInfo, 0, len(companies)),
	}

	// 3. 對每個公司獲取設備和溫度數據
	for _, company := range companies {
		companyData, err := s.getCompanyTemperatureData(company.ID, company.Name, req)
		if err != nil {
			continue
		}
		response.Companies = append(response.Companies, *companyData)
	}

	return response, nil
}

// getCompanyTemperatureData - 獲取單個公司的溫度數據（優化版）
func (s *DashboardTemperatureService) getCompanyTemperatureData(companyID uint, companyName string, req *dto.DashboardTemperatureRequest) (*dto.CompanyTemperatureInfo, error) {
	devices, err := s.companyDeviceRepo.FindByCompanyID(companyID)
	if err != nil {
		return nil, err
	}

	companyData := &dto.CompanyTemperatureInfo{
		CompanyID:   companyID,
		CompanyName: companyName,
		Areas:       make([]dto.AreaTemperatureInfo, 0),
	}

	// 第一步：收集所有唯一的溫度感測器 ID
	allSensorIDs := make(map[string]bool)
	type areaInfo struct {
		areaID    string
		areaName  string
		sensorIDs map[string]bool
	}
	areaInfos := make([]areaInfo, 0)

	for _, device := range devices {
		content, err := device.ParseContent()
		if err != nil {
			continue
		}

		// 收集所有 VRF 的溫度感測器（全域）
		vrfSensorIDs := make(map[string]bool)
		for _, vrf := range content.VRFs {
			for _, unit := range vrf.GetUnits() {
				if unit.TemperatureSensorID != "" {
					vrfSensorIDs[unit.TemperatureSensorID] = true
					allSensorIDs[unit.TemperatureSensorID] = true
				}
			}
			for _, tm := range vrf.TemperatureMappings {
				if tm.TemperatureSensorID != "" {
					vrfSensorIDs[tm.TemperatureSensorID] = true
					allSensorIDs[tm.TemperatureSensorID] = true
				}
			}
		}

		// 收集所有 Package 的溫度感測器（全域）
		pkgSensorIDs := make(map[string]bool)
		for _, pkg := range content.Packages {
			if pkg.TemperatureSensorID != "" {
				pkgSensorIDs[pkg.TemperatureSensorID] = true
				allSensorIDs[pkg.TemperatureSensorID] = true
			}
			for _, temp := range pkg.Temperatures {
				if temp.TemperatureSensorID != "" {
					pkgSensorIDs[temp.TemperatureSensorID] = true
					allSensorIDs[temp.TemperatureSensorID] = true
				} else if temp.SensorID != "" {
					pkgSensorIDs[temp.SensorID] = true
					allSensorIDs[temp.SensorID] = true
				}
			}
		}

		// 處理每個區域
		for _, area := range content.Areas {
			areaSensorIDs := make(map[string]bool)

			// 根據 ACMapping 找出該區域對應的感測器
			for _, mapping := range area.ACMappings {
				if mapping.IsVRF() {
					// 找到對應的 VRF unit
					for _, vrf := range content.VRFs {
						for _, unit := range vrf.GetUnits() {
							if unit.ID == mapping.ACID && unit.TemperatureSensorID != "" {
								areaSensorIDs[unit.TemperatureSensorID] = true
							}
						}
					}
				} else if mapping.IsPackage() {
					// 找到對應的 Package
					for _, pkg := range content.Packages {
						if pkg.ID == mapping.ACID {
							if pkg.TemperatureSensorID != "" {
								areaSensorIDs[pkg.TemperatureSensorID] = true
							}
							for _, temp := range pkg.Temperatures {
								if temp.TemperatureSensorID != "" {
									areaSensorIDs[temp.TemperatureSensorID] = true
								} else if temp.SensorID != "" {
									areaSensorIDs[temp.SensorID] = true
								}
							}
						}
					}
				}
			}

			// 如果該區域沒有找到感測器，使用所有感測器（兼容舊資料）
			if len(areaSensorIDs) == 0 {
				for id := range vrfSensorIDs {
					areaSensorIDs[id] = true
				}
				for id := range pkgSensorIDs {
					areaSensorIDs[id] = true
				}
			}

			if len(areaSensorIDs) > 0 {
				areaInfos = append(areaInfos, areaInfo{
					areaID:    area.ID,
					areaName:  area.Name,
					sensorIDs: areaSensorIDs,
				})
			}
		}
	}

	// 如果沒有感測器，直接返回
	if len(allSensorIDs) == 0 {
		return companyData, nil
	}

	// 第二步：批量查詢所有感測器的歷史數據
	sensorIDList := make([]string, 0, len(allSensorIDs))
	for id := range allSensorIDs {
		sensorIDList = append(sensorIDList, id)
	}

	log.Printf("[Temperature] Batch querying %d sensors for company %d", len(sensorIDList), companyID)

	// 批量查詢歷史數據
	var historyDataMap map[string][]*temperatureEntities.Temperature
	if req.StartTime != nil && req.EndTime != nil {
		historyTemps, err := s.temperatureRepo.GetByTemperatureIDsAndTimeRange(sensorIDList, *req.StartTime, *req.EndTime)
		if err == nil {
			// 按 sensor ID 分組
			historyDataMap = make(map[string][]*temperatureEntities.Temperature)
			for _, temp := range historyTemps {
				historyDataMap[temp.TemperatureID] = append(historyDataMap[temp.TemperatureID], temp)
			}
		}
	}

	// 批量查詢所有感測器的最新數據（一次查詢取代 N 次查詢）
	latestDataMap, err := s.temperatureRepo.GetLatestByTemperatureIDs(sensorIDList)
	if err != nil {
		log.Printf("[Temperature] Error batch querying latest data: %v", err)
		latestDataMap = make(map[string]*temperatureEntities.Temperature)
	}
	log.Printf("[Temperature] Batch queried latest data for %d sensors", len(latestDataMap))

	// 第三步：組裝每個區域的數據
	processedAreas := make(map[string]bool)
	for _, areaInfo := range areaInfos {
		// 避免重複處理同一區域
		if processedAreas[areaInfo.areaID] {
			continue
		}
		processedAreas[areaInfo.areaID] = true

		areaData := dto.AreaTemperatureInfo{
			AreaID:   areaInfo.areaID,
			AreaName: areaInfo.areaName,
			Sensors:  make([]dto.TemperatureSensorInfo, 0),
		}

		for sensorID := range areaInfo.sensorIDs {
			sensorData := dto.TemperatureSensorInfo{
				SensorID: sensorID,
			}

			// 從批量查詢結果中獲取最新數據（不再單獨查詢）
			if latestTemp, ok := latestDataMap[sensorID]; ok && latestTemp != nil {
				sensorData.LatestData = &dto.TemperatureReading{
					Timestamp:   latestTemp.Timestamp,
					Temperature: latestTemp.Temperature,
					Humidity:    latestTemp.Humidity,
					HeatIndex:   calculateHeatIndex(latestTemp.Temperature, latestTemp.Humidity),
				}
			}

			// 從批量查詢結果中獲取歷史數據
			if historyTemps, ok := historyDataMap[sensorID]; ok && len(historyTemps) > 0 {
				sensorData.HistoryData = make([]dto.TemperatureReading, 0, len(historyTemps))
				for _, temp := range historyTemps {
					sensorData.HistoryData = append(sensorData.HistoryData, dto.TemperatureReading{
						Timestamp:   temp.Timestamp,
						Temperature: temp.Temperature,
						Humidity:    temp.Humidity,
						HeatIndex:   calculateHeatIndex(temp.Temperature, temp.Humidity),
					})
				}
			}

			areaData.Sensors = append(areaData.Sensors, sensorData)
		}

		if len(areaData.Sensors) > 0 {
			companyData.Areas = append(companyData.Areas, areaData)
		}
	}

	return companyData, nil
}

// calculateHeatIndex - 計算體感溫度（Heat Index）
func calculateHeatIndex(T, RH float64) float64 {
	if RH <= 1 {
		RH *= 100
	}

	if T < 27 {
		return T - 0.3*(RH/100)*(T-20)
	}

	HI := -8.78469476 +
		1.61139411*T +
		2.338548838*RH -
		0.14611605*T*RH -
		0.012308094*T*T -
		0.016424828*RH*RH +
		0.002211732*T*T*RH +
		0.00072546*T*RH*RH -
		0.000003582*T*T*RH*RH

	return HI
}
