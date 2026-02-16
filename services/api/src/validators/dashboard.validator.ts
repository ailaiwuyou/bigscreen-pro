/**
 * 仪表盘请求验证器
 */

import { IsString, IsOptional, IsObject, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { DashboardStatus } from '../types';

/**
 * 创建仪表盘验证
 */
export class CreateDashboardValidator {
  @IsString({ message: '名称必须是字符串' })
  name!: string;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsObject({ message: '配置必须是对象' })
  config?: Record<string, unknown>;

  @IsOptional()
  @IsUUID('4', { message: '主题ID必须是有效的UUID' })
  themeId?: string;
}

/**
 * 更新仪表盘验证
 */
export class UpdateDashboardValidator {
  @IsOptional()
  @IsString({ message: '名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsObject({ message: '配置必须是对象' })
  config?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(DashboardStatus, { message: '无效的状态值' })
  status?: DashboardStatus;

  @IsOptional()
  @IsBoolean({ message: 'isPublic必须是布尔值' })
  isPublic?: boolean;

  @IsOptional()
  @IsUUID('4', { message: '主题ID必须是有效的UUID' })
  themeId?: string;
}
