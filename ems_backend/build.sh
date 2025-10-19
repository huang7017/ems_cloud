#!/bin/bash

# =============================================
# 編譯 Linux 二進制文件腳本
# 在 Mac 上執行，生成可在 EC2 上運行的二進制文件
# =============================================

set -e

echo "========================================="
echo "開始編譯 EMS Backend (Linux amd64)"
echo "========================================="

# 設置編譯目標
export GOOS=linux
export GOARCH=amd64
export CGO_ENABLED=0

# 編譯
echo "正在編譯..."
go build -o ems_backend_linux -ldflags="-s -w" ./cmd/api/main.go

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 編譯成功！"
    echo ""
    echo "生成的文件: ems_backend_linux"
    echo "文件大小: $(du -h ems_backend_linux | cut -f1)"
    echo ""
    echo "下一步："
    echo "1. 上傳到 EC2:"
    echo "   scp -i your-key.pem ems_backend_linux ubuntu@your-ec2-ip:/home/ubuntu/"
    echo ""
    echo "2. 在 EC2 上執行:"
    echo "   chmod +x ems_backend_linux"
    echo "   ./ems_backend_linux"
    echo ""
else
    echo "❌ 編譯失敗"
    exit 1
fi

