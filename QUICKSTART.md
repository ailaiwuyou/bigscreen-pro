# BigScreen Pro - 快速启动指南

## 🎯 5 分钟快速启动

### 方式一：使用 Docker Compose（推荐）

```bash
# 1. 进入项目目录
cd /root/.openclaw/workspace/code

# 2. 启动所有服务
docker-compose up -d

# 3. 等待服务启动（约 30 秒）
sleep 30

# 4. 检查服务状态
curl http://localhost:3001/health
```

**访问地址：**
- 🌐 前端: http://localhost
- 🔌 后端 API: http://localhost:3001
- 📊 API 文档: http://localhost:3001/health

### 方式二：本地开发环境

#### 1. 启动后端服务

```bash
cd big-screen-backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接

# 初始化数据库
npm run db:generate
npm run db:migrate

# 启动开发服务器
npm run dev
```

后端服务将运行在 `http://localhost:3001`

#### 2. 启动前端服务

```bash
cd big-screen-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将运行在 `http://localhost:3000`

---

## 📂 项目结构

```
code/
├── big-screen-frontend/          # 前端项目
│   ├── src/
│   │   ├── api/                  # API 接口
│   │   ├── components/           # 公共组件
│   │   ├── router/               # 路由配置
│   │   ├── stores/               # Pinia 状态管理
│   │   ├── styles/               # 样式文件
│   │   ├── types/                # TypeScript 类型
│   │   ├── utils/                # 工具函数
│   │   └── views/                # 页面组件
│   ├── package.json
│   └── vite.config.ts
│
├── big-screen-backend/           # 后端项目
│   ├── src/
│   │   ├── controllers/          # 控制器
│   │   ├── middleware/           # 中间件
│   │   ├── routes/               # 路由定义
│   │   ├── types/                # 类型定义
│   │   ├── utils/                # 工具函数
│   │   ├── app.ts                # Express 应用配置
│   │   └── server.ts             # 服务器入口
│   ├── prisma/
│   │   └── schema.prisma         # 数据库模型
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml            # Docker 编排配置
├── README.md                     # 项目文档
└── QUICKSTART.md                 # 本文件
```

---

## 🛠 常用命令

### 后端命令

```bash
cd big-screen-backend

# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start

# 数据库迁移
npm run db:migrate

# 生成 Prisma Client
npm run db:generate

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

### 前端命令

```bash
cd big-screen-frontend

# 开发模式
npm run dev

# 构建
npm run build

# 预览生产版本
npm run preview

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

### Docker 命令

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重建镜像
docker-compose up -d --build

# 查看服务状态
docker-compose ps
```

---

## 📚 API 文档

### 认证相关

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 用户登出 |
| POST | /api/auth/refresh | 刷新 Token |
| GET | /api/auth/me | 获取当前用户信息 |
| PUT | /api/auth/profile | 更新个人资料 |
| PUT | /api/auth/password | 修改密码 |

### 仪表盘相关

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/dashboards | 获取仪表盘列表 |
| POST | /api/dashboards | 创建仪表盘 |
| GET | /api/dashboards/:id | 获取单个仪表盘 |
| PUT | /api/dashboards/:id | 更新仪表盘 |
| DELETE | /api/dashboards/:id | 删除仪表盘 |
| POST | /api/dashboards/:id/duplicate | 复制仪表盘 |
| POST | /api/dashboards/:id/publish | 发布仪表盘 |
| POST | /api/dashboards/:id/archive | 归档仪表盘 |

### 用户管理（管理员）

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/users | 获取用户列表 |
| GET | /api/users/:id | 获取单个用户 |
| PUT | /api/users/:id | 更新用户 |
| DELETE | /api/users/:id | 删除用户 |

---

## 🔧 开发注意事项

### 环境变量

确保正确配置以下环境变量：

```env
# 必需
DATABASE_URL="postgresql://user:password@localhost:5432/bigscreen?schema=public"
JWT_SECRET="your-super-secret-jwt-key"

# 可选
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 数据库迁移

修改 `prisma/schema.prisma` 后，执行：

```bash
# 生成迁移文件
npx prisma migrate dev --name your_migration_name

# 部署迁移到生产环境
npx prisma migrate deploy
```

### 代码规范

- 使用 TypeScript 严格模式
- 所有 API 响应遵循统一格式 `{ success: boolean, message: string, data?: any }`
- 使用 async/await 处理异步操作
- 统一错误处理，使用 AppError 类

---

## 🆘 常见问题

### 1. 数据库连接失败

检查 PostgreSQL 服务是否运行：
```bash
# Linux/macOS
sudo service postgresql status

# Windows
sc query postgresql
```

### 2. JWT 验证失败

确保设置了正确的 `JWT_SECRET` 环境变量。

### 3. CORS 错误

检查 `FRONTEND_URL` 是否配置正确，确保与前端地址匹配。

### 4. Prisma Client 找不到

运行生成命令：
```bash
npm run db:generate
```

---

## 📞 支持

如有问题，请通过以下方式联系：

- GitHub Issues: https://github.com/gaojingbo521/big-screen/issues
- Email: support@bigscreen.pro

---

**Happy Coding! 🚀**