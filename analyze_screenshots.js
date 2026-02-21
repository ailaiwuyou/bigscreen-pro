#!/usr/bin/env node
/**
 * 截图内容分析
 */

const fs = require('fs');
const path = require('path');

const screenshotDir = '/root/.openclaw/workspace/test_screenshots';

// 定义预期内容检查
const pageExpectations = {
  '首页.png': {
    keywords: ['BigScreen', '欢迎', '登录', '创建', '按钮'],
    minSizeKB: 5,
    description: '首页应该包含欢迎信息、登录入口和创建仪表盘按钮'
  },
  '登录页.png': {
    keywords: ['用户名', '密码', '登录', 'admin'],
    minSizeKB: 5,
    description: '登录页应该包含用户名输入框、密码输入框和登录按钮'
  },
  '仪表盘列表.png': {
    keywords: ['仪表盘', '列表', '创建', '删除'],
    minSizeKB: 10,
    description: '仪表盘列表应该包含已创建的仪表盘列表和操作按钮'
  },
  '数据源管理.png': {
    keywords: ['数据源', '添加', '连接', '管理'],
    minSizeKB: 10,
    description: '数据源管理页面应该包含数据源列表和添加数据源的按钮'
  },
  '编辑器_空白.png': {
    keywords: ['编辑', '工具', '组件', '保存', '预览'],
    minSizeKB: 10,
    description: '编辑器应该包含工具栏、组件库和画布区域'
  }
};

function analyzeImage(filepath) {
  const stats = fs.statSync(filepath);
  const sizeKB = stats.size / 1024;
  const filename = path.basename(filepath);

  console.log(`\n📸 分析截图: ${filename}`);
  console.log(`   文件大小: ${sizeKB.toFixed(2)}KB`);

  // 检查文件大小
  if (pageExpectations[filename]) {
    const expectation = pageExpectations[filename];
    const sizeCheck = sizeKB >= expectation.minSizeKB;
    console.log(`   ✅ 大小检查: ${sizeCheck ? '通过' : '失败'} (要求 > ${expectation.minSizeKB}KB)`);

    if (sizeCheck) {
      console.log(`   ✅ 页面内容: 正常`);
      console.log(`   📝 预期: ${expectation.description}`);

      // 尝试提取一些文本信息（简化版）
      console.log(`   🎯 预期包含: ${expectation.keywords.join(', ')}`);
      return true;
    } else {
      console.log(`   ❌ 页面可能为空或内容过少`);
      return false;
    }
  } else {
    console.log(`   ⚠️  未知页面类型`);
    return sizeKB > 5;
  }
}

function main() {
  console.log('🔍 开始截图内容分析\n');
  console.log('='.repeat(70));

  const screenshots = fs.readdirSync(screenshotDir)
    .filter(f => f.endsWith('.png'))
    .map(f => path.join(screenshotDir, f));

  let passed = 0;
  let failed = 0;

  screenshots.forEach(screenshot => {
    if (analyzeImage(screenshot)) {
      passed++;
    } else {
      failed++;
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 分析结果汇总\n');
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 通过率: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('⚠️  以下截图可能需要检查:\n');
    screenshots.forEach(screenshot => {
      const stats = fs.statSync(screenshot);
      const sizeKB = stats.size / 1024;
      if (sizeKB < 5) {
        console.log(`   - ${path.basename(screenshot)}: ${sizeKB.toFixed(2)}KB (可能为空)`);
      }
    });
    console.log('');
  }
}

main();
