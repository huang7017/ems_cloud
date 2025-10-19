# 服务启动失败排查

## 🔍 查看错误日志

在 EC2 上执行以下命令查看详细错误：

```bash
# 方法 1: 查看应用日志
tail -100 /home/ec2-user/app.log

# 方法 2: 查看错误日志
tail -100 /home/ec2-user/error.log

# 方法 3: 查看 systemd 日志
sudo journalctl -u ems-backend -n 100 --no-pager

# 方法 4: 手动运行程序看错误
cd /home/ec2-user
export $(cat .env | xargs)
./ems_backend_linux
```

---

## 常见错误和解决方案

### 错误 1: 数据库连接失败

```
Failed to connect to database
```

**解决**:
```bash
# 检查 .env 配置
cat .env

# 测试数据库连接
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
```

### 错误 2: 端口被占用

```
bind: address already in use
```

**解决**:
```bash
# 查看端口占用
sudo netstat -tlnp | grep 8080

# 杀死占用进程
sudo kill <进程ID>

# 或更改端口
nano .env
# 修改 PORT=8081
```

### 错误 3: 权限问题

```
Permission denied
```

**解决**:
```bash
# 给二进制文件执行权限
chmod +x /home/ec2-user/ems_backend_linux

# 检查文件所有者
ls -la /home/ec2-user/ems_backend_linux

# 如果需要，修改所有者
sudo chown ec2-user:ec2-user /home/ec2-user/ems_backend_linux
```

### 错误 4: .env 文件格式问题

**正确的 .env 格式**:
```env
DB_HOST=220.132.191.5
DB_PORT=9432
DB_USER=ems_user
DB_CODE=ji394@ems_user
DB_NAME=ems
PORT=8080
GIN_MODE=release
ENABLE_SQS=false
```

**注意**:
- ❌ 不要有空格: `DB_HOST = xxx`
- ✅ 正确格式: `DB_HOST=xxx`
- ❌ 不要加引号（除非密码有特殊字符）
- ✅ 每行一个变量

---

## 🔧 快速诊断步骤

在 EC2 上执行：

```bash
# 1. 停止 service
sudo systemctl stop ems-backend

# 2. 手动运行程序（查看详细错误）
cd /home/ec2-user
export $(cat .env | xargs)
./ems_backend_linux

# 你会看到具体的错误信息
```

看到错误信息后告诉我，我帮你解决！

