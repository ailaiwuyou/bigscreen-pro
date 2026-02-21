# BigScreen Pro API 文档

## 概述

BigScreen Pro API 采用 RESTful 风格设计，支持 JSON 格式的数据交互。

**Base URL**: `http://localhost:3001/api`

**认证方式**: JWT Bearer Token

---

## 认证接口 (Auth)

### 用户注册

**POST** `/api/auth/register`

**请求体**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "role": "USER",
      "avatar": null,
      "status": "ACTIVE"
    },
    "token": "jwt-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

---

### 用户登录

**POST** `/api/auth/login`

**请求体**:
```json
{
  "email": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "role": "USER",
      "avatar": null,
      "status": "ACTIVE"
    },
    "token": "jwt-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

---

### 刷新 Token

**POST** `/api/auth/refresh`

**请求体**:
```json
{
  "refreshToken": "string"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token",
    "refreshToken": "new-refresh-token"
  }
}
```

---

### 获取当前用户

**GET** `/api/auth/me`

**需要认证**: ✅ 是

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "USER",
    "avatar": null,
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 用户登出

**POST** `/api/auth/logout`

**需要认证**: ✅ 是

**响应**:
```json
{
  "success": true,
  "message": "登出成功"
}
```

---

### 修改密码

**POST** `/api/auth/change-password`

**需要认证**: ✅ 是

**请求体**:
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**响应**:
```json
{
  "success": true,
  "message": "密码修改成功"
}
```

---

## 仪表盘接口 (Dashboard)

### 获取仪表盘列表

**GET** `/api/dashboards`

**需要认证**: ✅ 是

**查询参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| page | number | 页码，默认 1 |
| pageSize | number | 每页数量，默认 10 |
| status | string | 状态筛选 (DRAFT/PUBLISHED/ARCHIVED) |
| search | string | 搜索关键词 |

**响应**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": "uuid",
        "name": "string",
        "description": "string",
        "thumbnail": null,
        "isPublic": false,
        "status": "DRAFT",
        "owner": {
          "id": "uuid",
          "username": "string",
          "avatar": null
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

---

### 获取单个仪表盘

**GET** `/api/dashboards/:id`

**需要认证**: ✅ 是

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "config": {
      "width": 1920,
      "height": 1080,
      "background": "#000000",
      "components": []
    },
    "thumbnail": null,
    "isPublic": false,
    "status": "DRAFT",
    "owner": {
      "id": "uuid",
      "username": "string",
      "avatar": null
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 创建仪表盘

**POST** `/api/dashboards`

**需要认证**: ✅ 是

**请求体**:
```json
{
  "name": "string",
  "description": "string (可选)",
  "config": {
    "width": 1920,
    "height": 1080,
    "background": "#000000",
    "components": []
  }
}
```

**响应**:
```json
{
  "success": true,
  "message": "仪表盘创建成功",
  "data": { ... }
}
```

---

### 更新仪表盘

**PUT** `/api/dashboards/:id`

**需要认证**: ✅ 是

**请求体**:
```json
{
  "name": "string (可选)",
  "description": "string (可选)",
  "config": { ... } (可选),
  "status": "DRAFT|PUBLISHED|ARCHIVED (可选)",
  "isPublic": boolean (可选)
}
```

---

### 删除仪表盘

**DELETE** `/api/dashboards/:id`

**需要认证**: ✅ 是

**响应**:
```json
{
  "success": true,
  "message": "仪表盘删除成功"
}
```

---

### 复制仪表盘

**POST** `/api/dashboards/:id/duplicate`

**需要认证**: ✅ 是

**响应**:
```json
{
  "success": true,
  "message": "仪表盘复制成功",
  "data": { ... }
}
```

---

## 数据源接口 (DataSource)

### 获取数据源列表

**GET** `/api/data-sources`

**需要认证**: ✅ 是

**查询参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| page | number | 页码，默认 1 |
| pageSize | number | 每页数量，默认 10 |
| type | string | 类型筛选 (MYSQL/POSTGRESQL/REST_API/JSON/EXCEL/CSV) |
| status | string | 状态筛选 |

---

### 创建数据源

**POST** `/api/data-sources`

**需要认证**: ✅ 是

**请求体**:
```json
{
  "name": "string",
  "type": "MYSQL|POSTGRESQL|REST_API|JSON|EXCEL|CSV",
  "config": {
    "host": "string",
    "port": 3306,
    "database": "string",
    "username": "string",
    "password": "string",
    "ssl": false
  }
}
```

---

### 测试数据源连接

**POST** `/api/data-sources/:id/test`

**需要认证**: ✅ 是

**响应**:
```json
{
  "success": true,
  "message": "连接成功",
  "data": {
    "latency": 25,
    "lastTestedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 执行查询

**POST** `/api/data-sources/:id/query`

**需要认证**: ✅ 是

**请求体**:
```json
{
  "query": "SELECT * FROM table LIMIT 10",
  "params": []
}
```

---

## 用户接口 (User)

### 获取用户列表 (仅管理员)

**GET** `/api/users`

**需要认证**: ✅ 是

**需要管理员权限**: ✅ 是

---

### 获取指定用户

**GET** `/api/users/:id`

**需要认证**: ✅ 是

---

### 更新用户

**PUT** `/api/users/:id`

**需要认证**: ✅ 是

**请求体**:
```json
{
  "username": "string (可选)",
  "avatar": "string (可选)"
}
```

---

### 删除用户

**DELETE** `/api/users/:id`

**需要认证**: ✅ 是

**需要管理员权限**: ✅ 是

---

## 错误响应

所有接口的错误响应格式如下:

```json
{
  "success": false,
  "message": "错误信息"
}
```

**常见错误码**:

| 状态码 | 描述 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 (Token 无效或过期) |
| 403 | 没有权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 认证流程

1. **登录**: 使用邮箱密码登录，获取 `token` 和 `refreshToken`
2. **请求**: 在请求头中添加 `Authorization: Bearer <token>`
3. **刷新**: 当 `token` 过期时，使用 `refreshToken` 获取新 token

### 请求头示例

```http
GET /api/dashboards HTTP/1.1
Host: localhost:3001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```
