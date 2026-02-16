/**
 * 组件请求验证器
 */

import { IsString, IsOptional, IsObject, IsEnum, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { ComponentType } from '../types';

/**
 * 创建组件验证
 */
export class CreateComponentValidator {
  @IsString({ message: '名称必须是字符串' })
  name!: string;

  @IsEnum(ComponentType, { message: '无效的组件类型' })
  type!: ComponentType;

  @IsNumber({}, { message: 'x坐标必须是数字' })
  @Min(0, { message: 'x坐标不能小于0' })
  x!: number;

  @IsNumber({}, { message: 'y坐标必须是数字' })
  @Min(0, { message: 'y坐标不能小于0' })
  y!: number;

  @IsNumber({}, { message: '宽度必须是数字' })
  @Min(1, { message: '宽度不能小于1' })
  width!: number;

  @IsNumber({}, { message: '高度必须是数字' })
  @Min(1, { message: '高度不能小于1' })
  height!: number;

  @IsOptional()
  @IsObject({ message: '配置必须是对象' })
  config?: Record<string, unknown>;

  @IsOptional()
  @IsObject({ message: '数据必须是对象' })
  data?: Record<string, unknown>;

  @IsOptional()
  @IsUUID('4', { message: '数据源ID必须是有效的UUID' })
  datasourceId?: string;

  @IsOptional()
  @IsNumber({}, { message: '排序顺序必须是数字' })
  sortOrder?: number;
}

/**
 * 更新组件验证
 */
export class UpdateComponentValidator {
  @IsOptional()
  @IsString({ message: '名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'x坐标必须是数字' })
  @Min(0, { message: 'x坐标不能小于0' })
  x?: number;

  @IsOptional()
  @IsNumber({}, { message: 'y坐标必须是数字' })
  @Min(0, { message: 'y坐标不能小于0' })
  y?: number;

  @IsOptional()
  @IsNumber({}, { message: '宽度必须是数字' })
  @Min(1, { message: '宽度不能小于1' })
  width?: number;

  @IsOptional()
  @IsNumber({}, { message: '高度必须是数字' })
  @Min(1, { message: '高度不能小于1' })
  height?: number;

  @IsOptional()
  @IsObject({ message: '配置必须是对象' })
  config?: Record<string, unknown>;

  @IsOptional()
  @IsObject({ message: '数据必须是对象' })
  data?: Record<string, unknown>;

  @IsOptional()
  @IsUUID('4', { message: '数据源ID必须是有效的UUID' })
  datasourceId?: string;

  @IsOptional()
  @IsNumber({}, { message: '排序顺序必须是数字' })
  sortOrder?: number;
}
