# 使用 Systemd Service 部署

## 🎯 完整部署流程

---

## 步骤 1: 在本地编译

```bash
cd /Users/huangkaiwei/Documents/ems_cloud/ems_backend
./build.sh
```

---

## 步骤 2: 上传文件到 EC2

```bash
# 上传需要的文件
scp -i your-key.pem \
    ems_backend_linux \
    ems-backend.service \
    install_service.sh \
    ubuntu@YOUR_EC2_IP:/home/ubuntu/
```

---

## 步骤 3: 在 EC2 上创建 .env 配置

```bash
# SSH 登录 EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# 创建 .env 文件
cat > /home/ubuntu/.env << 'EOF'
DB_HOST=220.132.191.5
DB_PORT=9432
DB_USER=ems_user
DB_CODE=ji394@ems_user
DB_NAME=ems
PORT=8080
GIN_MODE=release
ENABLE_SQS=false
EOF
```

---

## 步骤 4: 安装 Service

```bash
# 给脚本执行权限
chmod +x install_service.sh

# 运行安装脚本
sudo ./install_service.sh
```

---

## 步骤 5: 管理 Service

```bash
# 查看服务状态
sudo systemctl status ems-backend

# 启动服务
sudo systemctl start ems-backend

# 停止服务
sudo systemctl stop ems-backend

# 重启服务
sudo systemctl restart ems-backend

# 查看日志（实时）
sudo journalctl -u ems-backend -f

# 查看应用日志
tail -f /home/ubuntu/app.log
```

---

## 🔧 更改数据库配置

### 方法：编辑 .env 文件然后重启服务

```bash
# 1. 编辑配置
nano /home/ubuntu/.env

# 2. 修改你需要的配置
DB_HOST=new-database-host
DB_CODE=new-password

# 3. 保存退出（Ctrl+X, Y, Enter）

# 4. 重启服务（会自动加载新的 .env）
sudo systemctl restart ems-backend

# 5. 检查是否正常
sudo systemctl status ems-backend
tail -f /home/ubuntu/app.log
```

---

## 🔄 更新程序

```bash
# 1. 在本地重新编译
cd /Users/huangkaiwei/Documents/ems_cloud/ems_backend
./build.sh

# 2. 上传新的二进制文件
scp -i your-key.pem ems_backend_linux ubuntu@YOUR_EC2_IP:/home/ubuntu/

# 3. 在 EC2 上重启服务
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
sudo systemctl restart ems-backend
sudo systemctl status ems-backend
```

---

## 📊 Service 的优势

相比直接运行程序，使用 systemd service 有以下优势：

✅ **自动重启** - 程序崩溃会自动重启  
✅ **开机自启** - EC2 重启后程序自动运行  
✅ **日志管理** - 统一的日志查看方式  
✅ **权限控制** - 更安全的运行方式  
✅ **状态监控** - 方便查看运行状态  

---

## 🎯 完整命令（复制粘贴）

### 在本地 Mac:

```bash
cd /Users/huangkaiwei/Documents/ems_cloud/ems_backend
./build.sh
scp -i ~/your-key.pem ems_backend_linux ems-backend.service install_service.sh ubuntu@YOUR_EC2_IP:/home/ubuntu/
```

### 在 EC2:

```bash
# 创建配置
cat > .env << 'EOF'
DB_HOST=220.132.191.5
DB_PORT=9432
DB_USER=ems_user
DB_CODE=ji394@ems_user
DB_NAME=ems
PORT=8080
GIN_MODE=release
EOF

# 安装 service
chmod +x install_service.sh
sudo ./install_service.sh

# 完成！查看状态
sudo systemctl status ems-backend
tail -f app.log
```

---

## 💡 使用建议

**开发/测试阶段**: 直接运行
```bash
./ems_backend_linux
```

**生产环境**: 使用 systemd service
```bash
sudo systemctl start ems-backend
```

就这么简单！🚀
