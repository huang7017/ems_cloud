package services

import (
	"ems_backend/internal/domain/meter/services"
	"fmt"
	"log"
	"time"
)

// MeterApplicationService 电表应用服务
// 应用服务层：协调领域服务，处理用例流程
type MeterApplicationService struct {
	meterDomainService *services.MeterService
}

// NewMeterApplicationService 创建电表应用服务
func NewMeterApplicationService(meterDomainService *services.MeterService) *MeterApplicationService {
	return &MeterApplicationService{
		meterDomainService: meterDomainService,
	}
}

// SaveMeterData 保存电表数据
// 这是一个应用服务方法，协调领域服务完成用例
func (s *MeterApplicationService) SaveMeterData(
	meterID string,
	kWh float64,
	kW float64,
	timestamp time.Time,
) error {
	// 应用层验证
	if meterID == "" {
		return fmt.Errorf("meter_id is required")
	}

	// 调用领域服务创建电表记录
	meterEntity, err := s.meterDomainService.CreateMeter(
		meterID,
		kWh,
		kW,
		timestamp,
	)
	if err != nil {
		return fmt.Errorf("failed to create meter record: %w", err)
	}

	// 应用层的额外逻辑：检查是否异常并记录日志
	if s.meterDomainService.IsPowerAbnormal(kW) {
		log.Printf("⚠️  Abnormal power detected: %.2f kW (Meter ID: %s)", kW, meterID)
	}

	log.Printf("✅ Meter record created: ID=%d, MeterID=%s, kWh=%.2f, kW=%.2f",
		meterEntity.ID, meterEntity.MeterID, meterEntity.KWh, meterEntity.KW)
	return nil
}
