# BigScreen Pro - 开发规范与指南

## 1. 开发环境搭建

### 1.1 环境要求

| 工具 | 版本 | 说明 |
|------|------|------|
| Node.js | >= 20.0.0 | JavaScript 运行时 |
| pnpm | >= 8.0.0 | 包管理器 |
| Git | >= 2.30 | 版本控制 |
| VS Code | latest | 推荐 IDE |

### 1.2 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/ailaiwuyou/bigscreen-pro.git
cd bigscreen-pro

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件配置数据库等信息

# 4. 初始化数据库
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. 启动开发服务
pnpm dev
```

### 1.3 环境变量配置

创建 `.env` 文件：

```bash
# 应用配置
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# 数据库配置
DATABASE_URL="postgresql://user:password@localhost:5432/bigscreen?schema=public"

# Redis 配置
REDIS_URL="redis://localhost:6379"

# JWT 配置
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# 文件存储
STORAGE_TYPE="local" # local | minio | oss
STORAGE_BASE_URL="http://localhost:3000/uploads"

# 日志配置
LOG_LEVEL="info"
LOG_FORMAT="json"
```

## 2. 代码规范

### 2.1 命名规范

#### 2.1.1 文件命名

```
# 组件文件
Button.vue                    # 基础组件
UserProfile.vue              # 业务组件
index.ts                     # 入口文件

# 工具文件
formatDate.ts                # 工具函数
useAuth.ts                   # Composable

# 样式文件
variables.scss               # 变量
mixins.scss                  # 混合
component.module.scss        # CSS Modules
```

#### 2.1.2 变量命名

```typescript
// 常量 - UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = '/api/v1';

// 变量 - camelCase
let userName = '张三';
let isLoading = false;

// 类名 - PascalCase
class UserService {
  // ...
}

// 接口名 - PascalCase
interface UserInfo {
  id: number;
  name: string;
}

// 类型别名 - PascalCase
type UserRole = 'admin' | 'user' | 'guest';

// 枚举 - PascalCase + 大写下划线
enum HttpStatus {
  OK = 200,
  NOT_FOUND = 404,
  SERVER_ERROR = 500
}
```

#### 2.1.3 Vue 组件命名

```vue
<!-- 单文件组件 -->
<!-- 基础组件 - 大驼峰 -->
<template>
  <BaseButton />
</template>

<!-- 业务组件 - 大驼峰，语义化 -->
<template>
  <UserProfileCard />
</template>

<!-- 布局组件 - 大驼峰，Layout 前缀 -->
<template>
  <LayoutSidebar />
</template>
```

### 2.2 代码风格

#### 2.2.1 TypeScript 规范

```typescript
// ✅ 启用严格类型检查
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}

// ✅ 显式声明返回类型
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

// ✅ 使用接口定义对象结构
interface Product {
  id: number;
  name: string;
  price: number;
  description?: string; // 可选属性
}

// ✅ 使用类型保护
function processValue(value: string | number): void {
  if (typeof value === 'string') {
    // TypeScript 知道这里是 string
    console.log(value.toUpperCase());
  } else {
    // TypeScript 知道这里是 number
    console.log(value.toFixed(2));
  }
}

// ❌ 避免使用 any
// _BAD_
function badFunction(data: any): any {
  return data.something;
}

// _GOOD_
function goodFunction<T>(data: T): T {
  return data;
}
```

#### 2.2.2 Vue 3 组合式 API 规范

```vue
<script setup lang="ts">
// ✅ 导入顺序：Vue 核心 → 第三方 → 本地模块
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { fetchUserData } from '@/api/user';
import type { UserInfo } from '@/types/user';

// ✅ Props 定义
interface Props {
  userId: string;
  showDetail?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDetail: false
});

// ✅ Emits 定义
const emit = defineEmits<{
  (e: 'update', data: UserInfo): void;
  (e: 'delete', id: string): void;
}>();

// ✅ 响应式数据（按类型分组）
// Loading 状态
const isLoading = ref(false);
const isSaving = ref(false);

// 数据状态
const userData = ref<UserInfo | null>(null);
const errorMessage = ref('');

// UI 状态
const showModal = ref(false);
const activeTab = ref('basic');

