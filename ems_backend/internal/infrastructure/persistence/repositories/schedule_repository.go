package repositories

import (
	"ems_backend/internal/domain/schedule/entities"
	"ems_backend/internal/infrastructure/persistence/models"
	"time"

	"gorm.io/gorm"
)

type ScheduleRepositoryImpl struct {
	db *gorm.DB
}

func NewScheduleRepository(db *gorm.DB) *ScheduleRepositoryImpl {
	return &ScheduleRepositoryImpl{db: db}
}

// ============================================
// Schedule CRUD
// ============================================

func (r *ScheduleRepositoryImpl) FindByID(id uint) (*entities.Schedule, error) {
	var model models.ScheduleModel
	if err := r.db.First(&model, id).Error; err != nil {
		return nil, err
	}
	return r.scheduleToEntity(&model), nil
}

func (r *ScheduleRepositoryImpl) FindByScheduleID(scheduleID string) (*entities.Schedule, error) {
	var model models.ScheduleModel
	if err := r.db.Where("schedule_id = ?", scheduleID).First(&model).Error; err != nil {
		return nil, err
	}
	return r.scheduleToEntity(&model), nil
}

func (r *ScheduleRepositoryImpl) FindByCompanyDeviceID(companyDeviceID uint) (*entities.Schedule, error) {
	var model models.ScheduleModel
	if err := r.db.Where("company_device_id = ?", companyDeviceID).First(&model).Error; err != nil {
		return nil, err
	}
	return r.scheduleToEntity(&model), nil
}

func (r *ScheduleRepositoryImpl) FindPending() ([]*entities.Schedule, error) {
	var models []models.ScheduleModel
	if err := r.db.Where("sync_status = ?", entities.SyncStatusPending).Find(&models).Error; err != nil {
		return nil, err
	}
	return r.schedulesToEntities(models), nil
}

func (r *ScheduleRepositoryImpl) Save(schedule *entities.Schedule) error {
	model := r.scheduleToModel(schedule)
	if err := r.db.Create(model).Error; err != nil {
		return err
	}
	schedule.ID = model.ID
	return nil
}

func (r *ScheduleRepositoryImpl) Update(schedule *entities.Schedule) error {
	model := r.scheduleToModel(schedule)
	model.ModifiedAt = time.Now()
	return r.db.Save(model).Error
}

func (r *ScheduleRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&models.ScheduleModel{}, id).Error
}

func (r *ScheduleRepositoryImpl) UpdateSyncStatus(id uint, status string) error {
	updates := map[string]interface{}{
		"sync_status": status,
		"modified_at": time.Now(),
	}
	if status == entities.SyncStatusSynced {
		now := time.Now()
		updates["synced_at"] = &now
	}
	return r.db.Model(&models.ScheduleModel{}).Where("id = ?", id).Updates(updates).Error
}

// ============================================
// DailyRule CRUD
// ============================================

func (r *ScheduleRepositoryImpl) FindDailyRulesByScheduleID(scheduleID uint) ([]*entities.DailyRule, error) {
	var models []models.DailyRuleModel
	if err := r.db.Where("schedule_id = ?", scheduleID).Find(&models).Error; err != nil {
		return nil, err
	}
	return r.dailyRulesToEntities(models), nil
}

func (r *ScheduleRepositoryImpl) SaveDailyRule(rule *entities.DailyRule) error {
	model := r.dailyRuleToModel(rule)
	if err := r.db.Create(model).Error; err != nil {
		return err
	}
	rule.ID = model.ID
	return nil
}

func (r *ScheduleRepositoryImpl) UpdateDailyRule(rule *entities.DailyRule) error {
	model := r.dailyRuleToModel(rule)
	model.UpdatedAt = time.Now()
	return r.db.Save(model).Error
}

func (r *ScheduleRepositoryImpl) DeleteDailyRule(id uint) error {
	return r.db.Delete(&models.DailyRuleModel{}, id).Error
}

func (r *ScheduleRepositoryImpl) DeleteDailyRulesByScheduleID(scheduleID uint) error {
	return r.db.Where("schedule_id = ?", scheduleID).Delete(&models.DailyRuleModel{}).Error
}

// ============================================
// TimePeriod CRUD
// ============================================

