/**
 * 仪表盘类型定义
 */

import type { ID, Position, Size, Status, KeyValue, TreeNode, PaginatedResult } from './basic';
import type { ComponentConfig } from './component';

/** 仪表盘布局类型 */
export type DashboardLayout = 'free' | 'grid' | 'absolute';

/** 仪表盘画布配置 */
export interface DashboardCanvas {
  /** 画布尺寸 */
  size: Size;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 背景图片 */
  backgroundImage?: string;
  /** 背景大小 */
  backgroundSize?: 'cover' | 'contain' | string;
  /** 背景位置 */
  backgroundPosition?: string;
  /** 背景重复 */
  backgroundRepeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
}

/** 仪表盘网格配置 */
export interface DashboardGrid {
  /** 是否启用网格 */
  enabled: boolean;
  /** 网格大小 */
  size: number;
  /** 网格颜色 */
  color: string;
  /** 是否显示网格 */
  visible: boolean;
  /** 是否吸附到网格 */
  snap: boolean;
  /** 吸附阈值 */
  snapThreshold: number;
}

/** 仪表盘配置 */
export interface DashboardConfig {
  /** 布局类型 */
  layout: DashboardLayout;
  /** 画布配置 */
  canvas: DashboardCanvas;
  /** 网格配置 */
  grid: DashboardGrid;
  /** 主题ID */
  themeId?: ID;
  /** 自定义CSS */
  customCSS?: string;
  /** 自定义JS */
  customJS?: string;
}

/** 仪表盘分享配置 */
export interface DashboardShare {
  /** 是否公开 */
  isPublic: boolean;
  /** 访问密码 */
  password?: string;
  /** 分享链接 */
  link?: string;
  /** 过期时间 */
  expiresAt?: string;
  /** 访问次数限制 */
  maxViews?: number;
  /** 当前访问次数 */
  viewCount?: number;
  /** 允许的操作 */
  allowedOperations?: Array<'view' | 'export' | 'share'>;
}

/** 仪表盘版本 */
export interface DashboardVersion {
  /** 版本ID */
  id: ID;
  /** 版本号 */
  version: string;
  /** 版本描述 */
  description?: string;
  /** 创建时间 */
  createdAt: string;
  /** 创建者 */
  createdBy: string;
  /** 组件快照 */
  components: ComponentConfig[];
  /** 配置快照 */
  config: DashboardConfig;
}

/** 仪表盘 */
export interface Dashboard {
  /** ID */
  id: ID;
  /** 标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 封面图 */
  cover?: string;
  /** 状态 */
  status: Status;
  /** 配置 */
  config: DashboardConfig;
  /** 组件列表 */
  components: ComponentConfig[];
  /** 分享配置 */
  share: DashboardShare;
  /** 版本历史 */
  versions: DashboardVersion[];
  /** 父仪表盘ID (用于复制) */
  parentId?: ID;
  /** 标签 */
  tags: string[];
  /** 排序权重 */
  sortOrder: number;
  /** 访问次数 */
  viewCount: number;
  /** 创建者 */
  createdBy: string;
  /** 更新者 */
  updatedBy: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/** 创建仪表盘请求 */
export interface CreateDashboardRequest {
  title: string;
  description?: string;
  config?: Partial<DashboardConfig>;
  parentId?: ID;
  tags?: string[];
}

/** 更新仪表盘请求 */
export interface UpdateDashboardRequest {
  title?: string;
  description?: string;
  cover?: string;
  status?: Status;
  config?: Partial<DashboardConfig>;
  components?: ComponentConfig[];
  share?: Partial<DashboardShare>;
  tags?: string[];
  sortOrder?: number;
}

/** 仪表盘列表查询 */
export interface DashboardListQuery {
  keyword?: string;
  status?: Status;
  tags?: string[];
  createdBy?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

/** 仪表盘列表结果 */
export type DashboardListResult = PaginatedResult<Dashboard>;

/** 仪表盘统计数据 */
export interface DashboardStatistics {
  total: number;
  active: number;
  inactive: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  popularDashboards: Array<{
    id: ID;
    title: string;
    viewCount: number;
  }>;
}