// ✅ 计算属性
const fullName = computed(() => {
  if (!userData.value) return '';
  return `${userData.value.firstName} ${userData.value.lastName}`;
});

const canEdit = computed(() => {
  return userData.value?.status === 'active';
});

// ✅ 方法（按功能分组）
// 数据获取
async function loadUserData() {
  if (!props.userId) return;
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const data = await fetchUserData(props.userId);
    userData.value = data;
    emit('update', data);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载失败';
    console.error('加载用户数据失败:', error);
  } finally {
    isLoading.value = false;
  }
}

// 事件处理
function handleSave() {
  if (!canEdit.value) return;
  
  showModal.value = true;
}

function handleDelete() {
  if (!userData.value) return;
  
  emit('delete', userData.value.id);
}

// ✅ 生命周期钩子
onMounted(() => {
  loadUserData();
});

// ✅ Watch
watch(() => props.userId, (newId) => {
  if (newId) {
    loadUserData();
  }
});

// 暴露给父组件的方法
defineExpose({
  refresh: loadUserData
});
</script>

<template>
  <div class="user-card">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner />
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="errorMessage" class="error-state">
      <ErrorMessage :message="errorMessage" />
      <BaseButton @click="loadUserData">重试</BaseButton>
    </div>
    
    <!-- 内容 -->
    <div v-else-if="userData" class="content">
      <h3>{{ fullName }}</h3>
      <p>{{ userData.email }}</p>
      
      <div class="actions">
        <BaseButton 
          v-if="canEdit" 
          @click="handleSave"
        >
          编辑
        </BaseButton>
        <BaseButton 
          variant="danger" 
          @click="handleDelete"
        >
          删除
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.user-card {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  
  .loading-state,
  .error-state {
    text-align: center;
    padding: 24px;
  }
  
  .content {
    h3 {
      margin: 0 0 8px;
      font-size: 18px;
    }
    
    p {
      margin: 0 0 16px;
      color: #666;
    }
  }
  
  .actions {
    display: flex;
    gap: 8px;
  }
}
</style>
```

### 2.3 注释规范

```typescript
// ✅ 文件头注释
/**
 * @fileoverview 用户服务模块
 * @description 提供用户相关的业务逻辑处理，包括用户CRUD、认证授权等
 * @module services/user
 * @author BigScreen Team
 * @since 2024-01-01
 * @version 1.0.0
 */

// ✅ 类注释
/**
 * 用户服务类
 * @class UserService
 * @description 处理用户相关的业务逻辑
 * @example
 * const userService = new UserService();
 * const user = await userService.create({ name: '张三' });
 */
class UserService {
  // ✅ 属性注释
  /**
   * 用户数据访问对象
   * @private
   * @type {UserRepository}
   */
  private userRepository: UserRepository;

  /**
   * 缓存客户端
   * @private
   * @type {RedisClient}
   */
  private cacheClient: RedisClient;

  // ✅ 方法注释
  /**
   * 创建用户
   * @async
   * @method create
   * @description 创建新用户并发送欢迎邮件
   * @param {CreateUserInput} input - 用户创建参数
   * @param {string} input.name - 用户名
   * @param {string} input.email - 邮箱地址
   * @param {string} [input.password] - 密码（可选，不传则生成随机密码）
   * @returns {Promise<User>} 创建成功的用户对象
   * @throws {ValidationError} 参数验证失败时抛出
   * @throws {ConflictError} 邮箱已存在时抛出
   * @throws {InternalError} 服务器内部错误时抛出
   * @example
   * const user = await userService.create({
   *   name: '张三',
   *   email: 'zhangsan@example.com',
   *   password: 'securePassword123'
   * });
   * console.log(user.id); // 1
   */
  async create(input: CreateUserInput): Promise<User> {
    // 实现代码
  }
}

// ✅ 函数注释
/**
 * 格式化日期为本地字符串
 * @function formatDate
 * @description 将 Date 对象或时间戳格式化为本地化的日期字符串
 * @param {Date | number | string} date - 日期对象、时间戳或日期字符串
 * @param {Object} [options] - 格式化选项
 * @param {string} [options.format='YYYY-MM-DD'] - 日期格式模板
 * @param {string} [options.locale='zh-CN'] - 本地化语言
 * @param {boolean} [options.showTime=false] - 是否显示时间
 * @returns {string} 格式化后的日期字符串
 * @throws {TypeError} date 参数类型错误时抛出
 * @example
 * // 基本用法
 * formatDate(new Date()); // "2024-01-15"
 *
 * // 自定义格式
 * formatDate(new Date(), { format: 'YYYY年MM月DD日' }); // "2024年01月15日"
 *
 * // 显示时间
 * formatDate(new Date(), { showTime: true }); // "2024-01-15 14:30:00"
 */