func (r *ScheduleRepositoryImpl) FindTimePeriodByDailyRuleID(dailyRuleID uint) (*entities.TimePeriod, error) {
	var model models.TimePeriodModel
	if err := r.db.Where("daily_rule_id = ?", dailyRuleID).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return r.timePeriodToEntity(&model), nil
}

func (r *ScheduleRepositoryImpl) SaveTimePeriod(period *entities.TimePeriod) error {
	model := r.timePeriodToModel(period)
	if err := r.db.Create(model).Error; err != nil {
		return err
	}
	period.ID = model.ID
	return nil
}

func (r *ScheduleRepositoryImpl) UpdateTimePeriod(period *entities.TimePeriod) error {
	model := r.timePeriodToModel(period)
	model.UpdatedAt = time.Now()
	return r.db.Save(model).Error
}

func (r *ScheduleRepositoryImpl) DeleteTimePeriod(id uint) error {
	return r.db.Delete(&models.TimePeriodModel{}, id).Error
}

func (r *ScheduleRepositoryImpl) DeleteTimePeriodsByDailyRuleID(dailyRuleID uint) error {
	return r.db.Where("daily_rule_id = ?", dailyRuleID).Delete(&models.TimePeriodModel{}).Error
}

// ============================================
// Action CRUD
// ============================================

func (r *ScheduleRepositoryImpl) FindActionsByDailyRuleID(dailyRuleID uint) ([]*entities.Action, error) {
	var models []models.ActionModel
	if err := r.db.Where("daily_rule_id = ?", dailyRuleID).Find(&models).Error; err != nil {
		return nil, err
	}
	return r.actionsToEntities(models), nil
}

func (r *ScheduleRepositoryImpl) SaveAction(action *entities.Action) error {
	model := r.actionToModel(action)
	if err := r.db.Create(model).Error; err != nil {
		return err
	}
	action.ID = model.ID
	return nil
}

func (r *ScheduleRepositoryImpl) UpdateAction(action *entities.Action) error {
	model := r.actionToModel(action)
	model.UpdatedAt = time.Now()
	return r.db.Save(model).Error
}

func (r *ScheduleRepositoryImpl) DeleteAction(id uint) error {
	return r.db.Delete(&models.ActionModel{}, id).Error
}

func (r *ScheduleRepositoryImpl) DeleteActionsByDailyRuleID(dailyRuleID uint) error {
	return r.db.Where("daily_rule_id = ?", dailyRuleID).Delete(&models.ActionModel{}).Error
}

// ============================================
// ScheduleException CRUD
// ============================================

func (r *ScheduleRepositoryImpl) FindExceptionsByScheduleID(scheduleID uint) ([]*entities.ScheduleException, error) {
	var models []models.ScheduleExceptionModel
	if err := r.db.Where("schedule_id = ?", scheduleID).Find(&models).Error; err != nil {
		return nil, err
	}
	return r.exceptionsToEntities(models), nil
}

func (r *ScheduleRepositoryImpl) SaveException(exception *entities.ScheduleException) error {
	model := r.exceptionToModel(exception)
	if err := r.db.Create(model).Error; err != nil {
		return err
	}
	exception.ID = model.ID
	return nil
}

func (r *ScheduleRepositoryImpl) DeleteException(id uint) error {
	return r.db.Delete(&models.ScheduleExceptionModel{}, id).Error
}

func (r *ScheduleRepositoryImpl) DeleteExceptionsByScheduleID(scheduleID uint) error {
	return r.db.Where("schedule_id = ?", scheduleID).Delete(&models.ScheduleExceptionModel{}).Error
}

// ============================================
// Full Schedule Operations
// ============================================

