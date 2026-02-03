package services

import (
	"encoding/json"
	"errors"
	"log"
	"time"

	"ems_backend/internal/application/dto"
	companyDeviceEntities "ems_backend/internal/domain/company_device/entities"
	companyDeviceRepos "ems_backend/internal/domain/company_device/repositories"
	deviceRepos "ems_backend/internal/domain/device/repositories"
	"ems_backend/internal/domain/schedule/entities"
	"ems_backend/internal/domain/schedule/repositories"
	"ems_backend/internal/infrastructure/mqtt"

	"github.com/google/uuid"
)

// ScheduleApplicationService - 排程應用服務
type ScheduleApplicationService struct {
	scheduleRepo      repositories.ScheduleRepository
	companyDeviceRepo companyDeviceRepos.CompanyDeviceRepository
	deviceRepo        deviceRepos.DeviceRepository // For getting device SN
	mqttPublisher     *mqtt.SchedulePublisher      // Optional: for syncing to devices
}

// NewScheduleApplicationService - 創建排程應用服務
func NewScheduleApplicationService(
	scheduleRepo repositories.ScheduleRepository,
	companyDeviceRepo companyDeviceRepos.CompanyDeviceRepository,
) *ScheduleApplicationService {
	return &ScheduleApplicationService{
		scheduleRepo:      scheduleRepo,
		companyDeviceRepo: companyDeviceRepo,
	}
}

// SetDeviceRepository - 設置設備倉儲 (可選，用於獲取設備 SN)
func (s *ScheduleApplicationService) SetDeviceRepository(deviceRepo deviceRepos.DeviceRepository) {
	s.deviceRepo = deviceRepo
}

// SetMQTTPublisher - 設置 MQTT 發布者 (可選)
func (s *ScheduleApplicationService) SetMQTTPublisher(publisher *mqtt.SchedulePublisher) {
	s.mqttPublisher = publisher
}

// GetByCompanyDeviceID - 獲取設備排程
func (s *ScheduleApplicationService) GetByCompanyDeviceID(companyDeviceID uint) (*dto.ScheduleResponse, error) {
	fullSchedule, err := s.scheduleRepo.FindFullSchedule(companyDeviceID)
	if err != nil {
		return nil, err
	}
	return dto.ToScheduleResponse(fullSchedule), nil
}

// Create - 創建排程
func (s *ScheduleApplicationService) Create(req *dto.ScheduleRequest, memberID uint) (*dto.ScheduleResponse, error) {
	// Validate company device exists
	companyDevice, err := s.companyDeviceRepo.FindByID(req.CompanyDeviceID)
	if err != nil {
		return nil, errors.New("company device not found")
	}
	if companyDevice == nil {
		return nil, errors.New("company device not found")
	}

	// Check if schedule already exists
	existing, _ := s.scheduleRepo.FindByCompanyDeviceID(req.CompanyDeviceID)
	if existing != nil {
		return nil, errors.New("schedule already exists for this device, use update instead")
	}

	// Convert request to full schedule
	scheduleID := uuid.New().String()
	fullSchedule := dto.RequestToFullSchedule(req, scheduleID, memberID)

	// Save full schedule
	if err := s.scheduleRepo.SaveFullSchedule(fullSchedule); err != nil {
		return nil, err
	}

	// 發送 schedule 命令到設備
	if err := s.SyncToDevice(req.CompanyDeviceID); err != nil {
		log.Printf("[Schedule] Warning: failed to sync to device after create: %v", err)
		// 不返回錯誤，因為已經保存到 DB
	}

	// Return created schedule
	return s.GetByCompanyDeviceID(req.CompanyDeviceID)
}

// Update - 更新排程
func (s *ScheduleApplicationService) Update(companyDeviceID uint, req *dto.ScheduleRequest, memberID uint) (*dto.ScheduleResponse, error) {
	// Validate company device exists
	_, err := s.companyDeviceRepo.FindByID(companyDeviceID)
	if err != nil {
		return nil, errors.New("company device not found")
	}

	// Get existing schedule
	existing, err := s.scheduleRepo.FindByCompanyDeviceID(companyDeviceID)
	if err != nil {
		return nil, errors.New("schedule not found")
	}

	// Convert request to full schedule
	fullSchedule := dto.RequestToFullSchedule(req, existing.ScheduleID, memberID)
	fullSchedule.Schedule.ID = existing.ID
	fullSchedule.Schedule.Version = existing.Version + 1
	fullSchedule.Schedule.SyncStatus = entities.SyncStatusPending
	fullSchedule.Schedule.ModifiedBy = memberID
	fullSchedule.Schedule.ModifiedAt = time.Now()

	// Save full schedule
	if err := s.scheduleRepo.SaveFullSchedule(fullSchedule); err != nil {
		return nil, err
	}

	// 發送 schedule 命令到設備
	if err := s.SyncToDevice(companyDeviceID); err != nil {
		log.Printf("[Schedule] Warning: failed to sync to device after update: %v", err)
		// 不返回錯誤，因為已經保存到 DB
	}

	// Return updated schedule
	return s.GetByCompanyDeviceID(companyDeviceID)
}