function formatDate(
  date: Date | number | string,
  options?: {
    format?: string;
    locale?: string;
    showTime?: boolean;
  }
): string {
  // 实现代码
}

// ✅ 常量注释
/**
 * HTTP 状态码常量
 * @constant {Object} HTTP_STATUS
 * @description 常用的 HTTP 响应状态码
 * @readonly
 * @property {number} OK - 请求成功 (200)
 * @property {number} CREATED - 资源创建成功 (201)
 * @property {number} BAD_REQUEST - 请求参数错误 (400)
 * @property {number} UNAUTHORIZED - 未授权 (401)
 * @property {number} FORBIDDEN - 禁止访问 (403)
 * @property {number} NOT_FOUND - 资源不存在 (404)
 * @property {number} INTERNAL_ERROR - 服务器内部错误 (500)
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

// ✅ 类型定义注释
/**
 * 用户角色类型
 * @typedef {string} UserRole
 * @description 系统中预定义的用户角色
 * @enum {string}
 * @readonly
 */
type UserRole = 'admin' | 'editor' | 'viewer' | 'guest';

/**
 * 用户对象接口
 * @interface IUser
 * @description 用户数据的完整结构定义
 * @property {string} id - 用户唯一标识符 (UUID格式)
 * @property {string} username - 用户名 (3-20字符，字母开头)
 * @property {string} email - 邮箱地址
 * @property {UserRole} role - 用户角色
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 * @property {Date} [lastLoginAt] - 最后登录时间 (可选)
 * @property {boolean} [isActive] - 是否激活 (可选，默认true)
 */
interface IUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive?: boolean;
}
```

### 2.4 代码提交规范

#### 2.4.1 Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (Type)**:

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 文档更新 |
| `style` | 代码格式调整（不影响功能） |
| `refactor` | 代码重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具/依赖更新 |
| `revert` | 回滚提交 |

**示例**:

```bash
# 功能提交
feat(editor): 添加画布拖拽对齐功能

实现画布元素的智能对齐功能：
- 添加水平和垂直对齐线
- 支持自动吸附到附近元素
- 对齐精度可配置（默认 10px）
- 使用 CSS transform 提升性能

Refs: #123

# Bug 修复
fix(api): 修复用户查询结果为空时的 500 错误

当用户查询条件匹配不到数据时，
原代码未处理空结果导致 NullPointerException。

修复内容：
- 添加空值检查
- 返回空数组而非 null
- 添加相应的单元测试

Closes: #456

# 重构
refactor(editor): 重构画布渲染逻辑，提升性能

将画布渲染从传统的 DOM 操作改为基于 Canvas 的渲染：

优化点：
- 减少 DOM 节点数量 80%
- 渲染帧率从 30fps 提升到 60fps
- 内存占用降低 40%
- 支持更大的画布尺寸（10k+ 元素）

BREAKING CHANGE: 部分插件 API 有变更，详见迁移指南

Refs: #789
```

#### 2.4.2 分支管理规范

```
main/master          # 生产分支，只接受合并，不直接提交
│
├── develop          # 开发分支，日常开发基于这个分支
│   │
│   ├── feature/xxx  # 功能分支，从 develop 检出
│   │   └── (开发完成后合并回 develop)
│   │
│   ├── bugfix/xxx   # Bug 修复分支
│   │   └── (修复后合并回 develop)
│   │
│   └── refactor/xxx # 重构分支
│       └── (重构完成后合并回 develop)
│
├── release/v1.0.0   # 发布分支，从 develop 检出
│   └── (测试修复后合并到 main 和 develop)
│
└── hotfix/xxx       # 热修复分支，从 main 检出
    └── (修复后合并到 main 和 develop)
```

**分支命名规范**:

```
# 功能分支
feature/<功能描述>
# 示例: feature/editor-drag-align
#       feature/user-auth

