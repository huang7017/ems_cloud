package services

import (
	"ems_backend/internal/application/dto"
	companyEntities "ems_backend/internal/domain/company/entities"
	companyRepo "ems_backend/internal/domain/company/repositories"
	deviceRepo "ems_backend/internal/domain/company_device/repositories"
	meterRepo "ems_backend/internal/domain/meter/repositories"
	"errors"
)

type DashboardApplicationService struct {
	companyRepo       companyRepo.CompanyRepository
	companyDeviceRepo deviceRepo.CompanyDeviceRepository
	meterRepo         meterRepo.MeterRepository
}

func NewDashboardApplicationService(
	companyRepo companyRepo.CompanyRepository,
	companyDeviceRepo deviceRepo.CompanyDeviceRepository,
	meterRepo meterRepo.MeterRepository,
) *DashboardApplicationService {
	return &DashboardApplicationService{
		companyRepo:       companyRepo,
		companyDeviceRepo: companyDeviceRepo,
		meterRepo:         meterRepo,
	}
}

// GetCompanyList - 獲取用戶有權限的公司列表
func (s *DashboardApplicationService) GetCompanyList(memberID uint, req *dto.DashboardCompanyListRequest) (*dto.DashboardCompanyListResponse, error) {
	// 獲取該成員關聯的所有公司
	companies, err := s.companyRepo.FindByMemberID(memberID)
	if err != nil {
		// 返回更詳細的錯誤信息
		return nil, errors.New("failed to find companies for member: " + err.Error())
	}

	response := &dto.DashboardCompanyListResponse{
		Companies: make([]dto.CompanyOption, 0),
	}

	// 如果沒有公司，返回空列表（不是錯誤）
	if len(companies) == 0 {
		return response, nil
	}

	for _, company := range companies {
		response.Companies = append(response.Companies, dto.CompanyOption{
			CompanyID:   company.ID,
			CompanyName: company.Name,
			IsActive:    company.IsActive,
		})
	}

	return response, nil
}

// GetAreaList - 獲取指定公司的區域列表
func (s *DashboardApplicationService) GetAreaList(memberID uint, req *dto.DashboardAreaListRequest) (*dto.DashboardAreaListResponse, error) {
	// 1. 驗證用戶是否有權限訪問該公司
	companies, err := s.companyRepo.FindByMemberID(memberID)
	if err != nil {
		return nil, err
	}

	hasAccess := false
	for _, company := range companies {
		if company.ID == req.CompanyID {
			hasAccess = true
			break
		}
	}

	if !hasAccess {
		return nil, errors.New("access denied: you do not have permission to access this company")
	}

	// 2. 獲取公司設備並解析區域
	devices, err := s.companyDeviceRepo.FindByCompanyID(req.CompanyID)
	if err != nil {
		return nil, err
	}

	response := &dto.DashboardAreaListResponse{
		CompanyID: req.CompanyID,
		Areas:     make([]dto.AreaOption, 0),
	}

	// 使用 map 去重
	areaMap := make(map[string]string) // area_id -> area_name

	for _, device := range devices {
		content, err := device.ParseContent()
		if err != nil {
			continue
		}

		for _, area := range content.Areas {
			areaMap[area.ID] = area.Name
		}
	}

	// 轉換為列表
	for areaID, areaName := range areaMap {
		response.Areas = append(response.Areas, dto.AreaOption{
			AreaID:   areaID,
			AreaName: areaName,
		})
	}

	return response, nil
}

// GetMeterData - 獲取電表數據
func (s *DashboardApplicationService) GetMeterData(memberID uint, req *dto.DashboardMeterRequest) (*dto.DashboardMeterResponse, error) {
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

	response := &dto.DashboardMeterResponse{
		Companies: make([]dto.CompanyMeterInfo, 0, len(companies)),
	}

	// 3. 對每個公司獲取設備和電表數據
	for _, company := range companies {
		companyData, err := s.getCompanyMeterData(company.ID, company.Name, req)
		if err != nil {
			continue // 跳過錯誤的公司
		}
		response.Companies = append(response.Companies, *companyData)
	}

	return response, nil
}

