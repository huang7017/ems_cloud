# EC2 环境变量配置指南

## 🔧 在 EC2 上更改数据库连接信息

---

## 方法 1: 使用 .env 文件（最推荐）✅

### 步骤 1: 创建 .env 文件

```bash
# 在 EC2 上，进入程序目录
cd /home/ubuntu

# 创建 .env 文件
nano .env
```

### 步骤 2: 填入配置

```env
# 数据库配置
DB_HOST=220.132.191.5
DB_PORT=9432
DB_USER=ems_user
DB_CODE=ji394@ems_user
DB_NAME=ems

# 服务器配置
PORT=8080
GIN_MODE=release

# AWS SQS（如果需要）
ENABLE_SQS=true
AWS_REGION=ap-southeast-2
```

保存：按 `Ctrl+X`，然后 `Y`，然后 `Enter`

### 步骤 3: 使用环境变量运行

```bash
# 加载 .env 并运行
export $(cat .env | xargs) && ./ems_backend_linux

# 或使用 start.sh（会自动加载 .env）
chmod +x start.sh
./start.sh
```

---

## 方法 2: 直接在命令行设置

```bash
# 一次性设置所有环境变量
export DB_HOST=220.132.191.5
export DB_PORT=9432
export DB_USER=ems_user
export DB_CODE=ji394@ems_user
export DB_NAME=ems
export PORT=8080
export GIN_MODE=release

# 然后运行
./ems_backend_linux
```

**注意**: 这种方法在退出 SSH 后会失效。

---

## 方法 3: 在启动命令中直接指定

```bash
DB_HOST=220.132.191.5 \
DB_PORT=9432 \
DB_USER=ems_user \
DB_CODE=ji394@ems_user \
DB_NAME=ems \
PORT=8080 \
GIN_MODE=release \
./ems_backend_linux
```

---

## 🔄 如何更改配置

### 如果使用 .env 文件：

```bash
# 1. 编辑 .env
nano .env

# 2. 修改你需要的配置（例如改数据库密码）
DB_CODE=new_password

# 3. 保存并退出（Ctrl+X, Y, Enter）

# 4. 停止程序
pkill ems_backend_linux

# 5. 重新运行
export $(cat .env | xargs) && nohup ./ems_backend_linux > app.log 2>&1 &
```

### 如果使用命令行：

```bash
# 1. 停止程序
pkill ems_backend_linux

# 2. 重新设置环境变量
export DB_CODE=new_password

# 3. 重新运行
./ems_backend_linux
```

---

## 📋 完整的启动脚本示例

创建一个启动脚本 `run.sh`：

```bash
nano run.sh
```

内容：

```bash
#!/bin/bash

# 停止旧进程
pkill ems_backend_linux

# 加载环境变量
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✓ 环境变量已加载"
else
    echo "⚠️ .env 文件不存在！"
    exit 1
fi

# 后台运行
nohup ./ems_backend_linux > app.log 2>&1 &

# 显示进程
sleep 1
ps aux | grep ems_backend_linux | grep -v grep

echo "✅ 服务已启动"
echo "查看日志: tail -f app.log"
```

使用：

```bash
chmod +x run.sh
./run.sh
```

---

## 🎯 推荐的完整流程

```bash
# 1. 上传文件到 EC2（在本地执行）
scp -i your-key.pem ems_backend_linux start.sh ubuntu@YOUR_EC2_IP:/home/ubuntu/

# 2. 登录 EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# 3. 创建配置文件
cat > .env << 'EOF'
DB_HOST=220.132.191.5
DB_PORT=9432
DB_USER=ems_user
DB_CODE=ji394@ems_user
DB_NAME=ems
PORT=8080
GIN_MODE=release
EOF

# 4. 运行
chmod +x ems_backend_linux start.sh
./start.sh

# 5. 查看日志
tail -f app.log
```

---

## ❓ 常见问题

### Q: 如何查看当前的环境变量？

```bash
# 查看所有环境变量
env | grep DB

# 查看特定变量
echo $DB_HOST
```

### Q: 如何永久设置环境变量？

```bash
# 编辑 ~/.bashrc
nano ~/.bashrc

# 添加到文件末尾
export DB_HOST=220.132.191.5
export DB_PORT=9432
# ... 其他变量

# 重新加载
source ~/.bashrc
```

### Q: 程序启动后如何更改配置？

```bash
# 1. 编辑 .env
nano .env

# 2. 重启程序
pkill ems_backend_linux
export $(cat .env | xargs) && nohup ./ems_backend_linux > app.log 2>&1 &
```

### Q: 如何确认环境变量已生效？

在 `cmd/api/main.go` 的 `setupEnvironment()` 函数中，环境变量已经有默认值：

```go
if os.Getenv("DB_HOST") == "" {
    os.Setenv("DB_HOST", "220.132.191.5")  // 默认值
}
```

所以即使不设置环境变量，程序也会使用代码中的默认值。

**如果要覆盖默认值**，在运行前设置环境变量即可。

---

## 🎯 最简单的方式

直接在 EC2 上运行：

```bash
# 使用默认配置运行（使用代码中的默认值）
./ems_backend_linux

# 或指定环境变量运行
DB_HOST=your-db-host PORT=8080 ./ems_backend_linux
```

就这么简单！🚀