# Bug 修复分支
bugfix/<问题描述>-<issue编号>
# 示例: bugfix/login-timeout-123
#       bugfix/api-error-handling

# 热修复分支
hotfix/<问题描述>
# 示例: hotfix/security-vulnerability
#       hotfix/data-loss-fix

# 重构分支
refactor/<重构内容>
# 示例: refactor/editor-rendering
#       refactor/api-structure

# 发布分支
release/v<版本号>
# 示例: release/v1.2.0
#       release/v2.0.0-beta.1
```

## 3. 项目结构规范

### 3.1 目录结构

```
bigscreen-pro/
├── apps/                          # 前端应用
│   ├── web/                      # 主应用
│   │   ├── src/
│   │   │   ├── api/              # API 接口
│   │   │   ├── assets/           # 静态资源
│   │   │   │   ├── images/
│   │   │   │   ├── fonts/
│   │   │   │   └── styles/
│   │   │   ├── components/       # 业务组件
│   │   │   │   ├── business/     # 业务组件
│   │   │   │   └── common/       # 通用组件
│   │   │   ├── composables/       # 组合式函数
│   │   │   ├── constants/          # 常量定义
│   │   │   ├── layouts/            # 布局组件
│   │   │   ├── router/             # 路由配置
│   │   │   ├── stores/             # 状态管理
│   │   │   ├── types/              # 类型定义
│   │   │   ├── utils/              # 工具函数
│   │   │   ├── views/              # 页面组件
│   │   │   ├── App.vue
│   │   │   └── main.ts
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── admin/                     # 管理后台
│   └── viewer/                    # 大屏展示器
│
├── packages/                      # 共享包
│   ├── core/                      # 核心引擎
│   │   ├── src/
│   │   │   ├── canvas/           # 画布引擎
│   │   │   ├── component/        # 组件管理
│   │   │   ├── event/              # 事件系统
│   │   │   └── render/             # 渲染引擎
│   │   └── package.json
│   │
│   ├── ui/                        # UI 组件库
│   │   ├── src/
│   │   │   ├── components/        # 组件
│   │   │   ├── styles/             # 样式
│   │   │   └── theme/              # 主题
│   │   └── package.json
│   │
│   ├── utils/                     # 工具函数
│   ├── types/                     # 类型定义
│   ├── constants/                 # 常量定义
│   └── components/                # 业务组件
│
├── services/                      # 后端服务
│   └── api/
│       ├── src/
│       │   ├── app.ts             # 应用入口
│       │   ├── config/            # 配置
│       │   │   ├── database.ts
│       │   │   ├── env.ts
│       │   │   └── redis.ts
│       │   ├── controllers/       # 控制器
│       │   ├── middleware/        # 中间件
│       │   │   ├── auth.ts
│       │   │   ├── error.ts
│       │   │   └── logger.ts
│       │   ├── routes/            # 路由
│       │   ├── services/          # 业务逻辑
│       │   ├── types/             # 类型定义
│       │   ├── utils/             # 工具函数
│       │   └── validators/        # 数据验证
│       ├── prisma/                # 数据库模型
│       │   ├── schema.prisma
│       │   └── seed.ts
│       ├── tests/                 # 测试
│       │   ├── unit/
│       │   ├── integration/
│       │   └── e2e/
│       ├── Dockerfile
│       ├── docker-compose.yml
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                          # 文档
│   ├── REQUIREMENTS.md            # 需求文档
│   ├── ARCHITECTURE.md            # 架构设计
│   ├── DEVELOPMENT.md             # 开发规范
│   ├── API.md                     # API 文档
│   ├── DATABASE.md                # 数据库设计
│   ├── DEPLOYMENT.md              # 部署指南
│   ├── TROUBLESHOOTING.md         # 故障排查
│   └── CHANGELOG.md               # 更新日志
│
├── scripts/                       # 脚本工具
│   ├── setup.sh                   # 初始化脚本
│   ├── dev.sh                     # 开发脚本
│   ├── build.sh                   # 构建脚本
│   ├── test.sh                    # 测试脚本
│   └── deploy.sh                  # 部署脚本
│
├── .github/                       # GitHub 配置
│   ├── workflows/                 # CI/CD 工作流
│   │   ├── ci.yml                 # 持续集成
│   │   ├── cd.yml                 # 持续部署
│   │   └── release.yml            # 发布工作流
│   ├── ISSUE_TEMPLATE/            # Issue 模板
│   └── PULL_REQUEST_TEMPLATE.md   # PR 模板
│
├── .husky/                        # Git Hooks
│   ├── pre-commit                 # 提交前检查
│   ├── commit-msg                 # 提交信息检查
│   └── pre-push                   # 推送前检查
│
├── .env.example                   # 环境变量示例
├── .eslintrc.js                   # ESLint 配置
├── .prettierrc                    # Prettier 配置
├── .gitignore                     # Git 忽略文件
├── docker-compose.yml             # Docker Compose 配置
├── Dockerfile                   # Docker 镜像构建
├── LICENSE                        # 开源协议
├── package.json                   # 项目配置
├── pnpm-workspace.yaml            # pnpm 工作区配置
├── README.md                      # 项目说明
├── turbo.json                     # Turbo 配置
└── tsconfig.json                  # TypeScript 配置
```

### 3.2 模块组织原则

```
📦 模块组织原则

