# Grafana 核心功能详细拆分

> 基于官方文档分析

---

## 1. 可视化类型 (Visualizations)

Grafana 内置 30+ 种可视化组件：

### 📈 图表类 (Graphs & Charts)
| 类型 | 用途 | BigScreen 现状 |
|------|------|---------------|
| Time Series | 时间序列（默认） | ✅ 折线图 |
| Bar Chart | 分类数据 | ✅ 柱状图 |
| Histogram | 值分布 | ✅ 直方图 |
| Heatmap | 热力图 | ✅ 热力图 |
| Pie Chart | 饼图 | ✅ 饼图 |
| Candlestick | K线图/金融 | ✅ K线图 |
| Gauge | 仪表盘 | ✅ 仪表盘 |
| Trend | 趋势图 | ❌ 需补充 |
| XY Chart | 任意XY坐标 | ✅ 散点图 |

### 📊 统计类 (Stats & Numbers)
| 类型 | 用途 |
|------|------|
| Stat | 大数字 + 迷你趋势线 |
| Bar Gauge | 水平/垂直条形仪表 |

### 🧩 其他 (Misc)
| 类型 | 用途 |
|------|------|
| Table | 表格数据 |
| Logs | 日志展示 |
| Node Graph | 关系图/网络图 |
| Traces | 链路追踪 |
| Flame Graph | 火焰图 |
| Canvas | 自由布局画布 |
| Geomap | 地理地图 |
| Datagrid | 数据网格 |

### 🧩 小组件 (Widgets)
| 类型 | 用途 |
|------|------|
| Dashboard List | 仪表盘列表 |
| Alert List | 告警列表 |
| Text | 文本/Markdown |
| News | RSS 订阅 |

---

## 2. 模板变量系统 (Template Variables)

### 变量类型
```typescript
// 1. 查询变量 - 从数据源获取
{
  name: "server",
  type: "query",
  query: "query_result(sql)",
  refresh: "on time range change"
}

// 2. 自定义变量
{
  name: "environment",
  type: "custom",
  options: ["dev", "staging", "prod"]
}

// 3. 文本变量
{
  name: "title",
  type: "textbox",
  default: "My Dashboard"
}

// 4. 常量变量
{
  name: "threshold",
  type: "constant",
  query: "80"
}
```

### 变量语法
```
$variable           // 单值
${variable}        // 带格式
${variable:regex}  // 正则过滤
$mulitple          // 多值逗号分隔
```

### 高级用法
```sql
-- 在查询中使用变量
SELECT * FROM metrics 
WHERE server =~ /^$server$/
AND time > $__timeFilter(from, to)

-- 变量级联
SELECT hostname FROM servers WHERE group = $group
```

---

## 3. 动态仪表盘 (Dynamic Dashboards)

### Panel 配置结构
```typescript
interface Panel {
  id: number;
  title: string;
  type: 'timeseries' | 'stat' | 'table' | ...;
  gridPos: { x: number; y: number; w: number; h: number };
  fieldConfig: {
    defaults: {
      unit: string;
      decimals: number;
      min: number;
      max: number;
      thresholds: Threshold[];
      mappings: ValueMapping[];
    };
  };
  transformations: DataTransformer[];
  alerts: AlertRule[];
}
```

### 布局系统
- **Grid 布局**: 12 列网格系统
- **Row**: 分组容器
- **Split**: 分屏对比

---

## 4. 数据源插件 (Data Source Plugins)

### 官方支持的数据源
| 数据源 | 类型 | 用途 |
|--------|------|------|
| Prometheus | 时序数据库 | 监控指标 |
| Loki | 日志系统 | 日志查询 |
| Elasticsearch | 搜索引擎 | 日志/搜索 |
| InfluxDB | 时序数据库 | IoT/监控 |
| PostgreSQL | 关系数据库 | 业务数据 |
| MySQL | 关系数据库 | 业务数据 |
| Graphite | 时序数据库 | 监控 |
| Jaeger | 链路追踪 | 分布式追踪 |
| Tempo | 链路追踪 | 分布式追踪 |

### 插件开发接口
```typescript
interface DataSourcePlugin<TQuery extends DataQuery = DataQuery> {
  // 查询方法
  query(request: DataQueryRequest<TQuery>): Promise<DataResponse>;
  
  // 测试连接
  testDatasource(): Promise<TestResult>;
  
  // 指标查询构建器
  metricsQueryBuild?: QueryBuilder;
  
  // 告警支持
  alertEditor?: AlertEditorConfig;
}
```

---

## 5. 告警系统 (Alerting)

### 告警规则结构
```typescript
interface AlertRule {
  id: number;
  title: string;
  condition: string;        // PromQL 条件
  evaluationInterval: string; // 评估间隔
  for: string;            // 持续时间
  annotations: {
    summary: string;
    description: string;
  };
  labels: {
    severity: 'critical' | 'warning' | 'info';
    team: string;
  };
  notifications: NotificationChannel[];
}
```

### 通知渠道
- 📱 Slack
- 💬 Microsoft Teams
- 📧 Email
- 🔔 PagerDuty
- 📞 VictorOps
- 🔒 OpsGenie
- 💬 DingTalk (钉钉)
- 📤 Webhook

---

## 6. 权限系统 (Permissions)

### 角色层级
```
Organization
├── Admin (组织管理员)
│   ├── 可管理所有仪表盘
│   ├── 可管理用户
│   └── 可管理数据源
├── Editor (编辑者)
│   ├── 可创建/编辑仪表盘
│   └── 可创建告警
└── Viewer (查看者)
    └── 只读访问
```

### 行级安全 (RLS)
```sql
-- 数据源级别行级控制
SELECT * FROM orders 
WHERE org_id = $__user.org_id
AND team_id IN ($__user.teams)
```

---

## 7. 实时数据推送

### WebSocket 实现
```typescript
// Grafana Live WebSocket
interface LiveChannel {
  id: string;           // channel path
  pluginId: string;     // data source plugin
  path: string;         // stream path
  
  subscribe(callback: (msg: DataFrame) => void): void;
  publish(data: any): void;
}

// 前端订阅
const channel = grafana.live.connect('/stream/metrics');
channel.subscribe((data) => {
  updateChart(data);
});
```

---

## 8. Panel 插件开发

### 创建插件
```typescript
// panel-plugin.ts
import { PanelPlugin } from '@grafana/data';

export const MyCustomPanel = new PanelPlugin(MyPanelComponent)
  .setPanelOptions((builder) => {
    builder.addTextInput({
      path: 'title',
      name: 'Title',
      defaultValue: 'My Panel',
    });
    builder.addNumberInput({
      path: 'threshold',
      name: 'Alert Threshold',
      defaultValue: 80,
    });
  });
```

### 生命周期
```typescript
interface PanelPluginMeta {
  id: string;
  name: string;
  info: {
    version: string;
    logos: { small: string; large: string };
    description: string;
  };
}
```

---

## 总结：BigScreen 可借鉴功能优先级

| 功能 | 复杂度 | 优先级 | 实现建议 |
|------|--------|--------|----------|
| 模板变量 | 中 | P0 | 下拉筛选 + 变量替换 |
| 更多图表类型 | 低 | P1 | 添加 Trend、Canvas、Geomap |
| Panel 配置面板 | 低 | P1 | 复用现有组件库 |
| 实时数据推送 | 高 | P2 | WebSocket 实现 |
| 多数据源支持 | 高 | P2 | 插件化架构 |
| 告警系统 | 中 | P3 | 阈值告警 |
| 权限系统 | 中 | P3 | RBAC |
| 仪表盘模板 | 低 | P3 | 预设模板 JSON |
