# BigScreen Pro - API 接口文档

## 1. 接口概览

### 1.1 基本信息

| 项目 | 内容 |
|------|------|
| 基础 URL | `https://api.bigscreen-pro.com/api/v1` |
| 协议 | HTTPS |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 认证方式 | Bearer Token (JWT) |

### 1.2 请求规范

#### 标准请求头

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
X-Request-Id: <uuid>           # 可选，用于链路追踪
X-Client-Version: 1.0.0        # 可选，客户端版本
```

#### 标准响应格式

```typescript
// 成功响应
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "uuid",
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}

// 错误响应
{
  "code": 400,
  "message": "请求参数错误",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ],
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "uuid"
  }
}
```

### 1.3 HTTP 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功，无返回内容 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证，需要登录 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如重复创建） |
| 422 | Unprocessable Entity | 业务逻辑验证失败 |
| 429 | Too Many Requests | 请求过于频繁 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用 |

### 1.4 错误码规范

```typescript
// 错误码格式: XXYYY
// XX - 模块编号
// YYY - 错误序号

// 通用模块 (00)
const CommonErrors = {
  SUCCESS: { code: 0, message: 'success' },
  UNKNOWN_ERROR: { code: 10001, message: '未知错误' },
  PARAM_ERROR: { code: 10002, message: '参数错误' },
  UNAUTHORIZED: { code: 10003, message: '未授权' },
  FORBIDDEN: { code: 10004, message: '禁止访问' },
  NOT_FOUND: { code: 10005, message: '资源不存在' },
  RATE_LIMIT: { code: 10006, message: '请求过于频繁' },
  SERVICE_UNAVAILABLE: { code: 10007, message: '服务不可用' },
} as const;

// 用户模块 (01)
const UserErrors = {
  USER_NOT_FOUND: { code: 10101, message: '用户不存在' },
  USER_EXISTS: { code: 10102, message: '用户已存在' },
  INVALID_PASSWORD: { code: 10103, message: '密码错误' },
  PASSWORD_TOO_WEAK: { code: 10104, message: '密码强度不足' },
  ACCOUNT_LOCKED: { code: 10105, message: '账号已被锁定' },
  TOKEN_EXPIRED: { code: 10106, message: '登录已过期' },
  INVALID_TOKEN: { code: 10107, message: '无效的登录凭证' },
  EMAIL_EXISTS: { code: 10108, message: '邮箱已被注册' },
  PHONE_EXISTS: { code: 10109, message: '手机号已被注册' },
} as const;

// 大屏模块 (02)
const ScreenErrors = {
  SCREEN_NOT_FOUND: { code: 10201, message: '大屏不存在' },
  SCREEN_NAME_EXISTS: { code: 10202, message: '大屏名称已存在' },
  INVALID_SCREEN_CONFIG: { code: 10203, message: '大屏配置无效' },
  COMPONENT_NOT_FOUND: { code: 10204, message: '组件不存在' },
  INVALID_COMPONENT_DATA: { code: 10205, message: '组件数据无效' },
  DATASOURCE_NOT_FOUND: { code: 10206, message: '数据源不存在' },
  DATASOURCE_CONNECTION_FAILED: { code: 10207, message: '数据源连接失败' },
  TEMPLATE_NOT_FOUND: { code: 10208, message: '模板不存在' },
} as const;

// 文件模块 (03)
const FileErrors = {
  FILE_NOT_FOUND: { code: 10301, message: '文件不存在' },
  FILE_TOO_LARGE: { code: 10302, message: '文件大小超过限制' },
  INVALID_FILE_TYPE: { code: 10303, message: '不支持的文件类型' },
  UPLOAD_FAILED: { code: 10304, message: '文件上传失败' },
  DOWNLOAD_FAILED: { code: 10305, message: '文件下载失败' },
  STORAGE_FULL: { code: 10306, message: '存储空间不足' },
} as const;