1️⃣ 单一职责原则 (SRP)
   每个模块只负责一个明确的功能领域
   
   ✅ Good:
   src/
   ├── user/          # 用户相关
   ├── dashboard/     # 大屏相关
   └── component/     # 组件相关
   
   ❌ Bad:
   src/
   └── utils/         # 什么都往里塞

2️⃣ 关注点分离 (Separation of Concerns)
   不同职责的文件分开存放
   
   ✅ Good:
   src/user/
   ├── api.ts         # API 调用
   ├── store.ts       # 状态管理
   ├── types.ts       # 类型定义
   └── utils.ts       # 工具函数

3️⃣ 就近原则
   相关的文件放在相近的位置
   
   ✅ Good:
   src/components/
   ├── UserProfile/
   │   ├── index.vue       # 组件
   │   ├── UserProfile.scss # 样式
   │   ├── types.ts        # 类型
   │   └── utils.ts        # 工具
   └── UserList/
       └── ...

4️⃣ 扁平优先
   避免过深的目录层级
   
   ✅ Good:
   src/components/Button.vue
   src/components/Input.vue
   
   ❌ Bad:
   src/components/
   └── ui/
       └── button/
           └── Button.vue

5️⃣ 公共提取
   多处使用的代码提取到公共位置
   
   ✅ Good:
   src/
   ├── components/    # 公共组件
   ├── composables/   # 公共组合式函数
   ├── utils/         # 公共工具函数
   └── constants/     # 公共常量
```

## 4. 测试规范

### 4.1 测试策略

```
🧪 测试金字塔

        /\
       /  \
      / E2E \          # 端到端测试 (5%)
     /--------\
    /          \
   / Integration \     # 集成测试 (15%)
  /----------------\
 /                  \
/      Unit          \  # 单元测试 (80%)
/______________________\
```

### 4.2 测试目录结构

```
project/
├── src/
│   └── components/
│       └── Button.vue
│
├── tests/                        # 测试目录
│   ├── unit/                     # 单元测试
│   │   ├── components/
│   │   │   └── Button.spec.ts    # Button 组件测试
│   │   ├── utils/
│   │   │   └── formatDate.spec.ts
│   │   └── composables/
│   │       └── useAuth.spec.ts
│   │
│   ├── integration/              # 集成测试
│   │   ├── api/
│   │   │   └── user.spec.ts
│   │   └── database/
│   │       └── connection.spec.ts
│   │
│   ├── e2e/                      # 端到端测试
│   │   ├── specs/
│   │   │   ├── login.spec.ts
│   │   │   └── create-dashboard.spec.ts
│   │   └── fixtures/
│   │       └── users.json
│   │
│   └── setup/                    # 测试配置
│       ├── vitest.setup.ts
│       └── playwright.config.ts
```

### 4.3 测试用例编写规范

```typescript
// ✅ 测试文件命名: <name>.spec.ts 或 <name>.test.ts

// tests/unit/components/Button.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '@/components/Button.vue';

