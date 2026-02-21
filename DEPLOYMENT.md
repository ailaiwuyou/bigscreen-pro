# BigScreen Pro 部署指南

## 环境要求

| 组件 | 最低版本 | 推荐版本 |
|------|----------|----------|
| Node.js | 18.x | 20.x |
| PostgreSQL | 14.x | 16.x |
| Redis | 6.x | 7.x |
| Docker | 20.x | 24.x |
| Docker Compose | 2.x | 2.x |

---

## 部署方式

### 方式一: Docker Compose (推荐)

#### 1. 克隆项目
```bash
git clone https://gitee.com/gaojingbo521/big-screen-frontend.git
git clone https://gitee.com/gaojingbo521/big-screen-backend.git
```

#### 2. 配置环境变量

**后端 (.env)**:
```bash
cd big-screen-backend
cp .env.example .env
# 编辑 .env 文件，设置数据库密码和 JWT 密钥
```

**前端 (.env)**:
```bash
cd big-screen-frontend
# 生产环境配置
VITE_API_BASE_URL=https://your-domain.com/api
```

#### 3. 启动服务
```bash
cd big-screen
docker compose up -d
```

#### 4. 验证服务
```bash
# 检查容器状态
docker compose ps

# 查看日志
docker compose logs -f

# 健康检查
curl http://localhost:3001/health
curl http://localhost/
```

#### 5. 访问服务
- 前端: http://localhost
- 后端 API: http://localhost:3001/api
- 数据库: localhost:5432

---

### 方式二: 手动部署

#### 1. 安装依赖

**后端**:
```bash
cd big-screen-backend
npm install

# 生成 Prisma Client
npm run db:generate

# 执行数据库迁移
npm run db:migrate
```

**前端**:
```bash
cd big-screen-frontend
npm install
```

#### 2. 配置数据库

```bash
# 创建数据库
createdb bigscreen

# 运行迁移
cd big-screen-backend
npm run db:migrate
```

#### 3. 启动后端
```bash
cd big-screen-backend
npm run dev
# 或生产模式
npm run build
npm start
```

#### 4. 构建前端
```bash
cd big-screen-frontend
npm run build
```

#### 5. 配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/bigscreen/dist;
    index index.html;

    # 前端静态资源
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 代理
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## Docker 部署详解

### 目录结构
```
big-screen/
├── docker-compose.yml
├── nginx/
│   └── nginx.conf
├── big-screen-backend/
│   ├── Dockerfile
│   ├── .env
│   └── ...
└── big-screen-frontend/
    ├── Dockerfile
    ├── .env
    └── ...
```

### docker-compose.yml 说明

```yaml
services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your-secure-password
      POSTGRES_DB: bigscreen

  # Redis 缓存
  redis:
    image: redis:7-alpine

  # 后端 API
  backend:
    build: ./big-screen-backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:your-secure-password@postgres:5432/bigscreen

  # 前端 Nginx
  frontend:
    build: ./big-screen-frontend
    ports:
      - "80:80"
```

### 数据持久化

- `postgres_data` - 数据库数据
- `redis_data` - Redis 数据
- `backend_uploads` - 上传文件
- `frontend_logs` - Nginx 日志

---

## 安全配置

### 1. 修改默认密码

```bash
# 数据库密码
POSTGRES_PASSWORD=your-secure-password

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# 加密密钥
ENCRYPTION_KEY=your-encryption-key-32-chars
```

### 2. 配置 HTTPS

使用 Let's Encrypt 免费证书:

```bash
# 安装 certbot
apt install certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run
```

### 3. 防火墙配置

```bash
# 只开放必要端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
```

---

## 监控与日志

### 查看日志
```bash
# 所有服务
docker compose logs -f

# 特定服务
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### 监控
```bash
# 容器资源使用
docker stats

# 容器健康状态
docker compose ps
```

---

## 备份与恢复

### 备份数据库
```bash
docker exec bigscreen-postgres pg_dump -U postgres bigscreen > backup.sql
```

### 恢复数据库
```bash
docker exec -i bigscreen-postgres psql -U postgres bigscreen < backup.sql
```

### 备份文件
```bash
docker run --rm -v bigscreen_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/backup.tar.gz /data
```

---

## 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库是否运行
docker compose ps postgres

# 查看数据库日志
docker compose logs postgres

# 检查连接字符串
echo $DATABASE_URL
```

#### 2. 前端加载空白
```bash
# 检查 Nginx 日志
docker compose logs frontend

# 检查静态文件
ls -la big-screen-frontend/dist/
```

#### 3. API 请求失败
```bash
# 检查后端日志
docker compose logs backend

# 检查后端是否运行
curl http://localhost:3001/health
```

---

## 生产环境检查清单

- [ ] 修改默认数据库密码
- [ ] 修改 JWT 密钥
- [ ] 配置 HTTPS
- [ ] 配置防火墙
- [ ] 设置定时备份
- [ ] 配置日志轮转
- [ ] 启用监控告警

---

## 技术支持

如有问题，请提交 Issue: https://gitee.com/gaojingbo521/big-screen-frontend/issues
