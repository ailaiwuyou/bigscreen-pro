/**
 * 基础类型定义
 */

/** 唯一标识符 */
export type ID = string;

/** 时间戳 */
export type Timestamp = string;

/** 状态 */
export type Status = 'active' | 'inactive' | 'deleted';

/** 坐标位置 */
export interface Position {
  x: number;
  y: number;
}

/** 尺寸 */
export interface Size {
  width: number;
  height: number;
}

/** 边框 */
export interface Border {
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
}

/** 圆角 */
export type Radius = number | [number, number, number, number];

/** 阴影 */
export interface Shadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

/** 字体 */
export interface Font {
  family: string;
  size: number;
  weight: 'normal' | 'bold' | 'lighter' | number;
  style: 'normal' | 'italic';
  lineHeight: number;
  color: string;
}

/** 对齐方式 */
export type Align = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'middle' | 'bottom';

/** 颜色 */
export type Color = string;
export type ColorGradient = {
  type: 'linear' | 'radial';
  colors: Array<{ offset: number; color: string }>;
};

/** 动画 */
export interface Animation {
  name: string;
  duration: number;
  delay: number;
  easing: string;
  iterationCount: number | 'infinite';
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

/** 分页参数 */
export interface Pagination {
  page: number;
  limit: number;
}

/** 分页结果 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** 排序 */
export interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

/** 过滤 */
export interface Filter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: unknown;
}

/** 树形结构 */
export interface TreeNode<T> {
  id: ID;
  data: T;
  children?: TreeNode<T>[];
  parentId?: ID;
  level: number;
  expanded?: boolean;
  selected?: boolean;
}

/** 键值对 */
export interface KeyValue {
  key: string;
  value: unknown;
}

/** 范围 */
export interface Range<T> {
  min: T;
  max: T;
}

/** 响应式断点 */
export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

/** 边距 */
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** 内边距 */
export type Padding = Margin;

/** 响应式单位 */
export type ResponsiveUnit = number | string | { value: number; unit: 'px' | '%' | 'vw' | 'vh' | 'rem' };

/** CSS 变量 */
export type CSSVariables = Record<string, string>;

/** 主题模式 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/** 语言 */
export type Language = 'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP' | 'ko-KR';

/** 时区 */
export type Timezone = string;

/** 货币 */
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
}

/** 单位 */
export interface Unit {
  name: string;
  symbol: string;
  factor: number;
}