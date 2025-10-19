# 简单部署指南

## 步骤 1: 在本地编译 Linux 二进制文件

```bash
cd /Users/huangkaiwei/Documents/ems_cloud/ems_backend

# 编译 Linux 版本
chmod +x build.sh
./build.sh
```

会生成 `ems_backend_linux` 文件。

---

## 步骤 2: 上传到 EC2

```bash
# 上传二进制文件
scp -i your-key.pem ems_backend_linux ubuntu@your-ec2-ip:/home/ubuntu/

# 登录 EC2
ssh -i your-key.pem ubuntu@your-ec2-ip
```

---

## 步骤 3: 在 EC2 上设置环境变量

### 方法 A: 使用 .env 文件（推荐）

```bash
# 在 EC2 上创建 .env 文件
cd /home/ubuntu
nano .env
```

填入：
```env
DB_HOST=220.132.191.5
DB_PORT=9432
DB_USER=ems_user
DB_CODE=ji394@ems_user
DB_NAME=ems
PORT=8080
GIN_MODE=release
```

保存后（Ctrl+X, Y, Enter）

### 方法 B: 直接在命令行设置

```bash
export DB_HOST=220.132.191.5
export DB_PORT=9432
export DB_USER=ems_user
export DB_CODE=ji394@ems_user
export DB_NAME=ems
export PORT=8080
export GIN_MODE=release
```

---

## 步骤 4: 运行程序

### 方法 A: 前台运行（测试用）

```bash
chmod +x ems_backend_linux
./ems_backend_linux
```

### 方法 B: 后台运行（推荐）

```bash
# 使用 nohup 后台运行
nohup ./ems_backend_linux > app.log 2>&1 &

# 查看进程
ps aux | grep ems_backend

# 查看日志
tail -f app.log
```

### 方法 C: 使用 screen（推荐）

```bash
# 安装 screen
sudo apt-get install -y screen

# 创建新 session
screen -S ems-backend

# 运行程序
./ems_backend_linux

# 按 Ctrl+A 然后按 D 离开 screen（程序继续运行）

# 重新连接
screen -r ems-backend

# 停止程序
# 在 screen 中按 Ctrl+C
```

---

## 步骤 5: 测试 API

```bash
# 在 EC2 上测试
curl http://localhost:8080/dashboard/companies \
  -H "Authorization: Bearer YOUR_TOKEN"

# 从外部测试（需要开放安全组）
curl http://your-ec2-ip:8080/dashboard/companies \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔥 停止程序

```bash
# 查找进程 ID
ps aux | grep ems_backend_linux

# 停止进程
kill <进程ID>

# 或强制停止
kill -9 <进程ID>
```

---

## 📝 环境变量说明

| 变量名 | 必填 | 说明 | 示例 |
|--------|------|------|------|
| `DB_HOST` | ✅ | 数据库主机 | `220.132.191.5` |
| `DB_PORT` | ✅ | 数据库端口 | `9432` |
| `DB_USER` | ✅ | 数据库用户 | `ems_user` |
| `DB_CODE` | ✅ | 数据库密码 | `ji394@ems_user` |
| `DB_NAME` | ✅ | 数据库名称 | `ems` |
| `PORT` | ❌ | 服务端口（默认 8080） | `8080` |
| `GIN_MODE` | ❌ | 运行模式（默认 release） | `release` 或 `debug` |

---

## 🎯 完整流程示例

```bash
# === 在本地 Mac ===
cd /Users/huangkaiwei/Documents/ems_cloud/ems_backend
./build.sh
scp -i ~/your-key.pem ems_backend_linux ubuntu@3.106.xxx.xxx:/home/ubuntu/

# === 登录 EC2 ===
ssh -i ~/your-key.pem ubuntu@3.106.xxx.xxx

# === 在 EC2 上 ===
cd /home/ubuntu

# 创建 .env
cat > .env << 'EOF'
DB_HOST=220.132.191.5
DB_PORT=9432
DB_USER=ems_user
DB_CODE=ji394@ems_user
DB_NAME=ems
PORT=8080
GIN_MODE=release
EOF

# 载入环境变量
export $(cat .env | xargs)

# 运行
chmod +x ems_backend_linux
nohup ./ems_backend_linux > app.log 2>&1 &

# 查看日志
tail -f app.log
```

就这么简单！🚀

