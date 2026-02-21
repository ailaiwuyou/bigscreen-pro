# Big Screen Pro API 文档

## 基础信息

- **基础URL**: `http://localhost:3001/api/v1`
- **认证方式**: Bearer Token (JWT)
- **文档地址**: `http://localhost:3001/api-docs`

## 认证接口

### 1. 用户注册

**POST** `/auth/register`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800
  },
  "message": "注册成功"
}
```

### 2. 用户登录

**POST** `/auth/login`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800
  },
  "message": "登录成功"
}
```

### 3. 刷新Token

**POST** `/auth/refresh`

**请求体**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 4. 退出登录

**POST** `/auth/logout`

**请求体**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 仪表盘接口

### 1. 创建仪表盘

**POST** `/dashboards`

**请求头**:
```
Authorization: Bearer {accessToken}
```

**请求体**:
```json
{
  "name": "销售数据看板",
  "description": "2024年销售数据分析",
  "category": "sales",
  "config": {
    "layout": "grid",
    "theme": "dark",
    "background": "#1a1a2e",
    "refreshInterval": 30
  },
  "isPublic": false
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "销售数据看板",
    "description": "2024年销售数据分析",
    "category": "sales",
    "config": {
      "layout": "grid",
      "theme": "dark",
      "background": "#1a1a2e",
      "refreshInterval": 30
    },
    "status": "draft",
    "isPublic": false,
    "userId": "uuid",
    "createdAt": "2024-01-15T08:30:00Z",
    "updatedAt": "2024-01-15T08:30:00Z"
  },
  "message": "仪表盘创建成功"
}
```

### 2. 获取仪表盘列表

**GET** `/dashboards`

**请求头**:
```
Authorization: Bearer {accessToken}
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `pageSize`: 每页数量 (默认: 10)
- `keyword`: 搜索关键词
- `status`: 状态过滤 (draft/published/archived)
- `category`: 分类过滤

**响应**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": "uuid",
        "name": "销售数据看板",
        "description": "2024年销售数据分析",
        "category": "sales",
        "status": "published",
        "isPublic": false,
        "user": {
          "id": "uuid",
          "username": "admin",
          "nickname": "管理员",
          "avatar": "https://example.com/avatar.png"
        },
        "createdAt": "2024-01-15T08:30:00Z",
        "updatedAt": "2024-01-15T08:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 3. 获取仪表盘详情

**GET** `/dashboards/:id`

**请求头**:
```
Authorization: Bearer {accessToken}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "销售数据看板",
    "description": "2024年销售数据分析",
    "category": "sales",
    "config": {
      "layout": "grid",
      "theme": "dark",
      "background": "#1a1a2e",
      "refreshInterval": 30
    },
    "status": "published",
    "isPublic": false,
    "userId": "uuid",
    "user": {
      "id": "uuid",
      "username": "admin",
      "nickname": "管理员",
      "avatar": "https://example.com/avatar.png"
    },
    "components": [],
    "createdAt": "2024-01-15T08:30:00Z",
    "updatedAt": "2024-01-15T08:30:00Z"
  }
}
```

### 4. 更新仪表盘

**PUT** `/dashboards/:id`

**请求头**:
```
Authorization: Bearer {accessToken}
```

**请求体**:
```json
{
  "name": "销售数据看板 - 更新",
  "description": "2024年销售数据分析 - 已更新",
  "config": {
    "layout": "grid",
    "theme": "light",
    "background": "#ffffff",
    "refreshInterval": 60
  }
}
```

### 5. 删除仪表盘

**DELETE** `/dashboards/:id`

**请求头**:
```
Authorization: Bearer {accessToken}
```

**响应**:
```json
{
  "success": true,
  "message": "仪表盘删除成功"
}
```

### 6. 发布仪表盘

**POST** `/dashboards/:id/publish`

**请求头**:
```
Authorization: Bearer {accessToken}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "published",
    "publishedAt": "2024-01-15T08:30:00Z"
  },
  "message": "仪表盘发布成功"
}
```

### 7. 取消发布仪表盘

**POST** `/dashboards/:id/unpublish`

**请求头**:
```
Authorization: Bearer {accessToken}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "draft",
    "publishedAt": null
  },
  "message": "仪表盘已取消发布"
}
```

## 数据源接口

### 1. 创建数据源

**POST** `/datasources`

**请求头**:
```
Authorization: Bearer {accessToken}
```

**请求体**:
```json
{
  "name": "MySQL 生产数据库",
  "type": "mysql",
  "description": "生产环境 MySQL 数据库",
  "config": {
