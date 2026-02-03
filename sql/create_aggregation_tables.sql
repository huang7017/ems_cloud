-- ============================================
-- Data Aggregation Tables for Efficient Querying
-- ============================================

-- 1. Temperature Hourly Aggregation
CREATE TABLE IF NOT EXISTS temperature_hourly (
    id SERIAL PRIMARY KEY,
    temperature_id VARCHAR(64) NOT NULL,
    hour_start TIMESTAMP NOT NULL,
    avg_temperature FLOAT,
    min_temperature FLOAT,
    max_temperature FLOAT,
    avg_humidity FLOAT,
    min_humidity FLOAT,
    max_humidity FLOAT,
    sample_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(temperature_id, hour_start)
);

CREATE INDEX IF NOT EXISTS idx_temp_hourly_id ON temperature_hourly(temperature_id);
CREATE INDEX IF NOT EXISTS idx_temp_hourly_time ON temperature_hourly(hour_start);
CREATE INDEX IF NOT EXISTS idx_temp_hourly_id_time ON temperature_hourly(temperature_id, hour_start);

-- 2. Temperature Daily Aggregation
CREATE TABLE IF NOT EXISTS temperature_daily (
    id SERIAL PRIMARY KEY,
    temperature_id VARCHAR(64) NOT NULL,
    date DATE NOT NULL,
    avg_temperature FLOAT,
    min_temperature FLOAT,
    max_temperature FLOAT,
    avg_humidity FLOAT,
    min_humidity FLOAT,
    max_humidity FLOAT,
    total_samples INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(temperature_id, date)
);

CREATE INDEX IF NOT EXISTS idx_temp_daily_id ON temperature_daily(temperature_id);
CREATE INDEX IF NOT EXISTS idx_temp_daily_date ON temperature_daily(date);
CREATE INDEX IF NOT EXISTS idx_temp_daily_id_date ON temperature_daily(temperature_id, date);

-- 3. Meter Hourly Aggregation
CREATE TABLE IF NOT EXISTS meter_hourly (
    id SERIAL PRIMARY KEY,
    meter_id VARCHAR(64) NOT NULL,
    hour_start TIMESTAMP NOT NULL,
    start_kwh FLOAT,
    end_kwh FLOAT,
    consumption_kwh FLOAT,
    avg_kw FLOAT,
    min_kw FLOAT,
    max_kw FLOAT,
    sample_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(meter_id, hour_start)
);

CREATE INDEX IF NOT EXISTS idx_meter_hourly_id ON meter_hourly(meter_id);
CREATE INDEX IF NOT EXISTS idx_meter_hourly_time ON meter_hourly(hour_start);
CREATE INDEX IF NOT EXISTS idx_meter_hourly_id_time ON meter_hourly(meter_id, hour_start);

-- 4. Meter Daily Aggregation
CREATE TABLE IF NOT EXISTS meter_daily (
    id SERIAL PRIMARY KEY,
    meter_id VARCHAR(64) NOT NULL,
    date DATE NOT NULL,
    start_kwh FLOAT,
    end_kwh FLOAT,
    consumption_kwh FLOAT,
    avg_kw FLOAT,
    min_kw FLOAT,
    max_kw FLOAT,
    total_samples INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(meter_id, date)
);

CREATE INDEX IF NOT EXISTS idx_meter_daily_id ON meter_daily(meter_id);
CREATE INDEX IF NOT EXISTS idx_meter_daily_date ON meter_daily(date);
CREATE INDEX IF NOT EXISTS idx_meter_daily_id_date ON meter_daily(meter_id, date);

-- 5. Device Status History (for compressor runtime, error tracking)
CREATE TABLE IF NOT EXISTS device_status_history (
    id SERIAL PRIMARY KEY,
    company_device_id INTEGER NOT NULL,
    device_type VARCHAR(32) NOT NULL,
    device_id VARCHAR(64) NOT NULL,
    status_type VARCHAR(32) NOT NULL,  -- run_status, error_status, mode_change
    old_value VARCHAR(128),
    new_value VARCHAR(128),
    metadata JSONB,
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_status_company ON device_status_history(company_device_id);
CREATE INDEX IF NOT EXISTS idx_device_status_device ON device_status_history(device_type, device_id);
CREATE INDEX IF NOT EXISTS idx_device_status_time ON device_status_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_device_status_type ON device_status_history(status_type);

-- 6. Comments
COMMENT ON TABLE temperature_hourly IS 'Hourly aggregated temperature data';
COMMENT ON TABLE temperature_daily IS 'Daily aggregated temperature data';
COMMENT ON TABLE meter_hourly IS 'Hourly aggregated meter data with consumption';
COMMENT ON TABLE meter_daily IS 'Daily aggregated meter data with consumption';
COMMENT ON TABLE device_status_history IS 'Device status change history for monitoring';

-- 7. Verification
SELECT 'Aggregation tables created successfully' as status;
