/**
 * 组件类型定义
 */

import type { ID, Position, Size, Status, Color, Animation, CSSVariables, KeyValue, TreeNode } from './basic';

/** 组件类型 */
export type ComponentType = 
  // 图表组件
  | 'line-chart' | 'bar-chart' | 'pie-chart' | 'scatter-chart'
  | 'radar-chart' | 'heatmap-chart' | 'treemap-chart' | 'sankey-chart'
  | 'funnel-chart' | 'gauge-chart' | 'map-chart' | '3d-chart'
  // 表格组件
  | 'table' | 'pivot-table' | 'scroll-table' | 'tree-table'
  // 文本组件
  | 'text' | 'rich-text' | 'title' | 'paragraph' | 'number' | 'timer'
  // 媒体组件
  | 'image' | 'gallery' | 'video' | 'audio' | 'iframe' | 'pdf'
  // 装饰组件
  | 'border' | 'divider' | 'icon' | 'svg' | 'shape' | 'particle'
  // 表单组件
  | 'button' | 'input' | 'select' | 'checkbox' | 'radio' | 'slider' | 'date-picker'
  // 容器组件
  | 'container' | 'card' | 'tabs' | 'accordion' | 'modal' | 'drawer' | 'popover'
  // 自定义组件
  | 'custom';

/** 组件分类 */
export type ComponentCategory = 
  | 'chart'      // 图表
  | 'table'      // 表格
  | 'text'       // 文本
  | 'media'      // 媒体
  | 'decoration' // 装饰
  | 'form'       // 表单
  | 'container'  // 容器
  | 'custom';    // 自定义

/** 组件配置 */
export interface ComponentConfig {
  /** 基础属性 */
  id: ID;
  type: ComponentType;
  category: ComponentCategory;
  name: string;
  description?: string;
  
  /** 布局属性 */
  position: Position;
  size: Size;
  rotation?: number;
  scale?: { x: number; y: number };
  
  /** 样式属性 */
  style: ComponentStyle;
  
  /** 数据配置 */
  data: ComponentData;
  
  /** 交互配置 */
  events: ComponentEvent[];
  
  /** 动画配置 */
  animation?: Animation;
  
  /** 高级配置 */
  advanced?: AdvancedConfig;
  
  /** 元数据 */
  meta: ComponentMeta;
}

/** 组件样式 */
export interface ComponentStyle {
  /** 背景 */
  background?: {
    type: 'solid' | 'gradient' | 'image' | 'transparent';
    color?: Color;
    gradient?: {
      type: 'linear' | 'radial';
      angle?: number;
      stops: Array<{ offset: number; color: Color }>;
    };
    image?: string;
    repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
    size?: 'cover' | 'contain' | string;
    position?: string;
  };
  
  /** 边框 */
  border?: {
    width: number;
    style: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
    color: Color;
    radius?: number | [number, number, number, number];
  };
  
  /** 阴影 */
  shadow?: {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: Color;
    inset?: boolean;
  };
  
  /** 透明度 */
  opacity?: number;
  
  /** 变换 */
  transform?: {
    translate?: { x: number; y: number };
    rotate?: number;
    scale?: { x: number; y: number };
    skew?: { x: number; y: number };
  };
  
  /** 滤镜 */
  filter?: {
    blur?: number;
    brightness?: number;
    contrast?: number;
    grayscale?: number;
    hueRotate?: number;
    invert?: number;
    opacity?: number;
    saturate?: number;
    sepia?: number;
  };
  
  /** 光标 */
  cursor?: string;
  
  /** 溢出 */
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  /** Z-index */
  zIndex?: number;
  
  /** 其他CSS变量 */
  cssVariables?: CSSVariables;
}

/** 组件数据 */
export interface ComponentData {
  /** 数据源类型 */
  source: 'static' | 'api' | 'websocket' | 'excel' | 'database' | 'function';
  
  /** 静态数据 */
  staticData?: unknown;
  
  /** API配置 */
  apiConfig?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
    body?: unknown;
    timeout?: number;
    retry?: number;
    polling?: boolean;
    pollingInterval?: number;
  };
  
  /** WebSocket配置 */
  websocketConfig?: {
    url: string;
    protocols?: string[];
    reconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
  };
  
  /** 数据处理 */
  dataHandler?: {
    /** 数据路径 (例如: data.items) */
    path?: string;
    /** 数据转换函数 */
    transform?: string; // 函数字符串
    /** 数据过滤 */
    filter?: string; // 函数字符串
    /** 数据排序 */
    sort?: {
      field: string;
      order: 'asc' | 'desc';
    };
    /** 数据限制 */
    limit?: number;
  };
  
  /** 数据映射 */
  fieldMapping?: Record<string, string>;
  
  /** 缓存配置 */
  cache?: {
    enabled: boolean;
    ttl: number; // 秒
  };
  
  /** Mock数据 (开发环境使用) */
  mock?: unknown;
}

