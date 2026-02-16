/**
 * 画布类型定义
 * 定义编辑器画布相关的所有类型
 */

import type { ID, Position, Size } from './basic';
import type { ComponentConfig } from './component';

/** 画布模式 */
export type CanvasMode = 'edit' | 'preview' | 'present';

/** 画布网格配置 */
export interface GridConfig {
  /** 是否显示网格 */
  visible: boolean;
  /** 网格大小 */
  size: number;
  /** 网格颜色 */
  color: string;
  /** 是否吸附到网格 */
  snap: boolean;
  /** 吸附阈值 */
  snapThreshold: number;
}

/** 画布标尺配置 */
export interface RulerConfig {
  /** 是否显示标尺 */
  visible: boolean;
  /** 标尺单位 */
  unit: 'px' | 'cm' | 'mm' | 'in';
  /** 刻度间距 */
  step: number;
}

/** 画布视图配置 */
export interface ViewConfig {
  /** 缩放比例 */
  zoom: number;
  /** 最小缩放 */
  minZoom: number;
  /** 最大缩放 */
  maxZoom: number;
  /** 视图偏移 */
  offset: Position;
  /** 画布尺寸 */
  size: Size;
  /** 背景颜色 */
  backgroundColor: string;
  /** 背景图片 */
  backgroundImage?: string;
}

/** 对齐线配置 */
export interface AlignmentConfig {
  /** 是否显示对齐线 */
  enabled: boolean;
  /** 对齐阈值 */
  threshold: number;
  /** 对齐类型 */
  types: ('left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY')[];
}

/** 画布状态 */
export interface CanvasState {
  /** 模式 */
  mode: CanvasMode;
  /** 视图配置 */
  view: ViewConfig;
  /** 网格配置 */
  grid: GridConfig;
  /** 标尺配置 */
  ruler: RulerConfig;
  /** 对齐配置 */
  alignment: AlignmentConfig;
  /** 选中组件ID列表 */
  selectedIds: ID[];
  /** 悬停组件ID */
  hoveredId?: ID;
  /** 聚焦组件ID */
  focusedId?: ID;
  /** 拖拽中的组件 */
  draggingIds: ID[];
  /** 调整大小中的组件 */
  resizingIds: ID[];
  /** 旋转中的组件 */
  rotatingIds: ID[];
  /** 是否显示组件轮廓 */
  showOutlines: boolean;
  /** 是否显示组件名称 */
  showLabels: boolean;
  /** 是否显示网格 */
  showGrid: boolean;
  /** 是否吸附到网格 */
  snapToGrid: boolean;
  /** 历史记录索引 */
  historyIndex: number;
  /** 是否可以撤销 */
  canUndo: boolean;
  /** 是否可以重做 */
  canRedo: boolean;
  /** 剪贴板内容 */
  clipboard?: {
    type: 'cut' | 'copy';
    components: ComponentConfig[];
  };
}

/** 画布历史记录项 */
export interface HistoryItem {
  /** 唯一标识 */
  id: ID;
  /** 动作类型 */
  action: string;
  /** 动作描述 */
  description: string;
  /** 时间戳 */
  timestamp: number;
  /** 组件快照 */
  components: ComponentConfig[];
  /** 选中状态 */
  selectedIds: ID[];
}

/** 画布快捷键 */
export interface KeyboardShortcut {
  /** 快捷键ID */
  id: string;
  /** 快捷键名称 */
  name: string;
  /** 快捷键描述 */
  description: string;
  /** 按键组合 */
  keys: string[];
  /** 是否可自定义 */
  customizable: boolean;
  /** 动作 */
  action: () => void;
}

/** 画布工具 */
export type CanvasTool = 
  | 'select'      // 选择工具
  | 'hand'        // 抓手工具
  | 'zoom-in'     // 放大工具
  | 'zoom-out'    // 缩小工具
  | 'line'        // 直线工具
  | 'rect'        // 矩形工具
  | 'circle'      // 圆形工具
  | 'text'        // 文本工具
  | 'image'       // 图片工具
  | 'pencil'      // 铅笔工具
  | 'eraser';     // 橡皮擦工具

/** 画布导出配置 */
export interface ExportConfig {
  /** 导出类型 */
  type: 'image' | 'pdf' | 'json' | 'html';
  /** 文件名称 */
  filename: string;
  /** 图片质量 (仅图片) */
  quality?: number;
  /** 缩放比例 (仅图片) */
  scale?: number;
  /** 包含背景 */
  includeBackground?: boolean;
  /** 包含网格 */
  includeGrid?: boolean;
  /** 选中区域导出 */
  selectedOnly?: boolean;
}

/** 画布导入配置 */
export interface ImportConfig {
  /** 导入类型 */
  type: 'json' | 'image' | 'svg';
  /** 文件数据 */
  file: File | string;
  /** 保持原始尺寸 */
  keepOriginalSize?: boolean;
  /** 导入位置 */
  position?: Position;
}