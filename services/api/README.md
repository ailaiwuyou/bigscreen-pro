# BigScreen Pro Backend

企业级数据可视化平台后端服务

## 技术栈

- **Node.js** 20 LTS
- **Express** 4.18+
- **TypeScript** 5.0+
- **Prisma ORM** + PostgreSQL
- **Redis** (缓存 + Session)
- **JWT** (认证)
- **Socket.io** (实时通信)
- **Winston** (日志)
- **Jest** (测试)

## 项目结构

```
new-bigscreen-backend/
├── src/
│   ├── config/           # 配置
│   ├── controllers/      # 控制器
│   ├── services/         # 服务层
│   ├── middleware/       # 中间件
│   ├── routes/           # 路由
│   ├── utils/            # 工具函数
│   ├── types/            # 类型定义
│   └── app.ts            # 应用入口
├── tests/                # 测试
├── prisma/               # 数据库模型
├── docs/                 # 文档
└── docker/               # Docker配置
```

## 快速开始

### 环境要求

- Node.js >= 20.0.0
- PostgreSQL >= 14
- Redis >= 6

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接等信息。

### 数据库迁移

```bash
# 生成迁移文件
npx prisma migrate dev --name init

# 部署迁移
npx prisma migrate deploy

# 生成Prisma Client
npx prisma generate
```

### 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

## API 文档

服务启动后，访问以下地址查看API文档：

- Swagger UI: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/health

## 主要功能

### 1. 用户认证与授权
- JWT Token认证
- 刷新令牌机制
- RBAC权限控制

### 2. 仪表盘管理
- 仪表盘CRUD
- 布局配置
- 主题管理
- 分享功能

### 3. 组件管理
- 多种图表组件
- 组件拖拽布局
- 数据绑定
- 实时更新

### 4. 数据源管理
- 多数据源支持
- 连接池管理
- 查询构建器

### 5. WebSocket实时通信
- 实时数据推送
- 订阅管理

## 测试

```bash
# 运行所有测试
npm test

# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# E2E测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage
```

## Docker 部署

```bash
# 构建镜像
docker build -t bigscreen-backend .

# 运行容器
docker run -p 3000:3000 --env-file .env bigscreen-backend

# 使用 Docker Compose
docker-compose up -d
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)

## 联系方式

- 项目主页: https://github.com/your-org/bigscreen-pro
- 问题反馈: https://github.com/your-org/bigscreen-pro/issues
- 邮箱: support@bigscreen.pro

---

Made with ❤️ by BigScreen Team
