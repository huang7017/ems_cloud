package services

import (
	"ems_backend/internal/domain/temperature/entities"
	"ems_backend/internal/domain/temperature/repositories"
	"fmt"
	"time"
)

// TemperatureService 温度领域服务
// 处理温度相关的业务规则和领域逻辑
type TemperatureService struct {
	tempRepo repositories.TemperatureRepository
}

// NewTemperatureService 创建温度领域服务
func NewTemperatureService(tempRepo repositories.TemperatureRepository) *TemperatureService {
	return &TemperatureService{
		tempRepo: tempRepo,
	}
}

// CreateTemperature 创建温度记录
func (s *TemperatureService) CreateTemperature(
	temperatureID string,
	temperature float64,
	humidity float64,
	timestamp time.Time,
) (*entities.Temperature, error) {
	// 创建领域实体
	tempEntity := &entities.Temperature{
		TemperatureID: temperatureID,
		Temperature:   temperature,
		Humidity:      humidity,
		Timestamp:     timestamp,
	}

	// 保存到数据库
	if err := s.tempRepo.Save(tempEntity); err != nil {
		return nil, fmt.Errorf("failed to save temperature: %w", err)
	}

	return tempEntity, nil
}

// validateTemperatureData 验证温度数据的业务规则
func (s *TemperatureService) validateTemperatureData(temperature, humidity float64) error {
	// 温度范围验证 (-50°C ~ 100°C)
	if temperature < -50 || temperature > 100 {
		return fmt.Errorf("temperature out of valid range: %.2f (must be between -50 and 100)", temperature)
	}

	// 湿度范围验证 (0% ~ 100%)
	if humidity < 0 || humidity > 100 {
		return fmt.Errorf("humidity out of valid range: %.2f (must be between 0 and 100)", humidity)
	}

	return nil
}

// IsTemperatureAbnormal 判断温度是否异常
// 这是一个领域业务逻辑
func (s *TemperatureService) IsTemperatureAbnormal(temperature float64) bool {
	// 定义异常温度阈值
	const (
		MinNormalTemp = 15.0
		MaxNormalTemp = 30.0
	)
	return temperature < MinNormalTemp || temperature > MaxNormalTemp
}

// IsHumidityAbnormal 判断湿度是否异常
func (s *TemperatureService) IsHumidityAbnormal(humidity float64) bool {
	// 定义异常湿度阈值
	const (
		MinNormalHumidity = 30.0
		MaxNormalHumidity = 70.0
	)
	return humidity < MinNormalHumidity || humidity > MaxNormalHumidity
}
