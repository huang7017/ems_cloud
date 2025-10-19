package services

import (
	"ems_backend/internal/domain/temperature/services"
	"fmt"
	"log"
	"time"
)

// TemperatureApplicationService 温度应用服务
// 应用服务层：协调领域服务，处理用例流程
type TemperatureApplicationService struct {
	tempDomainService *services.TemperatureService
}

// NewTemperatureApplicationService 创建温度应用服务
func NewTemperatureApplicationService(tempDomainService *services.TemperatureService) *TemperatureApplicationService {
	return &TemperatureApplicationService{
		tempDomainService: tempDomainService,
	}
}

// SaveTemperatureData 保存温度数据
// 这是一个应用服务方法，协调领域服务完成用例
func (s *TemperatureApplicationService) SaveTemperatureData(
	temperatureID string,
	temperature float64,
	humidity float64,
	timestamp time.Time,
) error {
	// 应用层验证
	if temperatureID == "" {
		return fmt.Errorf("temperature_id is required")
	}

	// 调用领域服务创建温度记录
	tempEntity, err := s.tempDomainService.CreateTemperature(
		temperatureID,
		temperature,
		humidity,
		timestamp,
	)
	if err != nil {
		return fmt.Errorf("failed to create temperature record: %w", err)
	}

	// 应用层的额外逻辑：检查是否异常并记录日志
	if s.tempDomainService.IsTemperatureAbnormal(temperature) {
		log.Printf("⚠️  Abnormal temperature detected: %.2f°C (ID: %s)", temperature, temperatureID)
	}

	if s.tempDomainService.IsHumidityAbnormal(humidity) {
		log.Printf("⚠️  Abnormal humidity detected: %.2f%% (ID: %s)", humidity, temperatureID)
	}

	log.Printf("✅ Temperature record created: ID=%d, TempID=%s", tempEntity.ID, tempEntity.TemperatureID)
	return nil
}