// Delete - 刪除排程
func (s *ScheduleApplicationService) Delete(companyDeviceID uint) error {
	// Get existing schedule
	existing, err := s.scheduleRepo.FindByCompanyDeviceID(companyDeviceID)
	if err != nil {
		return errors.New("schedule not found")
	}

	// Delete schedule (cascades to daily_rules, time_periods, actions, exceptions)
	if err := s.scheduleRepo.Delete(existing.ID); err != nil {
		return err
	}

	// Remove from device content
	companyDevice, _ := s.companyDeviceRepo.FindByID(companyDeviceID)
	if companyDevice != nil {
		s.removeScheduleFromDeviceContent(companyDevice)
	}

	return nil
}

// GetPending - 獲取待同步排程
func (s *ScheduleApplicationService) GetPending() ([]*entities.Schedule, error) {
	return s.scheduleRepo.FindPending()
}

// MarkSynced - 標記為已同步
func (s *ScheduleApplicationService) MarkSynced(companyDeviceID uint) error {
	schedule, err := s.scheduleRepo.FindByCompanyDeviceID(companyDeviceID)
	if err != nil {
		return err
	}
	return s.scheduleRepo.UpdateSyncStatus(schedule.ID, entities.SyncStatusSynced)
}

// MarkFailed - 標記為同步失敗
func (s *ScheduleApplicationService) MarkFailed(companyDeviceID uint) error {
	schedule, err := s.scheduleRepo.FindByCompanyDeviceID(companyDeviceID)
	if err != nil {
		return err
	}
	return s.scheduleRepo.UpdateSyncStatus(schedule.ID, entities.SyncStatusFailed)
}

// SyncToDevice - 同步排程到設備 (via MQTT)
func (s *ScheduleApplicationService) SyncToDevice(companyDeviceID uint) error {
	// Get the company device
	companyDevice, err := s.companyDeviceRepo.FindByID(companyDeviceID)
	if err != nil {
		return errors.New("company device not found")
	}

	// Get device serial number from Device table
	if s.deviceRepo == nil {
		return errors.New("device repository not configured")
	}
	device, err := s.deviceRepo.FindByID(companyDevice.DeviceID)
	if err != nil {
		return errors.New("device not found")
	}
	deviceSN := device.SN
	if deviceSN == "" {
		return errors.New("device serial number is not set")
	}

	// Check if MQTT publisher is available
	if s.mqttPublisher == nil {
		return errors.New("MQTT publisher not configured")
	}

	// Get the full schedule (optional - may not exist yet)
	fullSchedule, err := s.scheduleRepo.FindFullSchedule(companyDeviceID)
	if err != nil {
		// No schedule exists, send an empty schedule command
		log.Printf("[Schedule] No schedule found for device %s, sending empty schedule", deviceSN)
		emptyCmd := &mqtt.ScheduleCommand{
			Command:    "schedule",
			Data:       make(map[string]*mqtt.DailyRule),
			Exceptions: []string{},
		}
		if err := s.mqttPublisher.PublishSchedule(deviceSN, emptyCmd); err != nil {
			return err
		}
		log.Printf("[Schedule] Successfully synced empty schedule to device %s", deviceSN)
		return nil
	}

	// Convert to MQTT command format
	mqttCmd := s.buildMQTTCommand(fullSchedule)

	// Publish to device
	if err := s.mqttPublisher.PublishSchedule(deviceSN, mqttCmd); err != nil {
		// Mark as failed
		s.scheduleRepo.UpdateSyncStatus(fullSchedule.Schedule.ID, entities.SyncStatusFailed)
		return err
	}

	// Mark as synced
	s.scheduleRepo.UpdateSyncStatus(fullSchedule.Schedule.ID, entities.SyncStatusSynced)

	// 同步成功後，同步排程到 company_device.content
	s.syncScheduleToDeviceContent(companyDevice, fullSchedule)

	log.Printf("[Schedule] Successfully synced schedule to device %s", deviceSN)
	return nil
}

// QueryDeviceInfo - 查詢設備資訊 (via MQTT)
func (s *ScheduleApplicationService) QueryDeviceInfo(companyDeviceID uint) error {
	// Get the company device
	companyDevice, err := s.companyDeviceRepo.FindByID(companyDeviceID)
	if err != nil {
		return errors.New("company device not found")
	}

	// Get device serial number from Device table
	if s.deviceRepo == nil {
		return errors.New("device repository not configured")
	}
	device, err := s.deviceRepo.FindByID(companyDevice.DeviceID)
	if err != nil {
		return errors.New("device not found")
	}
	deviceSN := device.SN
	if deviceSN == "" {
		return errors.New("device serial number is not set")
	}

	// Check if MQTT publisher is available
	if s.mqttPublisher == nil {
		return errors.New("MQTT publisher not configured")
	}

	// Send deviceInfo command
	if err := s.mqttPublisher.PublishDeviceInfoRequest(deviceSN); err != nil {
		return err
	}

	log.Printf("[Schedule] Sent deviceInfo request to device %s", deviceSN)
	return nil
}

