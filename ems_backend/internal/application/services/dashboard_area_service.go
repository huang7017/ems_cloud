package services

import (
	"ems_backend/internal/application/dto"
	companyEntities "ems_backend/internal/domain/company/entities"
	companyRepo "ems_backend/internal/domain/company/repositories"
	deviceRepo "ems_backend/internal/domain/company_device/repositories"
	meterRepo "ems_backend/internal/domain/meter/repositories"
	temperatureRepo "ems_backend/internal/domain/temperature/repositories"
	"errors"
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

// GetAreaOverview - 獲取區域總覽（包含完整的區域解構和統計）
func (s *DashboardAreaService) GetAreaOverview(memberID uint, req *dto.DashboardAreaRequest) (*dto.DashboardAreaResponse, error) {
	// 1. 獲取該成員關聯的所有公司
	companies, err := s.companyRepo.FindByMemberID(memberID)
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
					Statistics: dto.AreaStatistics{},
				}
			}

			areaInfo := areaMap[area.ID]

			// 收集電表數據
			for _, meterMapping := range area.MeterMappings {
				meterData, err := s.getMeterInfo(meterMapping.DeviceMeterID)
				if err == nil {
					areaInfo.Meters = append(areaInfo.Meters, *meterData)
				}
			}

			// 收集溫度感測器數據（從 packages 中獲取）
			sensorIDs := make(map[string]bool)
			for _, pkg := range content.Packages {
				// 檢查該 package 是否屬於此區域
				belongsToArea := false
				for _, acMapping := range area.ACMappings {
					if acMapping.ACID == pkg.ID {
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

					// 收集溫度感測器
					for _, temp := range pkg.Temperatures {
						sensorIDs[temp.SensorID] = true
					}
				}
			}

			// 處理每個溫度感測器
			for sensorID := range sensorIDs {
				sensorData, err := s.getTemperatureSensorInfo(sensorID)
				if err == nil {
					areaInfo.Sensors = append(areaInfo.Sensors, *sensorData)
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

	// 計算運行中的冷氣數量
	for _, acPackage := range areaInfo.ACPackages {
		for _, compressor := range acPackage.Compressors {
			if compressor.IsRunning {
				stats.RunningACCount++
			}
		}
	}

	return stats
}

// calculateHeatIndexForArea - 計算體感溫度（區域服務專用）
// 使用簡化的熱指數公式（直接使用攝氏度）
func calculateHeatIndexForArea(temperature, humidity float64) float64 {
	if temperature < 27 {
		return temperature
	}

	T := temperature
	RH := humidity

	// 使用攝氏度的簡化體感溫度公式
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
