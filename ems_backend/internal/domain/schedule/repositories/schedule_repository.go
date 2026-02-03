package repositories

import (
	"ems_backend/internal/domain/schedule/entities"
)

// ScheduleRepository - 排程倉儲介面
type ScheduleRepository interface {
	// Schedule CRUD
	FindByID(id uint) (*entities.Schedule, error)
	FindByScheduleID(scheduleID string) (*entities.Schedule, error)
	FindByCompanyDeviceID(companyDeviceID uint) (*entities.Schedule, error)
	FindPending() ([]*entities.Schedule, error)
	Save(schedule *entities.Schedule) error
	Update(schedule *entities.Schedule) error
	Delete(id uint) error
	UpdateSyncStatus(id uint, status string) error

	// DailyRule CRUD
	FindDailyRulesByScheduleID(scheduleID uint) ([]*entities.DailyRule, error)
	SaveDailyRule(rule *entities.DailyRule) error
	UpdateDailyRule(rule *entities.DailyRule) error
	DeleteDailyRule(id uint) error
	DeleteDailyRulesByScheduleID(scheduleID uint) error

	// TimePeriod CRUD
	FindTimePeriodByDailyRuleID(dailyRuleID uint) (*entities.TimePeriod, error)
	SaveTimePeriod(period *entities.TimePeriod) error
	UpdateTimePeriod(period *entities.TimePeriod) error
	DeleteTimePeriod(id uint) error
	DeleteTimePeriodsByDailyRuleID(dailyRuleID uint) error

	// Action CRUD
	FindActionsByDailyRuleID(dailyRuleID uint) ([]*entities.Action, error)
	SaveAction(action *entities.Action) error
	UpdateAction(action *entities.Action) error
	DeleteAction(id uint) error
	DeleteActionsByDailyRuleID(dailyRuleID uint) error

	// ScheduleException CRUD
	FindExceptionsByScheduleID(scheduleID uint) ([]*entities.ScheduleException, error)
	SaveException(exception *entities.ScheduleException) error
	DeleteException(id uint) error
	DeleteExceptionsByScheduleID(scheduleID uint) error

	// Full schedule with all relations
	FindFullSchedule(companyDeviceID uint) (*entities.ScheduleWithRules, error)
	SaveFullSchedule(schedule *entities.ScheduleWithRules) error
}
