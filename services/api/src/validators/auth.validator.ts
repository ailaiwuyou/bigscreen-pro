/**
 * 认证请求验证器
 */

import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

/**
 * 登录请求验证
 */
export class LoginValidator {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password!: string;
}

/**
 * 注册请求验证
 */
export class RegisterValidator {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度不能少于3位' })
  @MaxLength(20, { message: '用户名长度不能超过20位' })
  username!: string;

  @IsString({ message: '密码必须是字符串' })
  @MinLength(8, { message: '密码长度不能少于8位' })
  password!: string;

  @IsOptional()
  @IsString({ message: '显示名称必须是字符串' })
  displayName?: string;
}

/**
 * 刷新令牌验证
 */
export class RefreshTokenValidator {
  @IsString({ message: '刷新令牌必须是字符串' })
  refreshToken!: string;
}