func (r *ScheduleRepositoryImpl) FindFullSchedule(companyDeviceID uint) (*entities.ScheduleWithRules, error) {
	// Find schedule
	schedule, err := r.FindByCompanyDeviceID(companyDeviceID)
	if err != nil {
		return nil, err
	}

	result := &entities.ScheduleWithRules{
		Schedule:   schedule,
		DailyRules: make(map[string]*entities.DailyRuleWithDetails),
		Exceptions: []string{},
	}

	// Find daily rules
	dailyRules, err := r.FindDailyRulesByScheduleID(schedule.ID)
	if err != nil {
		return nil, err
	}

	for _, rule := range dailyRules {
		ruleDetails := &entities.DailyRuleWithDetails{
			DailyRule: rule,
		}

		// Find time period
		period, _ := r.FindTimePeriodByDailyRuleID(rule.ID)
		ruleDetails.RunPeriod = period

		// Find actions
		actions, _ := r.FindActionsByDailyRuleID(rule.ID)
		ruleDetails.Actions = actions

		result.DailyRules[rule.DayOfWeek] = ruleDetails
	}

	// Find exceptions
	exceptions, err := r.FindExceptionsByScheduleID(schedule.ID)
	if err != nil {
		return nil, err
	}
	for _, exc := range exceptions {
		result.Exceptions = append(result.Exceptions, exc.Date)
	}

	return result, nil
}

func (r *ScheduleRepositoryImpl) SaveFullSchedule(fullSchedule *entities.ScheduleWithRules) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		txRepo := &ScheduleRepositoryImpl{db: tx}

		// Save or update schedule
		if fullSchedule.Schedule.ID == 0 {
			if err := txRepo.Save(fullSchedule.Schedule); err != nil {
				return err
			}
		} else {
			if err := txRepo.Update(fullSchedule.Schedule); err != nil {
				return err
			}
			// Delete existing rules, periods, actions, exceptions
			existingRules, _ := txRepo.FindDailyRulesByScheduleID(fullSchedule.Schedule.ID)
			for _, rule := range existingRules {
				txRepo.DeleteTimePeriodsByDailyRuleID(rule.ID)
				txRepo.DeleteActionsByDailyRuleID(rule.ID)
			}
			txRepo.DeleteDailyRulesByScheduleID(fullSchedule.Schedule.ID)
			txRepo.DeleteExceptionsByScheduleID(fullSchedule.Schedule.ID)
		}

		// Save daily rules
		for _, ruleDetails := range fullSchedule.DailyRules {
			ruleDetails.DailyRule.ScheduleID = fullSchedule.Schedule.ID
			if err := txRepo.SaveDailyRule(ruleDetails.DailyRule); err != nil {
				return err
			}

			// Save time period
			if ruleDetails.RunPeriod != nil {
				ruleDetails.RunPeriod.DailyRuleID = ruleDetails.DailyRule.ID
				if err := txRepo.SaveTimePeriod(ruleDetails.RunPeriod); err != nil {
					return err
				}
			}

			// Save actions
			for _, action := range ruleDetails.Actions {
				action.DailyRuleID = ruleDetails.DailyRule.ID
				if err := txRepo.SaveAction(action); err != nil {
					return err
				}
			}
		}

		// Save exceptions
		for _, date := range fullSchedule.Exceptions {
			exc := entities.NewScheduleException(fullSchedule.Schedule.ID, date)
			if err := txRepo.SaveException(exc); err != nil {
				return err
			}
		}

		return nil
	})
}

// ============================================
// Mapping functions
// ============================================

func (r *ScheduleRepositoryImpl) scheduleToEntity(model *models.ScheduleModel) *entities.Schedule {
	return &entities.Schedule{
		ID:              model.ID,
		CompanyDeviceID: model.CompanyDeviceID,
		ScheduleID:      model.ScheduleID,
		Command:         model.Command,
		Version:         model.Version,
		SyncStatus:      model.SyncStatus,
		SyncedAt:        model.SyncedAt,
		CreatedBy:       model.CreatedBy,
		CreatedAt:       model.CreatedAt,
		ModifiedBy:      model.ModifiedBy,
		ModifiedAt:      model.ModifiedAt,
	}
}

func (r *ScheduleRepositoryImpl) schedulesToEntities(models []models.ScheduleModel) []*entities.Schedule {
	entities := make([]*entities.Schedule, len(models))
	for i, model := range models {
		entities[i] = r.scheduleToEntity(&model)
	}
	return entities
}

func (r *ScheduleRepositoryImpl) scheduleToModel(entity *entities.Schedule) *models.ScheduleModel {
	return &models.ScheduleModel{
		ID:              entity.ID,
		CompanyDeviceID: entity.CompanyDeviceID,
		ScheduleID:      entity.ScheduleID,
		Command:         entity.Command,
		Version:         entity.Version,
		SyncStatus:      entity.SyncStatus,
		SyncedAt:        entity.SyncedAt,
		CreatedBy:       entity.CreatedBy,
		CreatedAt:       entity.CreatedAt,
		ModifiedBy:      entity.ModifiedBy,
		ModifiedAt:      entity.ModifiedAt,
	}
}

