#!/bin/bash

# =============================================
# EMS Backend 啟動腳本（用於 EC2）
# =============================================

# 載入環境變數
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✓ 環境變數已載入"
else
    echo "⚠️  警告: .env 文件不存在，使用默認配置"
fi

# 設置默認值
export PORT=${PORT:-8080}
export GIN_MODE=${GIN_MODE:-release}

echo "========================================="
echo "EMS Backend 啟動中..."
echo "========================================="
echo "Port: $PORT"
echo "Mode: $GIN_MODE"
echo "DB Host: $DB_HOST"
echo "========================================="

# 啟動應用
./ems_backend_linux

