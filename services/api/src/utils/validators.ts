/**
 * 验证工具函数
 * 常用的数据验证函数
 */

import validator from 'validator';

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 */
export const isValidEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

/**
 * 验证密码强度
 * 要求：至少8位，包含大小写字母、数字
 * @param password 密码
 */
export const isStrongPassword = (password: string): boolean => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  });
};

/**
 * 获取密码强度得分 (0-100)
 * @param password 密码
 */
export const getPasswordStrength = (password: string): number => {
  let score = 0;
  
  // 长度得分
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // 复杂度得分
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 10;
  
  return Math.min(score, 100);
};

/**
 * 验证用户名
 * 要求：3-20位，只能包含字母、数字、下划线
 * @param username 用户名
 */
export const isValidUsername = (username: string): boolean => {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
};

/**
 * 验证手机号
 * 支持中国大陆手机号
 * @param phone 手机号
 */
export const isValidPhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

/**
 * 验证URL
 * @param url URL地址
 * @param options 验证选项
 */
export const isValidUrl = (
  url: string,
  options?: {
    protocols?: string[];
    require_tld?: boolean;
    require_protocol?: boolean;
  }
): boolean => {
  return validator.isURL(url, options);
};

/**
 * 验证IP地址
 * @param ip IP地址
 * @param version IP版本 (4或6)
 */
export const isValidIP = (ip: string, version?: 4 | 6): boolean => {
  if (version === 4) {
    return validator.isIP(ip, 4);
  } else if (version === 6) {
    return validator.isIP(ip, 6);
  }
  return validator.isIP(ip);
};

/**
 * 验证JSON字符串
 * @param str 字符串
 */
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * 验证UUID
 * @param uuid UUID字符串
 * @param version UUID版本
 */
export const isValidUUID = (uuid: string, version?: 3 | 4 | 5): boolean => {
  return validator.isUUID(uuid, version);
};

/**
 * 验证Hex颜色
 * @param color 颜色值
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * 验证Base64字符串
 * @param str 字符串
 */
export const isValidBase64 = (str: string): boolean => {
  return validator.isBase64(str);
};

/**
 * 验证MongoDB ObjectId
 * @param id ID字符串
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * 验证日期字符串
 * @param date 日期字符串
 */
export const isValidDate = (date: string): boolean => {
  return !isNaN(Date.parse(date));
};

/**
 * 验证枚举值
 * @param value 值
 * @param validValues 有效值数组
 */
export const isValidEnum = <T>(value: T, validValues: T[]): boolean => {
  return validValues.includes(value);
};

/**
 * 验证字符串长度
 * @param str 字符串
 * @param min 最小长度
 * @param max 最大长度
 */
export const isValidLength = (str: string, min: number, max: number): boolean => {
  const length = str.length;
  return length >= min && length <= max;
};

/**
 * 验证数值范围
 * @param num 数值
 * @param min 最小值
 * @param max 最大值
 */
export const isInRange = (num: number, min: number, max: number): boolean => {
  return num >= min && num <= max;
};

/**
 * 验证数组非空
 * @param arr 数组
 */
export const isNonEmptyArray = <T>(arr: T[]): boolean => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * 验证对象非空
 * @param obj 对象
 */
export const isNonEmptyObject = (obj: Record<string, unknown>): boolean => {
  return Object.keys(obj).length > 0;
};

/**
 * 验证字符串非空
 * @param str 字符串
 */
export const isNonEmptyString = (str: string): boolean => {
  return typeof str === 'string' && str.trim().length > 0;
};

// 默认导出所有验证函数
export default {
  isValidEmail,
  isStrongPassword,
  getPasswordStrength,
  isValidUsername,
  isValidPhone,
  isValidUrl,
  isValidIP,
  isValidJSON,
  isValidUUID,
  isValidHexColor,
  isValidBase64,
  isValidObjectId,
  isValidDate,
  isValidEnum,
  isValidLength,
  isInRange,
  isNonEmptyArray,
  isNonEmptyObject,
  isNonEmptyString,
};
