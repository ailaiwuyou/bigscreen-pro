# BigScreen Pro Backend

企业级大屏可视化工具后端 API 服务

## 技术栈

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate Limiting

## 快速开始

### 1. 安装依赖

```bash
cd big-screen-backend
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 执行数据库迁移
npm run db:migrate

# (可选) 添加种子数据
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将启动在 `http://localhost:3001`

### 5. 验证服务

访问健康检查接口：
```bash
curl http://localhost:3001/health
```

## API 文档

### 认证相关 API

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/login | 用户登录 | 否 |
| POST | /api/auth/logout | 用户登出 | 是 |
| POST | /api/auth/refresh | 刷新 Token | 否 |
| GET | /api/auth/me | 获取当前用户信息 | 是 |
| PUT | /api/auth/profile | 更新个人资料 | 是 |
| PUT | /api/auth/password | 修改密码 | 是 |

### 仪表盘相关 API

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/dashboards | 获取仪表盘列表 | 是 |
| POST | /api/dashboards | 创建仪表盘 | 是 |
| GET | /api/dashboards/:id | 获取单个仪表盘 | 是 |
| PUT | /api/dashboards/:id | 更新仪表盘 | 是 |
| DELETE | /api/dashboards/:id | 删除仪表盘 | 是 |
| POST | /api/dashboards/:id/duplicate | 复制仪表盘 | 是 |
| POST | /api/dashboards/:id/publish | 发布仪表盘 | 是 |
| POST | /api/dashboards/:id/archive | 归档仪表盘 | 是 |

### 用户管理 API (管理员)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/users | 获取用户列表 | 管理员 |
| GET | /api/users/:id | 获取单个用户 | 管理员 |
| PUT | /api/users/:id | 更新用户 | 管理员 |
| DELETE | /api/users/:id | 删除用户 | 管理员 |

## 项目结构

```
src/
├── controllers/       # 控制器层
│   ├── authController.ts
│   ├── dashboardController.ts
│   └── userController.ts
├── middleware/        # 中间件
│   ├── authenticate.ts      # JWT 认证
│   ├── errorHandler.ts      # 错误处理
│   ├── notFound.ts          # 404 处理
│   └── validate.ts          # 请求验证
├── routes/           # 路由定义
│   ├── auth.ts
│   ├── dashboard.ts
│   └── user.ts
├── types/            # 类型定义
│   └── express.d.ts
├── utils/            # 工具函数
│   └── logger.ts
├── app.ts            # Express 应用配置
└── server.ts         # 服务器入口
```

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| NODE_ENV | 运行环境 | development |
| PORT | 服务器端口 | 3001 |
| DATABASE_URL | PostgreSQL 连接字符串 | - |
| JWT_SECRET | JWT 密钥 | - |
| JWT_EXPIRES_IN | JWT 过期时间 | 7d |
| FRONTEND_URL | 前端地址 | http://localhost:3000 |
| LOG_LEVEL | 日志级别 | info |

## 开发命令

```bash
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

# 运行测试
npm test
```

## License

MIT