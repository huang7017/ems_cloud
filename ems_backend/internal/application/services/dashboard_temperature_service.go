package services

import (
	"ems_backend/internal/application/dto"
	companyEntities "ems_backend/internal/domain/company/entities"
	companyRepo "ems_backend/internal/domain/company/repositories"
	deviceRepo "ems_backend/internal/domain/company_device/repositories"
	temperatureRepo "ems_backend/internal/domain/temperature/repositories"
	"errors"
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

// GetTemperatureData - 獲取溫度數據
func (s *DashboardTemperatureService) GetTemperatureData(memberID uint, req *dto.DashboardTemperatureRequest) (*dto.DashboardTemperatureResponse, error) {
	// 1. 獲取該成員關聯的所有公司
	companies, err := s.companyRepo.FindByMemberID(memberID)
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
		// 安全檢查：確保用戶有權限訪問指定的公司
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
			continue // 跳過錯誤的公司
		}
		response.Companies = append(response.Companies, *companyData)
	}

	return response, nil
}

// getCompanyTemperatureData - 獲取單個公司的溫度數據
func (s *DashboardTemperatureService) getCompanyTemperatureData(companyID uint, companyName string, req *dto.DashboardTemperatureRequest) (*dto.CompanyTemperatureInfo, error) {
	// 獲取公司設備
	devices, err := s.companyDeviceRepo.FindByCompanyID(companyID)
	if err != nil {
		return nil, err
	}

	companyData := &dto.CompanyTemperatureInfo{
		CompanyID:   companyID,
		CompanyName: companyName,
		Areas:       make([]dto.AreaTemperatureInfo, 0),
	}

	// 解析每個設備的內容並獲取溫度數據
	for _, device := range devices {
		content, err := device.ParseContent()
		if err != nil {
			continue
		}

		// 處理每個區域
		for _, area := range content.Areas {
			areaData := dto.AreaTemperatureInfo{
				AreaID:   area.ID,
				AreaName: area.Name,
				Sensors:  make([]dto.TemperatureSensorInfo, 0),
			}

			// 收集該區域所有的溫度感測器 ID
			sensorIDs := make(map[string]bool)
			for _, pkg := range content.Packages {
				for _, temp := range pkg.Temperatures {
					sensorIDs[temp.SensorID] = true
				}
			}

			// 處理每個溫度感測器
			for sensorID := range sensorIDs {
				sensorData, err := s.getTemperatureDataBySensorID(sensorID, req)
				if err != nil {
					continue
				}
				areaData.Sensors = append(areaData.Sensors, *sensorData)
			}

			if len(areaData.Sensors) > 0 {
				companyData.Areas = append(companyData.Areas, areaData)
			}
		}
	}

	return companyData, nil
}

// getTemperatureDataBySensorID - 根據感測器ID獲取溫度數據
func (s *DashboardTemperatureService) getTemperatureDataBySensorID(sensorID string, req *dto.DashboardTemperatureRequest) (*dto.TemperatureSensorInfo, error) {
	sensorData := &dto.TemperatureSensorInfo{
		SensorID: sensorID,
	}

	// 獲取最新數據
	latestTemp, err := s.temperatureRepo.GetLatestByTemperatureID(sensorID)
	if err == nil && latestTemp != nil {
		sensorData.LatestData = &dto.TemperatureReading{
			Timestamp:   latestTemp.Timestamp,
			Temperature: latestTemp.Temperature,
			Humidity:    latestTemp.Humidity,
			HeatIndex:   calculateHeatIndex(latestTemp.Temperature, latestTemp.Humidity),
		}
	}

	// 如果提供了時間範圍，獲取歷史數據
	if req.StartTime != nil && req.EndTime != nil {
		historyTemps, err := s.temperatureRepo.GetByTemperatureIDAndTimeRange(sensorID, *req.StartTime, *req.EndTime)
		if err == nil && len(historyTemps) > 0 {
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
	}

	return sensorData, nil
}

// calculateHeatIndex - 計算體感溫度（Heat Index）
// 使用簡化的熱指數公式（直接使用攝氏度）
// temperature: 溫度（攝氏）
// humidity: 相對濕度（百分比，0-100）
// 返回體感溫度（攝氏）
func calculateHeatIndex(temperature, humidity float64) float64 {
	// 如果溫度低於 27°C，體感溫度約等於實際溫度
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