// 系统模块 (04)
const SystemErrors = {
  CONFIG_NOT_FOUND: { code: 10401, message: '配置项不存在' },
  INVALID_CONFIG: { code: 10402, message: '配置值无效' },
  CACHE_ERROR: { code: 10403, message: '缓存操作失败' },
  MESSAGE_QUEUE_ERROR: { code: 10404, message: '消息队列操作失败' },
  SCHEDULED_TASK_ERROR: { code: 10405, message: '定时任务执行失败' },
  EXTERNAL_API_ERROR: { code: 10406, message: '外部 API 调用失败' },
} as const;
```

## 2. 认证授权

### 2.1 认证流程

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    客户端    │         │   API 网关   │         │  认证服务   │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │  1. 登录请求          │                       │
       │  POST /auth/login    │                       │
       │  {username, password}│                       │
       │────────────────────>│                       │
       │                       │                       │
       │                       │  2. 转发请求          │
       │                       │  POST /auth/login    │
       │                       │────────────────────>│
       │                       │                       │
       │                       │                       │  3. 验证用户
       │                       │                       │  - 查询用户
       │                       │                       │  - 验证密码
       │                       │                       │
       │                       │  4. 返回结果        │
       │                       │  {token, user}       │
       │                       │<────────────────────│
       │                       │                       │
       │  5. 返回结果          │                       │
       │  {token, user}       │                       │
       │<────────────────────│                       │
       │                       │                       │
       │                       │                       │
       │  6. 后续请求          │                       │
       │  GET /api/screens    │                       │
       │  Authorization: Bearer <token>
       │────────────────────>│                       │
       │                       │  7. 验证 Token        │
       │                       │  - 解析 JWT           │
       │                       │  - 验证签名           │
       │                       │  - 检查过期时间       │
       │                       │                       │
       │                       │<─────── 有效 ─────────│
       │                       │                       │
       │                       │  8. 转发请求          │
       │                       │  GET /api/screens    │
       │                       │  {userId}            │
       │                       │────────────────────>│
       │                       │                       │
```

### 2.2 JWT Token 规范

```typescript
// JWT Payload 结构
interface JWTPayload {
  // 标准声明
  iss: string;      // 签发者 (issuer)
  sub: string;      // 主题/用户ID (subject)
  aud: string;      // 接收者 (audience)
  exp: number;      // 过期时间 (expiration time)
  nbf: number;      // 生效时间 (not before)
  iat: number;      // 签发时间 (issued at)
  jti: string;      // 唯一标识 (JWT ID)
  
  // 自定义声明
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    permissions: string[];
  };
  
  // 会话信息
  session: {
    id: string;
    device: string;
    ip: string;
    loginAt: string;
  };
}
```

### 2.3 API 认证示例

```typescript
// 获取 Token
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123",
  "captcha": "abc123",
  "rememberMe": true
}

// 响应
{
  "code": 200,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "id": "1",
      "username": "admin",
      "email": "admin@example.com",
      "avatar": "https://example.com/avatar.png",
      "role": "admin",
      "permissions": ["*"]
    }
  }
}
```

## 3. 接口详细定义

### 3.1 认证接口

#### 3.1.1 用户注册

```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",      // 必填，用户名，3-20字符，字母开头
  "password": "string",      // 必填，密码，8-20字符，包含大小写字母和数字
  "email": "string",        // 必填，邮箱，需唯一
  "phone": "string",        // 选填，手机号
  "captcha": "string",      // 必填，验证码
  "captchaKey": "string"  // 必填，验证码标识
}

Response 201:
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}

Response 400:
{
  "code": 10002,
  "message": "参数错误",
  "errors": [
    {
      "field": "username",
      "message": "用户名已被占用"
    }
  ]
}
```

#### 3.1.2 用户登录

```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",      // 必填，用户名或邮箱
  "password": "string",      // 必填，密码
  "captcha": "string",      // 条件必填，密码错误3次后需要
  "rememberMe": false       // 选填，记住登录，默认 false
}

Response 200:
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "avatar": "url",
      "role": "admin",
      "permissions": ["*"]
    }
  }
}

Response 401:
{
  "code": 10103,
  "message": "密码错误",
  "data": {
    "remainingAttempts": 2,
    "requireCaptcha": false
  }
}
```