describe('Button 组件', () => {
  // 基础渲染测试
  describe('基础渲染', () => {
    it('应该正确渲染按钮文本', () => {
      const wrapper = mount(Button, {
        props: { label: '点击我' }
      });
      
      expect(wrapper.text()).toBe('点击我');
    });

    it('应该渲染默认插槽内容', () => {
      const wrapper = mount(Button, {
        slots: {
          default: '插槽内容'
        }
      });
      
      expect(wrapper.text()).toBe('插槽内容');
    });
  });

  // Props 测试
  describe('Props', () => {
    it('应该根据 variant 应用正确的样式', () => {
      const wrapper = mount(Button, {
        props: { variant: 'danger' }
      });
      
      expect(wrapper.classes()).toContain('btn-danger');
    });

    it('应该根据 size 应用正确的大小', () => {
      const wrapper = mount(Button, {
        props: { size: 'large' }
      });
      
      expect(wrapper.classes()).toContain('btn-lg');
    });

    it('应该在 disabled 为 true 时禁用按钮', () => {
      const wrapper = mount(Button, {
        props: { disabled: true }
      });
      
      expect(wrapper.attributes('disabled')).toBeDefined();
      expect(wrapper.classes()).toContain('disabled');
    });

    it('应该在 loading 为 true 时显示加载状态', () => {
      const wrapper = mount(Button, {
        props: { loading: true }
      });
      
      expect(wrapper.find('.loading-spinner').exists()).toBe(true);
      expect(wrapper.attributes('disabled')).toBeDefined();
    });
  });

  // 事件测试
  describe('事件', () => {
    it('应该触发 click 事件', async () => {
      const wrapper = mount(Button);
      
      await wrapper.trigger('click');
      
      expect(wrapper.emitted('click')).toBeTruthy();
    });

    it('不应该在 disabled 时触发 click', async () => {
      const onClick = vi.fn();
      const wrapper = mount(Button, {
        props: { 
          disabled: true,
          onClick
        }
      });
      
      await wrapper.trigger('click');
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('应该传递事件对象', async () => {
      const wrapper = mount(Button);
      
      await wrapper.trigger('click');
      
      const emittedEvent = wrapper.emitted('click');
      expect(emittedEvent).toHaveLength(1);
      expect(emittedEvent[0][0]).toBeInstanceOf(MouseEvent);
    });
  });

  // 插槽测试
  describe('插槽', () => {
    it('应该渲染默认插槽', () => {
      const wrapper = mount(Button, {
        slots: {
          default: '<span class="custom-content">自定义内容</span>'
        }
      });
      
      expect(wrapper.find('.custom-content').exists()).toBe(true);
    });

    it('应该渲染图标插槽', () => {
      const wrapper = mount(Button, {
        slots: {
          icon: '<span class="icon">★</span>'
        }
      });
      
      expect(wrapper.find('.icon').exists()).toBe(true);
    });
  });

  // 样式测试
  describe('样式', () => {
    it('应该应用自定义类名', () => {
      const wrapper = mount(Button, {
        props: { 
          class: 'my-custom-class' 
        }
      });
      
      expect(wrapper.classes()).toContain('my-custom-class');
    });

    it('应该应用内联样式', () => {
      const wrapper = mount(Button, {
        props: { 
          style: 'color: red;' 
        }
      });
      
      expect(wrapper.attributes('style')).toContain('color: red');
    });
  });
});

// ✅ 异步测试
describe('异步操作', () => {
  it('应该处理异步加载', async () => {
    const AsyncButton = {
      template: '<button>{{ text }}</button>',
      data() {
        return { text: '加载中...' };
      },
      async mounted() {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.text = '完成';
      }
    };

    const wrapper = mount(AsyncButton);
    
    expect(wrapper.text()).toBe('加载中...');
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(wrapper.text()).toBe('完成');
  });
});

// ✅ Mock 测试
describe('Mock 测试', () => {
  it('应该 mock API 调用', async () => {
    // Mock API 模块
    const mockFetchUser = vi.fn().mockResolvedValue({
      id: 1,
      name: '张三'
    });

    // 使用 mock
    const user = await mockFetchUser(1);
    
    expect(mockFetchUser).toHaveBeenCalledWith(1);
    expect(user.name).toBe('张三');
  });

  it('应该 mock 全局对象', () => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://example.com'
      },
      writable: true
    });

    expect(window.location.href).toBe('https://example.com');
  }