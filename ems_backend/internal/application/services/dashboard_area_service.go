package services

import (
	"ems_backend/internal/application/dto"
	companyEntities "ems_backend/internal/domain/company/entities"
	companyRepo "ems_backend/internal/domain/company/repositories"
	deviceRepo "ems_backend/internal/domain/company_device/repositories"
	meterRepo "ems_backend/internal/domain/meter/repositories"
	temperatureRepo "ems_backend/internal/domain/temperature/repositories"
	"errors"
	"log"
	"math"
)

type DashboardAreaService struct {
	companyRepo       companyRepo.CompanyRepository
	companyDeviceRepo deviceRepo.CompanyDeviceRepository
	meterRepo         meterRepo.MeterRepository
	temperatureRepo   temperatureRepo.TemperatureRepository
}

func NewDashboardAreaService(
	companyRepo companyRepo.CompanyRepository,
	companyDeviceRepo deviceRepo.CompanyDeviceRepository,
	meterRepo meterRepo.MeterRepository,
	temperatureRepo temperatureRepo.TemperatureRepository,
) *DashboardAreaService {
	return &DashboardAreaService{
		companyRepo:       companyRepo,
		companyDeviceRepo: companyDeviceRepo,
		meterRepo:         meterRepo,
		temperatureRepo:   temperatureRepo,
	}
}

// getAccessibleCompanies - 根據角色獲取可訪問的公司列表
func (s *DashboardAreaService) getAccessibleCompanies(memberID uint, roleID uint) ([]*companyEntities.Company, error) {
	if roleID == DashboardRoleSystemAdmin {
		// SystemAdmin 可以看所有公司
		return s.companyRepo.FindAll()
	}
	// CompanyManager 和 CompanyUser 只能看自己關聯的公司
	return s.companyRepo.FindByMemberID(memberID)
}