#### 3.1.3 刷新 Token

```http
POST /auth/refresh
Content-Type: application/json
Authorization: Bearer <refresh_token>

Response 200:
{
  "code": 200,
  "message": "刷新成功",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}

Response 401:
{
  "code": 10107,
  "message": "登录已过期，请重新登录"
}
```

#### 3.1.4 退出登录

```http
POST /auth/logout
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "退出成功"
}
```

#### 3.1.5 获取当前用户信息

```http
GET /auth/me
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "phone": "string",
    "avatar": "url",
    "role": "admin",
    "permissions": ["*"],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "lastLoginAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3.2 大屏管理接口

#### 3.2.1 创建大屏

```http
POST /screens
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "销售数据大屏",          // 必填，大屏名称，2-50字符
  "description": "展示销售数据...", // 选填，描述
  "thumbnail": "url",              // 选填，缩略图
  "width": 1920,                   // 选填，画布宽度，默认 1920
  "height": 1080,                  // 选填，画布高度，默认 1080
  "backgroundColor": "#000000",    // 选填，背景色
  "backgroundImage": "url",        // 选填，背景图
  "gridSize": 10,                  // 选填，网格大小，默认 10
  "zoom": 100,                     // 选填，默认缩放比例，默认 100
  "isTemplate": false,             // 选填，是否作为模板，默认 false
  "folderId": "uuid"              // 选填，所属文件夹
}

Response 201:
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": "uuid",
    "name": "销售数据大屏",
    "description": "展示销售数据...",
    "thumbnail": "url",
    "width": 1920,
    "height": 1080,
    "backgroundColor": "#000000",
    "backgroundImage": "url",
    "gridSize": 10,
    "zoom": 100,
    "status": "draft",
    "version": 1,
    "isTemplate": false,
    "folderId": "uuid",
    "createdBy": {
      "id": "uuid",
      "username": "admin",
      "avatar": "url"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 3.2.2 获取大屏列表

```http
GET /screens?folderId=uuid&status=draft&page=1&pageSize=20&sort=-updatedAt
Authorization: Bearer <token>

Query 参数:
- folderId: string, 可选，文件夹 ID
- status: string, 可选，状态筛选 (draft/published/archived)
- keyword: string, 可选，关键字搜索
- isTemplate: boolean, 可选，是否模板
- page: number, 可选，页码，默认 1
- pageSize: number, 可选，每页数量，默认 20
- sort: string, 可选，排序字段，格式: "-updatedAt" 或 "name"

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "销售数据大屏",
        "description": "展示销售数据...",
        "thumbnail": "url",
        "width": 1920,
        "height": 1080,
        "status": "draft",
        "version": 1,
        "isTemplate": false,
        "createdBy": {
          "id": "uuid",
          "username": "admin",
          "avatar": "url"
        },
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 20,
        "total": 100,
        "totalPages": 5
      }
    }
  }
}
```

#### 3.2.3 获取大屏详情

```http
GET /screens/:id
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "uuid",
    "name": "销售数据大屏",
    "description": "展示销售数据...",
    "thumbnail": "url",
    "width": 1920,
    "height": 1080,
    "backgroundColor": "#000000",
    "backgroundImage": "url",
    "gridSize": 10,
    "zoom": 100,
    "config": {
      // 大屏配置
      "theme": "dark",
      "animation": true,
      "autoUpdate": true,
      "updateInterval": 60
    },
    "status": "draft",
    "version": 1,
    "isTemplate": false,
    "folderId": "uuid",
    "createdBy": {
      "id": "uuid",
      "username": "admin",
      "avatar": "url"
    },
    "updatedBy": {
      "id": "uuid",
      "username": "admin",
      "avatar": "url"
    },
    "publishedAt": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}

Response 404:
{
  "code": 10201,
  "message": "大屏不存在"
}

Response 403:
{
  "code": 104,
  "message": "无权限访问该大屏"
}
```

#### 3.2.4 更新大屏

```http
PATCH /screens/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新的名称",
  "description": "新的描述",
  "thumbnail": "new-url",
  "width": 2560,
  "height": 1440,
  "backgroundColor": "#ffffff",
  "gridSize": 20
}

Response 200:
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "uuid",
    "name": "新的名称",
    "description": "新的描述",
    ...
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### 3.2.5 删除大屏

```http
DELETE /screens/:id
Authorization: Bearer <token>

Response 204: (No Content)

Response 404:
{
  "code": 10201,
  "message": "大屏不存在"
}

Response 409:
{
  "code": 10202,
  "message": "大屏已发布，无法删除"
}
```

#### 3.2.6 发布大屏

```http
POST /screens/:id/publish
Authorization: Bearer <token>
Content-Type: application/json

{
  "versionNote": "修复了数据更新问题"
}

Response 200:
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "id": "uuid",
    "name": "大屏名称",
    "status": "published",
    "version": 2,
    "publishedAt": "2024-01-15T11:00:00Z",
    "versionNote": "修复了数据更新问题",
    "publishUrl": "https://viewer.bigscreen-pro.com/s/uuid"
  }
}
```

### 3.3 组件管理接口

#### 3.3.1 获取组件列表

```http
GET /components?category=chart&page=1&pageSize=20
Authorization: Bearer <token>

