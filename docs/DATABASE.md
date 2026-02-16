# BigScreen Pro - 数据库设计文档

## 1. 数据库架构

### 1.1 技术选型

| 组件 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 主数据库 | PostgreSQL | 14+ | 关系型数据存储 |
| 缓存 | Redis | 7.x | 会话、热点数据缓存 |
| 搜索 | Elasticsearch | 8.x | 全文搜索 (可选) |
| 时序 | InfluxDB/TimescaleDB | 2.x | 时序数据 (可选) |

### 1.2 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                        数据库架构层                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    主库 (Master)                          │   │
│  │                  PostgreSQL 14+                         │   │
│  │                                                         │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐ │   │
│  │  │   User DB     │  │  Screen DB    │  │  System DB  │ │   │
│  │  │  (用户数据)   │  │  (大屏数据)   │  │ (系统数据)  │ │   │
│  │  └───────────────┘  └───────────────┘  └─────────────┘ │   │
│  │                                                         │   │
│  │  Features:                                              │   │
│  │  - 读写分离                                             │   │
│  │  - 自动备份                                             │   │
│  │  - 主从复制                                             │   │
│  │  - 连接池                                               │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    从库 (Replica)                         │   │
│  │                  PostgreSQL 14+                         │   │
│  │                                                         │   │
│  │  - 只读查询                                             │   │
│  │  - 报表统计                                             │   │
│  │  - 数据备份                                             │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    缓存层 (Redis)                         │   │
│  │                    Redis Cluster 7.x                     │   │
│  │                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   Session   │  │    Cache    │  │    Lock     │     │   │
│  │  │  (会话)     │  │   (缓存)    │  │   (锁)      │     │   │
│  │  │             │  │             │  │             │     │   │
│  │  │ • JWT Black │  │ • 热点数据  │  │ • 分布式锁  │     │   │
│  │  │ • Refresh   │  │ • API结果 │  │ • 限流计数  │     │   │
│  │  │ • Session   │  │ • Config    │  │ • 幂等控制  │     │   │
│  │  │             │  │             │  │             │     │   │
│  │  │ TTL: 7d     │  │ TTL: 1h     │  │ TTL: 30s    │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              搜索引擎 (Elasticsearch)                      │   │
│  │                  (可选)                                    │   │
│  │                                                         │   │
│  │  - 大屏全文搜索                                         │   │
│  │  - 组件库搜索                                           │   │
│  │  - 日志分析                                             │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. 数据模型设计

### 2.1 用户模块 (User)

#### 2.1.1 用户表 (users)

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(255),
  
  -- 个人资料
  avatar VARCHAR(500),
  nickname VARCHAR(50),
  bio TEXT,
  
  -- 状态
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  
  -- 统计
  login_count INTEGER DEFAULT 0,
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR(45),
  
  -- 审计
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES users(id)
);

-- 索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### 2.1.2 角色表 (roles)

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 默认角色
INSERT INTO roles (name, code, description, is_system) VALUES
('超级管理员', 'super_admin', '系统超级管理员，拥有所有权限', TRUE),
('管理员', 'admin', '系统管理员，管理用户和大屏', TRUE),
('编辑者', 'editor', '可以创建和编辑大屏', TRUE),
('查看者', 'viewer', '只能查看大屏', TRUE);
```

#### 2.1.3 权限表 (permissions)

```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('menu', 'button', 'api', 'data')),
  parent_id UUID REFERENCES permissions(id),
  path VARCHAR(200),
  component VARCHAR(100),
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.1.4 用户-角色关联表 (user_roles)

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  scope_type VARCHAR(20) DEFAULT 'global' CHECK (scope_type IN ('global', 'department', 'project')),
  scope_id UUID,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  granted_by UUID REFERENCES users(id),
  expires_at TIMESTAMP,
  UNIQUE(user_id, role_id, scope_type, scope_id)
);
```

#### 2.1.5 角色-权限关联表 (role_permissions)

```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  granted_by UUID REFERENCES users(id),
  UNIQUE(role_id, permission_id)
);
```

### 2.2 大屏模块 (Screen)

#### 2.2.1 大屏表 (screens)

```sql
CREATE TABLE screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  
  -- 画布配置
  width INTEGER DEFAULT 1920,
  height INTEGER DEFAULT 1080,
  background_color VARCHAR(20) DEFAULT '#000000',
  background_image VARCHAR(500),
  grid_size INTEGER DEFAULT 10,
  zoom INTEGER DEFAULT 100,
  
  -- 状态和版本
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  version INTEGER DEFAULT 1,
  is_template BOOLEAN DEFAULT FALSE,
  
  -- 发布信息
  published_at TIMESTAMP,
  published_config JSONB,
  publish_url VARCHAR(500),
  version_note TEXT,
  
  -- 统计
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,
  
  -- 关联
  folder_id UUID REFERENCES folders(id),
  
  -- 审计
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES users(id)
);

