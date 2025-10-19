#!/bin/bash

# =============================================
# 安装 systemd service 脚本
# 在 EC2 上执行
# =============================================

set -e

echo "========================================="
echo "安装 EMS Backend Service"
echo "========================================="

# 检查 .env 文件是否存在
if [ ! -f "/home/ec2-user/.env" ]; then
    echo "❌ 错误: /home/ec2-user/.env 不存在！"
    echo ""
    echo "请先创建 .env 文件："
    echo "  nano /home/ec2-user/.env"
    exit 1
fi

# 检查二进制文件是否存在
if [ ! -f "/home/ec2-user/ems_backend_linux" ]; then
    echo "❌ 错误: /home/ec2-user/ems_backend_linux 不存在！"
    exit 1
fi

# 确保二进制文件有执行权限
chmod +x /home/ec2-user/ems_backend_linux

# 复制 service 文件到 systemd 目录
echo "复制 service 文件..."
sudo cp ems-backend.service /etc/systemd/system/

# 重新加载 systemd
echo "重新加载 systemd..."
sudo systemctl daemon-reload

# 启动服务
echo "启动服务..."
sudo systemctl start ems-backend

# 设置开机自启
echo "设置开机自启..."
sudo systemctl enable ems-backend

# 显示状态
echo ""
echo "========================================="
echo "✅ Service 安装完成！"
echo "========================================="
echo ""

# 显示服务状态
sudo systemctl status ems-backend --no-pager

echo ""
echo "常用命令："
echo "  sudo systemctl start ems-backend    # 启动"
echo "  sudo systemctl stop ems-backend     # 停止"
echo "  sudo systemctl restart ems-backend  # 重启"
echo "  sudo systemctl status ems-backend   # 查看状态"
echo "  sudo journalctl -u ems-backend -f   # 查看系统日志"
echo "  tail -f /home/ec2-user/app.log      # 查看应用日志"
echo ""