Query 参数:
- category: string, 可选，分类筛选 (chart/map/table/info/container/custom)
- keyword: string, 可选，关键字搜索
- isOfficial: boolean, 可选，是否官方组件
- page: number, 可选，页码
- pageSize: number, 可选，每页数量

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "折线图",
        "description": "基础折线图组件",
        "category": "chart",
        "icon": "url",
        "cover": "url",
        "version": "1.0.0",
        "isOfficial": true,
        "author": {
          "id": "uuid",
          "username": "官方"
        },
        "config": {
          // 组件配置定义
          "properties": [...],
          "events": [...],
          "data": {...}
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "meta": {
      "pagination": {...}
    }
  }
}
```

### 3.4 数据源管理接口

#### 3.4.1 创建数据源

```http
POST /datasources
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "销售数据库",
  "type": "mysql",                 // 类型: mysql/postgresql/mongodb/elasticsearch/api/static
  "description": "销售数据主库",
  "config": {
    // MySQL 配置
    "host": "localhost",
    "port": 3306,
    "database": "sales",
    "username": "readonly",
    "password": "encrypted",
    "charset": "utf8mb4",
    "poolSize": 10,
    "timeout": 30000,
    
    // SSL 配置（可选）
    "ssl": {
      "enabled": true,
      "ca": "...",
      "cert": "...",
      "key": "..."
    }
  }
}

Response 201:
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": "uuid",
    "name": "销售数据库",
    "type": "mysql",
    "description": "销售数据主库",
    "status": "connected",          // connected/disconnected/error
    "config": {
      "host": "localhost",
      "port": 3306,
      "database": "sales"
      // 敏感信息（如密码）不返回
    },
    "lastTestedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3.5 文件管理接口

#### 3.5.1 上传文件

```http
POST /files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- file: File (文件)
- type: string (文件类型: image/video/audio/document/other)
- folder: string (可选，目标文件夹)

Response 201:
{
  "code": 201,
  "message": "上传成功",
  "data": {
    "id": "uuid",
    "name": "image.png",
    "originalName": "screenshot.png",
    "type": "image",
    "mimeType": "image/png",
    "size": 1024000,
    "sizeFormatted": "1 MB",
    "url": "https://storage.example.com/files/uuid/image.png",
    "thumbnail": "https://storage.example.com/files/uuid/image_thumb.png",
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "folder": {
      "id": "uuid",
      "name": "Images"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": {
      "id": "uuid",
      "username": "admin"
    }
  }
}
```

---

**文档信息**

- 版本: 1.0.0
- 最后更新: 2024-01-15
- 作者: BigScreen Team
- 状态: 进行中