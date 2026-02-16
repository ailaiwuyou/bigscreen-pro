/**
 * 安全工具函数
 * 提供加密、解密、哈希等安全相关功能
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { securityConfig } from '../config';

/**
 * 使用bcrypt对密码进行哈希
 * @param password 明文密码
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, securityConfig.bcryptSaltRounds);
};

/**
 * 验证密码
 * @param password 明文密码
 * @param hashedPassword 哈希后的密码
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * 生成安全随机字符串
 * @param length 长度
 * @param encoding 编码
 */
export const generateSecureRandom = (
  length: number = 32,
  encoding: BufferEncoding = 'hex'
): string => {
  return crypto.randomBytes(length).toString(encoding);
};

/**
 * 生成AES密钥
 * @param length 密钥长度 (16, 24, 或 32)
 */
export const generateAESKey = (length: 16 | 24 | 32 = 32): Buffer => {
  return crypto.randomBytes(length);
};

/**
 * 使用AES-256-GCM加密数据
 * @param data 明文数据
 * @param key 密钥 (32字节)
 * @returns 加密后的数据 (格式: iv:authTag:ciphertext)
 */
export const encryptAES = (data: string, key: Buffer): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // 格式: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * 使用AES-256-GCM解密数据
 * @param encryptedData 加密数据 (格式: iv:authTag:ciphertext)
 * @param key 密钥 (32字节)
 * @returns 解密后的明文
 */
export const decryptAES = (encryptedData: string, key: Buffer): string => {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

/**
 * 计算HMAC-SHA256签名
 * @param data 数据
 * @param secret 密钥
 */
export const hmacSHA256 = (data: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

/**
 * 计算SHA256哈希
 * @param data 数据
 */
export const sha256 = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * 生成CSRF令牌
 * @param sessionId 会话ID
 * @param secret 密钥
 */
export const generateCSRFToken = (sessionId: string, secret: string): string => {
  const timestamp = Date.now().toString();
  const data = `${sessionId}:${timestamp}`;
  const signature = hmacSHA256(data, secret);
  return `${Buffer.from(data).toString('base64')}.${signature}`;
};

/**
 * 验证CSRF令牌
 * @param token CSRF令牌
 * @param sessionId 会话ID
 * @param secret 密钥
 */
export const verifyCSRFToken = (token: string, sessionId: string, secret: string): boolean => {
  try {
    const [dataBase64, signature] = token.split('.');
    if (!dataBase64 || !signature) return false;

    const data = Buffer.from(dataBase64, 'base64').toString();
    const [tokenSessionId] = data.split(':');

    if (tokenSessionId !== sessionId) return false;

    const expectedSignature = hmacSHA256(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
};

/**
 * 数据脱敏
 * @param data 原始数据
 * @param type 数据类型
 */
export const maskData = (data: string, type: 'email' | 'phone' | 'idCard' | 'bankCard' | 'name'): string => {
  if (!data) return '';

  switch (type) {
    case 'email':
      const [local, domain] = data.split('@');
      if (!domain) return data;
      return `${local.substring(0, 2)}***@${domain}`;

    case 'phone':
      return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');

    case 'idCard':
      return data.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');

    case 'bankCard':
      return data.replace(/(\d{4})\d+(\d{4})/, '$1 **** **** $2');

    case 'name':
      if (data.length <= 1) return data;
      return data.substring(0, 1) + '*'.repeat(data.length - 1);

    default:
      return data;
  }
};

/**
 * 安全地比较字符串（防止时序攻击）
 * @param a 字符串a
 * @param b 字符串b
 */
export const safeCompare = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  if (bufA.length !== bufB.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
};

export default {
  hashPassword,
  verifyPassword,
  generateSecureRandom,
  generateAESKey,
  encryptAES,
  decryptAES,
  hmacSHA256,
  sha256,
  generateCSRFToken,
  verifyCSRFToken,
  maskData,
  safeCompare,
};