// QueryScheduleFromDevice - 從設備獲取排程 (via MQTT getSchedule command)
func (s *ScheduleApplicationService) QueryScheduleFromDevice(companyDeviceID uint) error {
	// Get the company device
	companyDevice, err := s.companyDeviceRepo.FindByID(companyDeviceID)
	if err != nil {
		return errors.New("company device not found")
	}

	// Get device serial number from Device table
	if s.deviceRepo == nil {
		return errors.New("device repository not configured")
	}
	device, err := s.deviceRepo.FindByID(companyDevice.DeviceID)
	if err != nil {
		return errors.New("device not found")
	}
	deviceSN := device.SN
	if deviceSN == "" {
		return errors.New("device serial number is not set")
	}

	// Check if MQTT publisher is available
	if s.mqttPublisher == nil {
		return errors.New("MQTT publisher not configured")
	}

	// Send getSchedule command
	if err := s.mqttPublisher.PublishGetScheduleRequest(deviceSN); err != nil {
		return err
	}

	log.Printf("[Schedule] Sent getSchedule request to device %s", deviceSN)
	return nil
}

// buildMQTTCommand - 構建 MQTT 命令
func (s *ScheduleApplicationService) buildMQTTCommand(fullSchedule *entities.ScheduleWithRules) *mqtt.ScheduleCommand {
	cmd := &mqtt.ScheduleCommand{
		Command:    "schedule",
		Data:       make(map[string]*mqtt.DailyRule),
		Exceptions: fullSchedule.Exceptions,
	}

	for dayName, ruleDetails := range fullSchedule.DailyRules {
		dailyRule := &mqtt.DailyRule{}

		// Convert time period
		if ruleDetails.RunPeriod != nil {
			dailyRule.RunPeriod = &mqtt.TimePeriod{
				Start: ruleDetails.RunPeriod.Start,
				End:   ruleDetails.RunPeriod.End,
			}
		}

		// Convert actions
		for _, action := range ruleDetails.Actions {
			dailyRule.Actions = append(dailyRule.Actions, &mqtt.Action{
				Type: action.Type,
				Time: action.Time,
			})
		}

		cmd.Data[dayName] = dailyRule
	}

	return cmd
}

// syncScheduleToDeviceContent - 同步排程到設備內容 JSONB
func (s *ScheduleApplicationService) syncScheduleToDeviceContent(companyDevice *companyDeviceEntities.CompanyDevice, fullSchedule *entities.ScheduleWithRules) error {
	// Parse existing content
	content, err := companyDevice.ParseContent()
	if err != nil {
		content = &companyDeviceEntities.DeviceContent{}
	}

	// Build schedule for JSONB (matches ems_vrv format)
	jsonSchedule := &companyDeviceEntities.Schedule{
		ID:         fullSchedule.Schedule.ScheduleID,
		Command:    fullSchedule.Schedule.Command,
		DailyRules: make(map[string]*companyDeviceEntities.DailyRule),
		Exceptions: fullSchedule.Exceptions,
	}

	// Convert daily rules
	for dayName, ruleDetails := range fullSchedule.DailyRules {
		jsonRule := &companyDeviceEntities.DailyRule{
			ID:        ruleDetails.DailyRule.DayOfWeek,
			DayOfWeek: ruleDetails.DailyRule.DayOfWeek,
		}

		// Convert time period
		if ruleDetails.RunPeriod != nil {
			jsonRule.RunPeriod = &companyDeviceEntities.TimePeriod{
				Start: ruleDetails.RunPeriod.Start,
				End:   ruleDetails.RunPeriod.End,
			}
		}

		// Convert actions
		for _, action := range ruleDetails.Actions {
			jsonRule.Actions = append(jsonRule.Actions, companyDeviceEntities.Action{
				Type: action.Type,
				Time: action.Time,
			})
		}

		jsonSchedule.DailyRules[dayName] = jsonRule
	}

	content.Schedule = jsonSchedule
	content.Version++
	content.LastSyncAt = time.Now().Format(time.RFC3339)

	// Marshal and save
	contentJSON, err := json.Marshal(content)
	if err != nil {
		return err
	}
	companyDevice.Content = contentJSON
	companyDevice.ModifyTime = time.Now()

	return s.companyDeviceRepo.Update(companyDevice)
}

// removeScheduleFromDeviceContent - 從設備內容移除排程
func (s *ScheduleApplicationService) removeScheduleFromDeviceContent(companyDevice *companyDeviceEntities.CompanyDevice) error {
	// Parse existing content
	content, err := companyDevice.ParseContent()
	if err != nil {
		return nil
	}

	content.Schedule = nil
	content.Version++
	content.LastSyncAt = time.Now().Format(time.RFC3339)

	// Marshal and save
	contentJSON, err := json.Marshal(content)
	if err != nil {
		return err
	}
	companyDevice.Content = contentJSON
	companyDevice.ModifyTime = time.Now()

	return s.companyDeviceRepo.Update(companyDevice)
}
