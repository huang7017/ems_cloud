-- ============================================
-- Schedule Tables (matches ems_vrv format)
-- ============================================

-- 1. Main schedules table (one per device)
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    company_device_id INTEGER NOT NULL UNIQUE REFERENCES company_device(id) ON DELETE CASCADE,
    schedule_id VARCHAR(64) NOT NULL UNIQUE,
    command VARCHAR(32) DEFAULT 'schedule',
    version INTEGER DEFAULT 1,
    sync_status VARCHAR(32) DEFAULT 'pending',
    synced_at TIMESTAMP,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    modified_by INTEGER NOT NULL,
    modified_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_company_device ON schedules(company_device_id);
CREATE INDEX IF NOT EXISTS idx_schedules_sync_status ON schedules(sync_status);

-- 2. Daily rules table (one per day per schedule)
CREATE TABLE IF NOT EXISTS daily_rules (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    day_of_week VARCHAR(16) NOT NULL, -- Monday, Tuesday, etc.
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(schedule_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_daily_rules_schedule ON daily_rules(schedule_id);

-- 3. Time periods table (one per daily rule - for efficiency mode)
CREATE TABLE IF NOT EXISTS time_periods (
    id SERIAL PRIMARY KEY,
    daily_rule_id INTEGER NOT NULL UNIQUE REFERENCES daily_rules(id) ON DELETE CASCADE,
    start VARCHAR(8) NOT NULL, -- HH:MM format
    "end" VARCHAR(8) NOT NULL, -- HH:MM format
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Actions table (multiple per daily rule)
CREATE TABLE IF NOT EXISTS actions (
    id SERIAL PRIMARY KEY,
    daily_rule_id INTEGER NOT NULL REFERENCES daily_rules(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL, -- closeOnce, skip, forceCloseAfter
    time VARCHAR(8), -- HH:MM format (optional for "skip")
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actions_daily_rule ON actions(daily_rule_id);

-- 5. Schedule exceptions table (dates to skip)
CREATE TABLE IF NOT EXISTS schedule_exceptions (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    date VARCHAR(16) NOT NULL, -- YYYY-MM-DD format
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(schedule_id, date)
);

CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_schedule ON schedule_exceptions(schedule_id);

-- 6. Add comments
COMMENT ON TABLE schedules IS 'Device schedule configuration (one per device)';
COMMENT ON TABLE daily_rules IS 'Per-day schedule rules';
COMMENT ON TABLE time_periods IS 'Efficiency mode run periods';
COMMENT ON TABLE actions IS 'Scheduled actions (closeOnce, skip, forceCloseAfter)';
COMMENT ON TABLE schedule_exceptions IS 'Dates to skip scheduling';

COMMENT ON COLUMN schedules.sync_status IS 'pending, synced, failed';
COMMENT ON COLUMN daily_rules.day_of_week IS 'Monday-Sunday (case-sensitive)';
COMMENT ON COLUMN time_periods.start IS 'HH:MM format (e.g., 08:00)';
COMMENT ON COLUMN time_periods."end" IS 'HH:MM format (e.g., 18:00)';
COMMENT ON COLUMN actions.type IS 'closeOnce=one-time close, skip=skip day, forceCloseAfter=force close after time';
COMMENT ON COLUMN schedule_exceptions.date IS 'YYYY-MM-DD format dates to skip';

-- 7. Verification
SELECT 'Schedule tables created successfully' as status;