/** 组件事件 */
export interface ComponentEvent {
  /** 事件类型 */
  type: 'click' | 'dblclick' | 'mouseover' | 'mouseout' | 'mousedown' | 'mouseup' | 'mousemove' | 'keydown' | 'keyup' | 'scroll' | 'resize' | 'focus' | 'blur' | 'change' | 'input' | 'submit' | 'load' | 'error' | 'animationstart' | 'animationend' | 'transitionend' | 'drag' | 'drop' | 'dragover' | 'dragleave' | 'dragenter' | 'dragstart' | 'dragend' | 'custom';
  
  /** 事件名称 */
  name: string;
  
  /** 事件处理器 */
  handler: string; // 函数字符串
  
  /** 是否冒泡 */
  bubbles?: boolean;
  
  /** 是否阻止默认行为 */
  preventDefault?: boolean;
  
  /** 是否阻止冒泡 */
  stopPropagation?: boolean;
  
  /** 事件修饰符 */
  modifiers?: {
    stop?: boolean;
    prevent?: boolean;
    capture?: boolean;
    self?: boolean;
    once?: boolean;
    passive?: boolean;
    native?: boolean;
  };
  
  /** 事件参数 */
  params?: Record<string, unknown>;
  
  /** 事件触发条件 */
  condition?: string; // 条件表达式
  
  /** 防抖配置 */
  debounce?: {
    wait: number;
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  };
  
  /** 节流配置 */
  throttle?: {
    wait: number;
    leading?: boolean;
    trailing?: boolean;
  };
  
  /** 错误处理 */
  errorHandler?: string; // 错误处理函数
}

/** 高级配置 */
export interface AdvancedConfig {
  /** 性能优化 */
  performance?: {
    /** 虚拟滚动 */
    virtualScroll?: boolean;
    /** 懒加载 */
    lazy?: boolean;
    /** 防抖渲染 */
    debounceRender?: number;
    /** 节流渲染 */
    throttleRender?: number;
    /** 缓存策略 */
    cache?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  };
  
  /** 安全防护 */
  security?: {
    /** XSS防护 */
    xss?: boolean;
    /** CSRF防护 */
    csrf?: boolean;
    /** 内容安全策略 */
    csp?: string;
    /** 沙箱隔离 */
    sandbox?: boolean;
  };
  
  /** 无障碍访问 */
  accessibility?: {
    /** ARIA标签 */
    aria?: boolean;
    /** 键盘导航 */
    keyboard?: boolean;
    /** 屏幕阅读器支持 */
    screenReader?: boolean;
    /** 高对比度模式 */
    highContrast?: boolean;
    /** 焦点指示器 */
    focusIndicator?: boolean;
  };
  
  /** 国际化 */
  i18n?: {
    /** 支持的语言 */
    locales: string[];
    /** 默认语言 */
    defaultLocale: string;
    /** 回退语言 */
    fallbackLocale: string;
    /** 日期格式 */
    dateFormat: string;
    /** 时间格式 */
    timeFormat: string;
    /** 数字格式 */
    numberFormat: string;
    /** 货币格式 */
    currencyFormat: string;
  };
  
  /** 自定义配置 */
  custom?: Record<string, unknown>;
}

/** 组件元数据 */
export interface ComponentMeta {
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 创建者 */
  createdBy: string;
  /** 更新者 */
  updatedBy: string;
  /** 版本号 */
  version: string;
  /** 是否已发布 */
  isPublished: boolean;
  /** 发布版本 */
  publishVersion?: string;
  /** 发布时间 */
  publishedAt?: string;
  /** 发布者 */
  publishedBy?: string;
  /** 标签 */
  tags: string[];
  /** 分类 */
  category: string;
  /** 描述 */
  description: string;
  /** 文档链接 */
  docsUrl?: string;
  /** 预览图 */
  thumbnail?: string;
  /** 截图 */
  screenshots?: string[];
  /** 示例 */
  examples?: Array<{
    name: string;
    description: string;
    config: unknown;
  }>;
}