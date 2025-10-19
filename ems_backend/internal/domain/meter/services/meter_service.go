package services

import (
	"ems_backend/internal/domain/meter/entities"
	"ems_backend/internal/domain/meter/repositories"
	"fmt"
	"time"
)

// MeterService 电表领域服务
// 处理电表相关的业务规则和领域逻辑
type MeterService struct {
	meterRepo repositories.MeterRepository
}

// NewMeterService 创建电表领域服务
func NewMeterService(meterRepo repositories.MeterRepository) *MeterService {
	return &MeterService{
		meterRepo: meterRepo,
	}
}

// CreateMeter 创建电表记录
func (s *MeterService) CreateMeter(
	meterID string,
	kWh float64,
	kW float64,
	timestamp time.Time,
) (*entities.Meter, error) {
	// 领域业务规则验证
	if err := s.validateMeterData(kWh, kW); err != nil {
		return nil, err
	}

	// 创建领域实体
	// 允许同一个 meterID 有多条记录（时序数据）
	meterEntity := &entities.Meter{
		MeterID:   meterID,
		KWh:       kWh,
		KW:        kW,
		Timestamp: timestamp,
	}

	// 保存到数据库
	if err := s.meterRepo.Save(meterEntity); err != nil {
		return nil, fmt.Errorf("failed to save meter: %w", err)
	}

	return meterEntity, nil
}

// validateMeterData 验证电表数据的业务规则
func (s *MeterService) validateMeterData(kWh, kW float64) error {
	// 电能累计值验证 (必须非负)
	if kWh < 0 {
		return fmt.Errorf("kWh must be non-negative: %.2f", kWh)
	}

	// 功率值验证 (必须非负)
	if kW < 0 {
		return fmt.Errorf("kW must be non-negative: %.2f", kW)
	}

	// 合理性验证：功率不应该超过某个极限值（例如 1000 kW）
	if kW > 1000 {
		return fmt.Errorf("kW value seems abnormal: %.2f (exceeds 1000 kW)", kW)
	}

	return nil
}

// IsPowerAbnormal 判断功率是否异常
// 这是一个领域业务逻辑
func (s *MeterService) IsPowerAbnormal(kW float64) bool {
	// 定义异常功率阈值（例如超过 500 kW 认为异常）
	const MaxNormalPower = 500.0
	return kW > MaxNormalPower
}

// CalculateEnergyConsumption 计算能耗（示例领域逻辑）
func (s *MeterService) CalculateEnergyConsumption(previousKWh, currentKWh float64) float64 {
	if currentKWh < previousKWh {
		// 电表可能被重置
		return currentKWh
	}
	return currentKWh - previousKWh
}