CREATE INDEX idx_screens_status ON screens(status);
CREATE INDEX idx_screens_folder ON screens(folder_id);
CREATE INDEX idx_screens_created_by ON screens(created_by);
CREATE INDEX idx_screens_is_template ON screens(is_template);
```

#### 2.2.2 大屏组件表 (screen_components)

```sql
CREATE TABLE screen_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  
  -- 组件基本信息
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  library_id UUID REFERENCES component_libraries(id),
  
  -- 位置和尺寸
  x DECIMAL(10,2) DEFAULT 0,
  y DECIMAL(10,2) DEFAULT 0,
  width DECIMAL(10,2) NOT NULL,
  height DECIMAL(10,2) NOT NULL,
  rotation DECIMAL(5,2) DEFAULT 0,
  
  -- 样式配置
  style JSONB DEFAULT '{}',
  
  -- 数据和交互
  data_config JSONB DEFAULT '{}',
  interactions JSONB DEFAULT '[]',
  animations JSONB DEFAULT '[]',
  
  -- 层级和分组
  z_index INTEGER DEFAULT 0,
  parent_id UUID REFERENCES screen_components(id),
  group_id UUID,
  
  -- 状态
  is_locked BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_screen_components_screen ON screen_components(screen_id);
CREATE INDEX idx_screen_components_parent ON screen_components(parent_id);
CREATE INDEX idx_screen_components_type ON screen_components(type);
```

#### 2.2.3 大屏版本表 (screen_versions)

```sql
CREATE TABLE screen_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  
  -- 版本内容
  config JSONB NOT NULL,
  components JSONB DEFAULT '[]',
  
  -- 版本信息
  note TEXT,
  is_auto_save BOOLEAN DEFAULT FALSE,
  
  -- 统计
  file_size INTEGER,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  UNIQUE(screen_id, version)
);

CREATE INDEX idx_screen_versions_screen ON screen_versions(screen_id);
```

### 2.3 组件模块 (Component)

#### 2.3.1 组件库表 (component_libraries)

```sql
CREATE TABLE component_libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  
  -- 分类
  category VARCHAR(50),  // chart/map/table/info/container/custom
  sub_category VARCHAR(50),
  
  -- 图标和预览
  icon VARCHAR(500),
  cover VARCHAR(500),
  screenshots JSONB DEFAULT '[]',
  
  -- 版本信息
  version VARCHAR(20) DEFAULT '1.0.0',
  changelog TEXT,
  
  -- 组件定义
  schema JSONB NOT NULL,     // JSON Schema 定义
  defaultProps JSONB DEFAULT '{}',
  events JSONB DEFAULT '[]',
  
  -- 数据源支持
  dataSupport JSONB DEFAULT '{
    "static": true,
    "api": true,
    "database": false
  }',
  
  -- 依赖
  dependencies JSONB DEFAULT '[]',
  peerDependencies JSONB DEFAULT '{}',
  
  -- 文档
  readme TEXT,
  documentationUrl VARCHAR(500),
  
  -- 发布信息
  isOfficial BOOLEAN DEFAULT FALSE,
  isPublic BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'active',
  
  downloadCount INTEGER DEFAULT 0,
  rating DECIMAL(2,1),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_component_libs_category ON component_libraries(category);
CREATE INDEX idx_component_libs_is_official ON component_libraries(isOfficial);
CREATE INDEX idx_component_libs_status ON component_libraries(status);
```

### 2.4 文件夹模块 (Folder)

#### 2.4.1 文件夹表 (folders)

```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) DEFAULT 'screen' CHECK (type IN ('screen', 'component', 'datasource', 'file')),
  
  -- 层级
  parent_id UUID REFERENCES folders(id),
  level INTEGER DEFAULT 0,
  path VARCHAR(500),
  
  -- 排序
  sort_order INTEGER DEFAULT 0,
  
  -- 统计
  item_count INTEGER DEFAULT 0,
  
  -- 共享
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES users(id)
);

CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_folders_type ON folders(type);
CREATE INDEX idx_folders_created_by ON folders(created_by);
```

## 3. 数据库优化

### 3.1 索引策略

```sql
-- 复合索引示例
CREATE INDEX idx_screens_created_status ON screens(created_by, status, created_at DESC);

-- 部分索引（只索引特定条件的数据）
CREATE INDEX idx_active_users ON users(created_at) WHERE status = 'active';

-- 函数索引
CREATE INDEX idx_users_lower_email ON users(LOWER(email));
```

### 3.2 分区策略

```sql
-- 按时间范围分区（适用于日志表）
CREATE TABLE operation_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);

-- 创建分区
CREATE TABLE operation_logs_2024_q1 PARTITION OF operation_logs
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE operation_logs_2024_q2 PARTITION OF operation_logs
  FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
```

## 4. 数据迁移

### 4.1 使用 Prisma Migrate

```bash
# 创建迁移
npx prisma migrate dev --name add_user_profile

# 应用迁移
npx prisma migrate deploy

# 回滚迁移
npx prisma migrate resolve --rolled-back "20240115120000"

# 重置数据库（开发环境）
npx prisma migrate reset
```

### 4.2 种子数据

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 创建默认角色
  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: {},
    create: {
      name: '管理员',
      code: 'admin',
      description: '系统管理员',
      isSystem: true,
    },
  });

  // 创建默认用户
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: '$2b$10$...', // bcrypt hash
      status: 'active',
      emailVerified: true,
    },
  });

  // 关联用户和角色
  await prisma.userRole.upsert({
    where: {
      userId_roleId_scopeType_scopeId: {
        userId: adminUser.id,
        roleId: adminRole.id,
        scopeType: 'global',
        scopeId: '',
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
      scopeType: 'global',
    },
  });

  console.log('✅ Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

**文档信息**

- 版本: 1.0.0
- 最后更新: 2024-01-15
- 作者: BigScreen Team