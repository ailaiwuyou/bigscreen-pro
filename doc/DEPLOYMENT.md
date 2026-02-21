# Big Screen Pro 部署文档

## 目录

1. [环境要求](#环境要求)
2. [开发环境部署](#开发环境部署)
3. [生产环境部署](#生产环境部署)
4. [Docker部署](#docker部署)
5. [CI/CD配置](#cicd配置)
6. [监控与日志](#监控与日志)

## 环境要求

### 基础环境

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- Redis >= 6.0 (可选，用于缓存)
- Nginx >= 1.20 (生产环境)

### 推荐配置

#### 开发环境

- CPU: 2核+
- 内存: 4GB+
- 存储: 20GB+

#### 生产环境

- CPU: 4核+
- 内存: 8GB+
- 存储: 100GB+ SSD
- 带宽: 10Mbps+

## 开发环境部署

### 1. 克隆代码

```bash
git clone https://gitee.com/gaojingbo521/big-screen-backend.git
cd big-screen-backend
```

### 2. 安装依赖

```bash
# 使用pnpm（推荐）
pnpm install

# 或使用npm
npm install

# 或使用yarn
yarn install
```

### 3. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 应用配置
NODE_ENV=development
PORT=3001

# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/bigscreen_dev?schema=public"

# JWT配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# 可选：Redis配置
REDIS_URL=redis://localhost:6379

# 可选：日志配置
LOG_LEVEL=debug
```

### 4. 数据库初始化

```bash
# 生成Prisma客户端
pnpm prisma:generate

# 执行数据库迁移
pnpm prisma:migrate

# 可选：打开Prisma Studio查看数据库
pnpm prisma:studio
```

### 5. 启动开发服务器

```bash
# 开发模式（热重载）
pnpm start:dev

# 或使用npm
npm run start:dev

# 调试模式
pnpm start:debug
```

启动成功后，控制台将显示：
```
✅ 数据库连接成功
🚀 应用已启动: http://localhost:3001
📚 API文档: http://localhost:3001/api-docs
```

### 6. 验证部署

打开浏览器访问：

- **API文档**: http://localhost:3001/api-docs
- **健康检查**: http://localhost:3001/api/v1/health

## 生产环境部署

### 1. 服务器准备

#### 安装Node.js

```bash
# 使用nvm安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# 或使用NodeSource
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
# sudo apt-get install -y nodejs
```

#### 安装PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# 启动PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql -c "CREATE USER bigscreen WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE bigscreen_prod OWNER bigscreen;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bigscreen_prod TO bigscreen;"
```

#### 安装Nginx

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y nginx

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. 代码部署

#### 创建部署目录

```bash
sudo mkdir -p /var/www/bigscreen-backend
cd /var/www/bigscreen-backend

# 设置权限
sudo chown -R $USER:$USER /var/www/bigscreen-backend
```

#### 克隆代码并安装依赖

```bash
# 克隆代码
git clone https://gitee.com/gaojingbo521/big-screen-backend.git .

# 安装生产依赖
pnpm install --production

# 生成Prisma客户端
pnpm prisma:generate
```

### 3. 生产环境配置

创建生产环境配置文件：

```bash
sudo nano /var/www/bigscreen-backend/.env.production
```

```env
# 应用配置
NODE_ENV=production
PORT=3001

# 数据库配置
DATABASE_URL="postgresql://bigscreen:your_password@localhost:5432/bigscreen_prod?schema=public"

# JWT配置
JWT_SECRET=your-very-secret-and-long-random-string-here
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=https://your-domain.com

# 可选：Redis配置
# REDIS_URL=redis://localhost:6379

# 日志配置
LOG_LEVEL=info

# 安全配置
BCRYPT_ROUNDS=12
```

设置文件权限：

```bash
chmod 600 /var/www/bigscreen-backend/.env.production
```

### 4. 数据库迁移

```bash
cd /var/www/bigscreen-backend

# 执行数据库迁移
pnpm prisma:migrate

# 可选：种子数据
# pnpm prisma:seed
```

### 5. 使用PM2管理进程

安装PM2：

```bash
sudo npm install -g pm2
```

创建PM2配置文件：

```bash
sudo nano /var/www/bigscreen-backend/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'bigscreen-backend',
      script: './dist/main.js',
      instances: 'max', // 根据CPU核心数自动设置
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      log_type: 'json',
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 3000,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      kill_timeout: 5000,
      listen_timeout: 8000,
    },
  ],
};
```

创建日志目录：

```bash
mkdir -p /var/www/bigscreen-backend/logs
```

启动应用：

```bash
cd /var/www/bigscreen-backend

# 构建生产版本
pnpm build

# 使用PM2启动
sudo pm2 start ecosystem.config.js --env production

# 保存PM2配置
sudo pm2 save

# 设置开机自启
sudo pm2 startup
```

查看应用状态：

```bash
# 查看状态
sudo pm2 status

# 查看日志
sudo pm2 logs bigscreen-backend

# 重启应用
sudo pm2 restart bigscreen-backend

# 停止应用
sudo pm2 stop bigscreen-backend

# 删除应用
sudo pm2 delete bigscreen-backend
```

### 6. Nginx配置

创建Nginx配置文件：

```bash
sudo nano /etc/nginx/sites-available/bigscreen-backend
```

```nginx
upstream backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

# HTTP -> HTTPS 重定向
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书
    ssl_certificate /path/to/your/fullchain.pem;
    ssl_certificate_key /path/to/your/privkey.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # 日志
    access_log /var/log/nginx/bigscreen-access.log;
    error_log /var/log/nginx/bigscreen-error.log;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self' https:; media-src 'self'; object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';" always;

    # API 代理
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket 支持
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件（可选，用于文件上传）
    location /uploads/ {
        alias /var/www/bigscreen-backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

启用站点配置：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/bigscreen-backend /etc/nginx/sites-enabled/

# 删除默认配置（可选）
# sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 7. 防火墙配置

配置防火墙规则：

```bash
# 安装UFW（如果未安装）
sudo apt-get install -y ufw

# 设置默认规则
sudo