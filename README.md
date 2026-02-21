# BigScreen Pro - 企业级大屏可视化工具

BigScreen Pro 是一款面向企业级用户的可视化大屏构建工具，支持实时数据展示、交互式图表、丰富的组件库和模板系统。

## 📁 项目结构

```
code/
├── big-screen-frontend/     # 前端项目 (Vue 3 + TypeScript)
├── big-screen-backend/      # 后端项目 (Node.js + Express)
├── docker-compose.yml       # Docker 编排配置
└── README.md               # 项目说明文档
```

## 🚀 快速开始

### 方式一：使用 Docker Compose（推荐）

1. 启动所有服务：

```bash
cd /root/.openclaw/workspace/code
docker-compose up -d
```

2. 访问服务：
   - 前端: http://localhost
   - 后端 API: http://localhost:3001
   - 后端健康检查: http://localhost:3001/health

3. 停止服务：

```bash
docker-compose down
```

### 方式二：本地开发

#### 前端开发

```bash
cd big-screen-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

#### 后端开发

```bash
cd big-screen-backend

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env

# 配置数据库连接（编辑 .env 文件）
# DATABASE_URL="postgresql://postgres:password@localhost:5432/bigscreen?schema=public"

# 生成 Prisma Client
npm run db:generate

# 执行数据库迁移
npm run db:migrate

# 启动开发服务器
npm run dev

# 启动生产服务器
npm run build
npm start
```

## 📦 技术栈

### 前端

- **框架**: Vue 3 + Composition API
- **语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **UI 组件库**: Element Plus
- **图表库**: ECharts + Vue ECharts
- **HTTP 客户端**: Axios
- **样式**: SCSS

### 后端

- **运行时**: Node.js 18+
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: JWT (jsonwebtoken)
- **安全**: Helmet, CORS, Rate Limiting
- **验证**: express-validator, Zod
- **日志**: Morgan
- **实时通信**: WebSocket (ws)

## 📚 项目文档

- [需求文档](./doc/REQUIREMENTS.md)
- [前端开发指南](./big-screen-frontend/README.md)
- [后端开发指南](./big-screen-backend/README.md)
- [API 文档](./big-screen-backend/docs/API.md)（待完善）

## 🎯 功能特性

### 核心功能

- ✅ 拖拽式可视化编辑器
- ✅ 丰富的图表组件库
- ✅ 多数据源支持
- ✅ 实时数据展示
- ✅ 模板系统
- ✅ 全屏展示模式

### 高级功能

- 🔄 数据联动和钻取
- 📊 复杂交互组件
- 🎨 自定义主题
- 🔐 权限管理
- 🚀 AI 智能推荐
- 📱 移动端适配

## 🔒 安全说明

1. **生产环境部署前**：
   - 修改 JWT 密钥（JWT_SECRET）
   - 配置 HTTPS
   - 设置强密码策略
   - 启用 Rate Limiting

2. **环境变量**：
   - 不要在代码中硬编码敏感信息
   - 使用 .env 文件并添加到 .gitignore
   - 生产环境使用安全的环境变量管理方式

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

[MIT License](./LICENSE)

## 📞 联系我们

- 项目主页：https://github.com/gaojingbo521/big-screen
- 问题反馈：https://github.com/gaojingbo521/big-screen/issues
- 邮箱：support@bigscreen.pro

---

<p align="center">
  Made with ❤️ by BigScreen Pro Team
</p>