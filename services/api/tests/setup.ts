/**
 * Jest 测试设置
 */

import dotenv from 'dotenv';

// 加载测试环境变量
dotenv.config({ path: '.env.test' });

// 增加测试超时时间
jest.setTimeout(30000);

// 全局测试前钩子
beforeAll(async () => {
  // 测试前的初始化
});

// 全局测试后钩子
afterAll(async () => {
  // 测试后的清理
});

// 全局测试前钩子（每个测试）
beforeEach(async () => {
  // 每个测试前的初始化
});

// 全局测试后钩子（每个测试）
afterEach(async () => {
  // 每个测试后的清理
});
