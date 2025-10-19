-- 创建 meter 表
-- 用于存储电表数据

CREATE TABLE IF NOT EXISTS meter (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    meter_id VARCHAR(255) NOT NULL,
    k_wh DOUBLE PRECISION NOT NULL,
    k_w DOUBLE PRECISION NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_meter_id UNIQUE (meter_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_meter_meter_id ON meter(meter_id);
CREATE INDEX IF NOT EXISTS idx_meter_timestamp ON meter(timestamp);
CREATE INDEX IF NOT EXISTS idx_meter_create_time ON meter(create_time);

-- 添加注释
COMMENT ON TABLE meter IS '电表数据表';
COMMENT ON COLUMN meter.id IS '主键ID';
COMMENT ON COLUMN meter.timestamp IS '数据时间戳';
COMMENT ON COLUMN meter.meter_id IS '电表ID（唯一标识）';
COMMENT ON COLUMN meter.k_wh IS '电能累计值（千瓦时）';
COMMENT ON COLUMN meter.k_w IS '功率（千瓦）';
COMMENT ON COLUMN meter.create_time IS '记录创建时间';