// GetAreaOverview - 獲取區域總覽（包含完整的區域解構和統計）
func (s *DashboardAreaService) GetAreaOverview(memberID uint, roleID uint, req *dto.DashboardAreaRequest) (*dto.DashboardAreaResponse, error) {
	// 1. 根據角色獲取可訪問的公司
	companies, err := s.getAccessibleCompanies(memberID, roleID)
	if err != nil {
		return nil, err
	}

	if len(companies) == 0 {
		return nil, errors.New("no companies found for this member")
	}

	// 2. 驗證用戶是否有權限訪問指定的公司
	var targetCompany *companyEntities.Company
	for _, company := range companies {
		if company.ID == req.CompanyID {
			targetCompany = company
			break
		}
	}

	if targetCompany == nil {
		return nil, errors.New("access denied: you do not have permission to access this company")
	}

	// 3. 獲取公司設備
	devices, err := s.companyDeviceRepo.FindByCompanyID(req.CompanyID)
	if err != nil {
		return nil, err
	}

	response := &dto.DashboardAreaResponse{
		CompanyID:   targetCompany.ID,
		CompanyName: targetCompany.Name,
		Areas:       make([]dto.AreaInfo, 0),
	}

	// 4. 解析每個設備並構建區域信息
	areaMap := make(map[string]*dto.AreaInfo)
	// 收集每個區域的感測器 IDs（用於後續批量查詢）
	areaSensorIDs := make(map[string]map[string]bool)
	// 收集所有唯一的感測器 IDs（全域）
	allSensorIDs := make(map[string]bool)

	for _, device := range devices {
		content, err := device.ParseContent()
		if err != nil {
			continue
		}

		// 處理每個區域
		for _, area := range content.Areas {
			if _, exists := areaMap[area.ID]; !exists {
				areaMap[area.ID] = &dto.AreaInfo{
					AreaID:     area.ID,
					AreaName:   area.Name,
					Meters:     make([]dto.MeterInfo, 0),
					Sensors:    make([]dto.TemperatureSensorInfo, 0),
					ACPackages: make([]dto.ACPackageInfo, 0),
					VRFs:       make([]dto.VRFInfo, 0),
					Statistics: dto.AreaStatistics{},
				}
				areaSensorIDs[area.ID] = make(map[string]bool)
			}

			areaInfo := areaMap[area.ID]
			sensorIDs := areaSensorIDs[area.ID]

			// 收集電表數據
			for _, meterMapping := range area.MeterMappings {
				meterData, err := s.getMeterInfo(meterMapping.DeviceMeterID)
				if err == nil {
					areaInfo.Meters = append(areaInfo.Meters, *meterData)
				}
			}

			// 處理 Package AC - 根據 ac_mappings 關聯
			for _, pkg := range content.Packages {
				// 檢查該 package 是否屬於此區域 (使用 IsPackage() 方法)
				belongsToArea := false
				for _, acMapping := range area.ACMappings {
					if acMapping.ACID == pkg.ID && acMapping.IsPackage() {
						belongsToArea = true
						break
					}
				}

				if belongsToArea {
					// 添加 AC Package 信息
					acPackage := dto.ACPackageInfo{
						PackageID:   pkg.ID,
						PackageName: pkg.Name,
						Compressors: make([]dto.CompressorStatus, 0),
					}

					for _, compressor := range pkg.Compressors {
						acPackage.Compressors = append(acPackage.Compressors, dto.CompressorStatus{
							CompressorID: compressor.ID,
							Address:      compressor.Address,
							IsRunning:    compressor.RunStatus,
							HasError:     compressor.ErrorStatus,
						})
					}

					areaInfo.ACPackages = append(areaInfo.ACPackages, acPackage)

					// 收集溫度感測器 - 從 pkg.TemperatureSensorID
					if pkg.TemperatureSensorID != "" {
						sensorIDs[pkg.TemperatureSensorID] = true
						allSensorIDs[pkg.TemperatureSensorID] = true
					}
					// 收集溫度感測器 - 從 pkg.Temperatures[]
					for _, temp := range pkg.Temperatures {
						if temp.TemperatureSensorID != "" {
							sensorIDs[temp.TemperatureSensorID] = true
							allSensorIDs[temp.TemperatureSensorID] = true
						} else if temp.SensorID != "" {
							sensorIDs[temp.SensorID] = true
							allSensorIDs[temp.SensorID] = true
						}
					}
				}
			}

			// 處理 VRF - ac_mappings.ac_id 指向的是 vrfs[].acs[] 內的個別 unit ID
			// 建立 VRF unit ID 到 VRF 的映射，以便快速查找
			vrfUnitToVRF := make(map[string]int) // unit ID -> VRF index
			for vrfIdx, vrf := range content.VRFs {
				for _, unit := range vrf.GetUnits() {
					vrfUnitToVRF[unit.ID] = vrfIdx
				}
			}

			// 追蹤已添加到此區域的 VRF（避免重複）
			addedVRFs := make(map[string]bool)
			// 追蹤每個 VRF 中屬於此區域的 unit IDs
			vrfAreaUnits := make(map[string]map[string]bool) // VRF ID -> set of unit IDs

			for _, acMapping := range area.ACMappings {
				if acMapping.IsVRF() {
					// ac_id 是個別 VRF unit 的 ID
					if vrfIdx, exists := vrfUnitToVRF[acMapping.ACID]; exists {
						vrf := content.VRFs[vrfIdx]
						if vrfAreaUnits[vrf.ID] == nil {
							vrfAreaUnits[vrf.ID] = make(map[string]bool)
						}
						vrfAreaUnits[vrf.ID][acMapping.ACID] = true
					}
				}
			}

			// 為每個有關聯 unit 的 VRF 添加信息
			for _, vrf := range content.VRFs {
				unitIDs, hasUnits := vrfAreaUnits[vrf.ID]
				if !hasUnits {
					continue
				}

				if addedVRFs[vrf.ID] {
					continue
				}
				addedVRFs[vrf.ID] = true

				// 添加 VRF 信息，只包含屬於此區域的 units
				vrfInfo := dto.VRFInfo{
					VRFID:   vrf.ID,
					Address: vrf.Address,
					ACUnits: make([]dto.ACUnitInfo, 0),
				}

				for _, unit := range vrf.GetUnits() {
					// 只添加屬於此區域的 units
					if !unitIDs[unit.ID] {
						continue
					}

					unitName := ""
					if unit.Name != nil {
						unitName = *unit.Name
					}
					unitLocation := ""
					if unit.Location != nil {
						unitLocation = *unit.Location
					}
					unitNumber := 0
					if unit.Number != nil {
						unitNumber = *unit.Number
					}

					vrfInfo.ACUnits = append(vrfInfo.ACUnits, dto.ACUnitInfo{
						UnitID:    unit.ID,
						Name:      unitName,
						Location:  unitLocation,
						Number:    unitNumber,
						IsRunning: unit.IsRunning(), // 使用 IsRunning() 方法處理不同狀態格式
					})

					// 收集 VRF unit 的溫度感測器
					if unit.TemperatureSensorID != "" {
						sensorIDs[unit.TemperatureSensorID] = true
						allSensorIDs[unit.TemperatureSensorID] = true
					}
				}

				areaInfo.VRFs = append(areaInfo.VRFs, vrfInfo)

				// 收集 VRF 溫度感測器 - 從 TemperatureMappings
				for _, tempMapping := range vrf.TemperatureMappings {
					if tempMapping.TemperatureSensorID != "" {
						sensorIDs[tempMapping.TemperatureSensorID] = true
						allSensorIDs[tempMapping.TemperatureSensorID] = true
					}
				}
			}
		}
	}

	// 4.5 批量查詢所有溫度感測器的最新數據（一次查詢取代 N 次查詢）
	sensorIDList := make([]string, 0, len(allSensorIDs))
	for id := range allSensorIDs {
		sensorIDList = append(sensorIDList, id)
	}

	sensorDataMap := make(map[string]*dto.TemperatureSensorInfo)
	if len(sensorIDList) > 0 {
		log.Printf("[AreaOverview] Batch querying %d temperature sensors", len(sensorIDList))
		latestDataMap, err := s.temperatureRepo.GetLatestByTemperatureIDs(sensorIDList)
		if err != nil {
			log.Printf("[AreaOverview] Error batch querying temperature sensors: %v", err)
		} else {
			// 構建感測器數據映射
			for sensorID, latestTemp := range latestDataMap {
				if latestTemp != nil {
					sensorDataMap[sensorID] = &dto.TemperatureSensorInfo{
						SensorID: sensorID,
						LatestData: &dto.TemperatureReading{
							Timestamp:   latestTemp.Timestamp,
							Temperature: latestTemp.Temperature,
							Humidity:    latestTemp.Humidity,
							HeatIndex:   calculateHeatIndexForArea(latestTemp.Temperature, latestTemp.Humidity),
						},
					}
				}
			}
		}
		log.Printf("[AreaOverview] Batch query completed, got data for %d sensors", len(sensorDataMap))
	}

	// 4.6 使用批量查詢結果填充每個區域的溫度感測器數據
	for areaID, sensorIDs := range areaSensorIDs {
		if areaInfo, exists := areaMap[areaID]; exists {
			for sensorID := range sensorIDs {
				if sensorData, ok := sensorDataMap[sensorID]; ok {
					areaInfo.Sensors = append(areaInfo.Sensors, *sensorData)
				} else {
					// 如果批量查詢沒有找到，添加空數據
					areaInfo.Sensors = append(areaInfo.Sensors, dto.TemperatureSensorInfo{
						SensorID: sensorID,
					})
				}
			}
		}
	}

	// 5. 計算每個區域的統計數據
	for _, areaInfo := range areaMap {
		areaInfo.Statistics = s.calculateAreaStatistics(areaInfo)
		response.Areas = append(response.Areas, *areaInfo)
	}

	return response, nil
}

