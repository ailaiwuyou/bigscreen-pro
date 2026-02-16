/**
 * 安全工具单元测试
 */

import {
  hashPassword,
  verifyPassword,
  generateSecureRandom,
  sha256,
  hmacSHA256,
} from '../../../src/utils/security';

describe('Security Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123'