// getCompanyMeterData - 獲取單個公司的電表數據
func (s *DashboardApplicationService) getCompanyMeterData(companyID uint, companyName string, req *dto.DashboardMeterRequest) (*dto.CompanyMeterInfo, error) {
	// 獲取公司設備
	devices, err := s.companyDeviceRepo.FindByCompanyID(companyID)
	if err != nil {
		return nil, err
	}

	companyData := &dto.CompanyMeterInfo{
		CompanyID:   companyID,
		CompanyName: companyName,
		Areas:       make([]dto.AreaMeterInfo, 0),
	}

	// 解析每個設備的內容並獲取電表數據
	for _, device := range devices {
		content, err := device.ParseContent()
		if err != nil {
			continue
		}

		// 處理每個區域
		for _, area := range content.Areas {
			areaData := dto.AreaMeterInfo{
				AreaID:   area.ID,
				AreaName: area.Name,
				Meters:   make([]dto.MeterInfo, 0),
			}

			// 處理該區域的電表
			for _, meterMapping := range area.MeterMappings {
				meterData, err := s.getMeterDataByID(meterMapping.DeviceMeterID, req)
				if err != nil {
					continue
				}
				areaData.Meters = append(areaData.Meters, *meterData)
			}

			if len(areaData.Meters) > 0 {
				companyData.Areas = append(companyData.Areas, areaData)
			}
		}
	}

	return companyData, nil
}

// getMeterDataByID - 根據電表ID獲取電表數據
func (s *DashboardApplicationService) getMeterDataByID(meterID string, req *dto.DashboardMeterRequest) (*dto.MeterInfo, error) {
	meterData := &dto.MeterInfo{
		MeterID: meterID,
	}

	// 獲取最新數據
	latestMeter, err := s.meterRepo.GetLatestByMeterID(meterID)
	if err == nil && latestMeter != nil {
		meterData.LatestData = &dto.MeterReading{
			Timestamp: latestMeter.Timestamp,
			KWh:       latestMeter.KWh,
			KW:        latestMeter.KW,
		}
	}

	// 如果提供了時間範圍，獲取歷史數據
	if req.StartTime != nil && req.EndTime != nil {
		historyMeters, err := s.meterRepo.GetByMeterIDAndTimeRange(meterID, *req.StartTime, *req.EndTime)
		if err == nil && len(historyMeters) > 0 {
			meterData.HistoryData = make([]dto.MeterReading, 0, len(historyMeters))
			for _, meter := range historyMeters {
				meterData.HistoryData = append(meterData.HistoryData, dto.MeterReading{
					Timestamp: meter.Timestamp,
					KWh:       meter.KWh,
					KW:        meter.KW,
				})
			}
		}
	}

	return meterData, nil
}

// GetDashboardSummary - 獲取 Dashboard 總覽
func (s *DashboardApplicationService) GetDashboardSummary(memberID uint, req *dto.DashboardSummaryRequest) (*dto.DashboardSummaryResponse, error) {
	// 獲取該成員關聯的所有公司
	companies, err := s.companyRepo.FindByMemberID(memberID)
	if err != nil {
		// 返回更詳細的錯誤信息
		return nil, errors.New("failed to find companies for member: " + err.Error())
	}

	// 如果用戶沒有關聯任何公司，返回空數據而不是錯誤
	response := &dto.DashboardSummaryResponse{
		TotalCompanies: len(companies),
		TotalDevices:   0,
		Companies:      make([]dto.CompanySummaryInfo, 0),
	}

	// 如果沒有公司，直接返回空結果
	if len(companies) == 0 {
		return response, nil
	}

	// 對每個公司計算總覽數據
	for _, company := range companies {
		devices, err := s.companyDeviceRepo.FindByCompanyID(company.ID)
		if err != nil {
			continue
		}

		response.TotalDevices += len(devices)

		companySummary := dto.CompanySummaryInfo{
			CompanyID:   company.ID,
			CompanyName: company.Name,
			DeviceCount: len(devices),
			TotalKWh:    0,
			TotalKW:     0,
		}

		// 計算所有電表的總計
		var allMeterIDs []string
		for _, device := range devices {
			content, err := device.ParseContent()
			if err != nil {
				continue
			}

			for _, area := range content.Areas {
				for _, meterMapping := range area.MeterMappings {
					allMeterIDs = append(allMeterIDs, meterMapping.DeviceMeterID)
				}
			}
		}

		// 獲取所有電表的最新數據
		if len(allMeterIDs) > 0 {
			for _, meterID := range allMeterIDs {
				latestMeter, err := s.meterRepo.GetLatestByMeterID(meterID)
				if err == nil && latestMeter != nil {
					companySummary.TotalKWh += latestMeter.KWh
					companySummary.TotalKW += latestMeter.KW

					if companySummary.LastUpdatedAt == nil || latestMeter.Timestamp.After(*companySummary.LastUpdatedAt) {
						companySummary.LastUpdatedAt = &latestMeter.Timestamp
					}
				}
			}
		}

		response.Companies = append(response.Companies, companySummary)
	}

	return response, nil
}