// getMeterInfo - 獲取電表信息
func (s *DashboardAreaService) getMeterInfo(meterID string) (*dto.MeterInfo, error) {
	meterData := &dto.MeterInfo{
		MeterID: meterID,
	}

	latestMeter, err := s.meterRepo.GetLatestByMeterID(meterID)
	if err == nil && latestMeter != nil {
		meterData.LatestData = &dto.MeterReading{
			Timestamp: latestMeter.Timestamp,
			KWh:       latestMeter.KWh,
			KW:        latestMeter.KW,
		}
	}

	return meterData, nil
}

// getTemperatureSensorInfo - 獲取溫度感測器信息
func (s *DashboardAreaService) getTemperatureSensorInfo(sensorID string) (*dto.TemperatureSensorInfo, error) {
	sensorData := &dto.TemperatureSensorInfo{
		SensorID: sensorID,
	}

	latestTemp, err := s.temperatureRepo.GetLatestByTemperatureID(sensorID)
	if err == nil && latestTemp != nil {
		sensorData.LatestData = &dto.TemperatureReading{
			Timestamp:   latestTemp.Timestamp,
			Temperature: latestTemp.Temperature,
			Humidity:    latestTemp.Humidity,
			HeatIndex:   calculateHeatIndexForArea(latestTemp.Temperature, latestTemp.Humidity),
		}
	}

	return sensorData, nil
}

