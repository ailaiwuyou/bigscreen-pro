# BigScreen Unified - 大屏可视化平台

企业级数据可视化平台，采用现代化技术栈构建。

## 🏗 项目结构

```
bigscreen-unified/
├── apps/
│   ├── web/              # 主应用（可视化编辑器）
│   ├── admin/            # 管理后台
│   └── viewer/           # 大屏展示器
├── packages/
│   ├── core/             # 核心组件库
│   ├── ui/               # UI 组件库
│   ├── utils/            # 工具函数
│   ├── types/            # 共享类型
│   └── constants/        # 常量定义
└── services/
    └── api/              # 后端 API 服务
```

## 🚀 快速开始

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 14

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动所有服务
pnpm dev

# 只启动前端
pnpm dev:web

# 只启动后端
pnpm dev:api
```

### 数据库设置

```bash
# 生成 Prisma 客户端
pnpm db:generate

# 运行迁移
pnpm db:migrate

# 打开 Prisma Studio
pnpm db:studio
```

## 📝 文档

- [开发指南](./docs/DEVELOPMENT.md)
- [API 文档](./docs/API.md)
- [数据库设计](./docs/DATABASE.md)

## 🤝 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

[MIT](LICENSE) © BigScreen Team