func (r *ScheduleRepositoryImpl) dailyRuleToEntity(model *models.DailyRuleModel) *entities.DailyRule {
	return &entities.DailyRule{
		ID:         model.ID,
		ScheduleID: model.ScheduleID,
		DayOfWeek:  model.DayOfWeek,
		CreatedAt:  model.CreatedAt,
		UpdatedAt:  model.UpdatedAt,
	}
}

func (r *ScheduleRepositoryImpl) dailyRulesToEntities(models []models.DailyRuleModel) []*entities.DailyRule {
	entities := make([]*entities.DailyRule, len(models))
	for i, model := range models {
		entities[i] = r.dailyRuleToEntity(&model)
	}
	return entities
}

func (r *ScheduleRepositoryImpl) dailyRuleToModel(entity *entities.DailyRule) *models.DailyRuleModel {
	return &models.DailyRuleModel{
		ID:         entity.ID,
		ScheduleID: entity.ScheduleID,
		DayOfWeek:  entity.DayOfWeek,
		CreatedAt:  entity.CreatedAt,
		UpdatedAt:  entity.UpdatedAt,
	}
}

func (r *ScheduleRepositoryImpl) timePeriodToEntity(model *models.TimePeriodModel) *entities.TimePeriod {
	return &entities.TimePeriod{
		ID:          model.ID,
		DailyRuleID: model.DailyRuleID,
		Start:       model.Start,
		End:         model.End,
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   model.UpdatedAt,
	}
}

func (r *ScheduleRepositoryImpl) timePeriodToModel(entity *entities.TimePeriod) *models.TimePeriodModel {
	return &models.TimePeriodModel{
		ID:          entity.ID,
		DailyRuleID: entity.DailyRuleID,
		Start:       entity.Start,
		End:         entity.End,
		CreatedAt:   entity.CreatedAt,
		UpdatedAt:   entity.UpdatedAt,
	}
}

func (r *ScheduleRepositoryImpl) actionToEntity(model *models.ActionModel) *entities.Action {
	return &entities.Action{
		ID:          model.ID,
		DailyRuleID: model.DailyRuleID,
		Type:        model.Type,
		Time:        model.Time,
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   model.UpdatedAt,
	}
}

func (r *ScheduleRepositoryImpl) actionsToEntities(models []models.ActionModel) []*entities.Action {
	entities := make([]*entities.Action, len(models))
	for i, model := range models {
		entities[i] = r.actionToEntity(&model)
	}
	return entities
}

func (r *ScheduleRepositoryImpl) actionToModel(entity *entities.Action) *models.ActionModel {
	return &models.ActionModel{
		ID:          entity.ID,
		DailyRuleID: entity.DailyRuleID,
		Type:        entity.Type,
		Time:        entity.Time,
		CreatedAt:   entity.CreatedAt,
		UpdatedAt:   entity.UpdatedAt,
	}
}

func (r *ScheduleRepositoryImpl) exceptionToEntity(model *models.ScheduleExceptionModel) *entities.ScheduleException {
	return &entities.ScheduleException{
		ID:         model.ID,
		ScheduleID: model.ScheduleID,
		Date:       model.Date,
		CreatedAt:  model.CreatedAt,
		UpdatedAt:  model.UpdatedAt,
	}
}

func (r *ScheduleRepositoryImpl) exceptionsToEntities(models []models.ScheduleExceptionModel) []*entities.ScheduleException {
	entities := make([]*entities.ScheduleException, len(models))
	for i, model := range models {
		entities[i] = r.exceptionToEntity(&model)
	}
	return entities
}

func (r *ScheduleRepositoryImpl) exceptionToModel(entity *entities.ScheduleException) *models.ScheduleExceptionModel {
	return &models.ScheduleExceptionModel{
		ID:         entity.ID,
		ScheduleID: entity.ScheduleID,
		Date:       entity.Date,
		CreatedAt:  entity.CreatedAt,
		UpdatedAt:  entity.UpdatedAt,
	}
}