// calculateAreaStatistics - 計算區域統計數據
func (s *DashboardAreaService) calculateAreaStatistics(areaInfo *dto.AreaInfo) dto.AreaStatistics {
	stats := dto.AreaStatistics{
		TotalMeters:     len(areaInfo.Meters),
		TotalSensors:    len(areaInfo.Sensors),
		TotalACPackages: len(areaInfo.ACPackages),
		TotalVRFs:       len(areaInfo.VRFs),
	}

	// 計算電表統計
	for _, meter := range areaInfo.Meters {
		if meter.LatestData != nil {
			stats.TotalKWh += meter.LatestData.KWh
			stats.TotalKW += meter.LatestData.KW

			if stats.LastUpdatedAt == nil || meter.LatestData.Timestamp.After(*stats.LastUpdatedAt) {
				stats.LastUpdatedAt = &meter.LatestData.Timestamp
			}
		}
	}

	// 計算溫度統計
	if len(areaInfo.Sensors) > 0 {
		var tempSum, humiditySum, heatIndexSum float64
		var minTemp, maxTemp float64
		validCount := 0

		for i, sensor := range areaInfo.Sensors {
			if sensor.LatestData != nil {
				tempSum += sensor.LatestData.Temperature
				humiditySum += sensor.LatestData.Humidity
				heatIndexSum += sensor.LatestData.HeatIndex
				validCount++

				if i == 0 {
					minTemp = sensor.LatestData.Temperature
					maxTemp = sensor.LatestData.Temperature
				} else {
					minTemp = math.Min(minTemp, sensor.LatestData.Temperature)
					maxTemp = math.Max(maxTemp, sensor.LatestData.Temperature)
				}

				if stats.LastUpdatedAt == nil || sensor.LatestData.Timestamp.After(*stats.LastUpdatedAt) {
					stats.LastUpdatedAt = &sensor.LatestData.Timestamp
				}
			}
		}

		if validCount > 0 {
			stats.AvgTemperature = tempSum / float64(validCount)
			stats.AvgHumidity = humiditySum / float64(validCount)
			stats.AvgHeatIndex = heatIndexSum / float64(validCount)
			stats.MinTemperature = minTemp
			stats.MaxTemperature = maxTemp
		}
	}

	// 計算 Package AC 運行中的壓縮機數量
	for _, acPackage := range areaInfo.ACPackages {
		for _, compressor := range acPackage.Compressors {
			if compressor.IsRunning {
				stats.RunningACCount++
			}
		}
	}

	// 計算 VRF 統計
	for _, vrf := range areaInfo.VRFs {
		stats.TotalVRFUnits += len(vrf.ACUnits)
		for _, unit := range vrf.ACUnits {
			if unit.IsRunning {
				stats.RunningVRFUnitCount++
			}
		}
	}

	return stats
}

func calculateHeatIndexForArea(T, RH float64) float64 {
	// 若濕度是小數型（例如 0.58），轉成百分比
	if RH <= 1 {
		RH *= 100
	}

	// 溫度低於 27 時使用簡化公式（讓體感略降，提早關壓縮機）
	if T < 27 {
		return T - 0.3*(RH/100)*(T-20)
	}

	// 高溫使用 Steadman 熱指數公式
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
