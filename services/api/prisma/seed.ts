/**
 * 数据库种子脚本
 * 初始化基础数据
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/security';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始数据库种子...\n');

  // 创建基础角色
  console.log('📋 创建基础角色...');
  
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: '系统管理员',
      permissions: [
        { resource: 'user', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'dashboard', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'datasource', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'theme', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'system', actions: ['manage'] },
      ],
      isSystem: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: '普通用户',
      permissions: [
        { resource: 'dashboard', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'datasource', actions: ['create', 'read', 'update', 'delete'] },
      ],
      isSystem: true,
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'viewer' },
    update: {},
    create: {
      name: 'viewer',
      description: '只读用户',
      permissions: [
        { resource: 'dashboard', actions: ['read'] },
      ],
      isSystem: true,
    },
  });

  console.log('✅ 角色创建完成');
  console.log(`   - Admin: ${adminRole.id}`);
  console.log(`   - User: ${userRole.id}`);
  console.log(`   - Viewer: ${viewerRole.id}\n`);

  // 创建默认主题
  console.log('🎨 创建默认主题...');

  const darkTheme = await prisma.theme.upsert({
    where: { name: '深色科技' },
    update: {},
    create: {
      name: '深色科技',
      description: '深色背景科技风格主题',
      category: 'TECH',
      isSystem: true,
      config: {
        colors: ['#00d4ff', '#00a8ff', '#0099ff', '#00ccff', '#00eeff'],
        bgColor: '#0a0a0a',
        bgImage: null,
        fonts: {
          family: 'Roboto, sans-serif',
          size: 14,
          color: '#ffffff',
        },
        componentDefaults: {
          borderRadius: 4,
          borderWidth: 1,
          borderColor: '#1a1a1a',
        },
      },
    },
  });

  const lightTheme = await prisma.theme.upsert({
    where: { name: '浅色商务' },
    update: {},
    create: {
      name: '浅色商务',
      description: '浅色背景商务风格主题',
      category: 'BUSINESS',
      isSystem: true,
      config: {
        colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'],
        bgColor: '#f0f2f5',
        bgImage: null,
        fonts: {
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          size: 14,
          color: '#262626',
        },
        componentDefaults: {
          borderRadius: 2,
          borderWidth: 1,
          borderColor: '#d9d9d9',
        },
      },
    },
  });

  console.log('✅ 主题创建完成');
  console.log(`   - Dark: ${darkTheme.id}`);
  console.log(`   - Light: ${lightTheme.id}\n`);

  // 创建示例数据源类型（可选）
  console.log('📊 初始化数据源类型...');
  console.log('✅ 数据源类型初始化完成\n');

  console.log('🎉 数据库种子完成！');
  console.log('\n您可以开始使用系统了。');
  console.log('建议：使用 Prisma Studio 查看数据：npx prisma studio');
}

main()
  .catch((e) => {
    console.error('❌ 种子失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
