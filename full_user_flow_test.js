#!/usr/bin/env node
/**
 * BigScreen 完整系统测试 - 按照用户手册流程测试
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = '/root/.openclaw/workspace/full_test_screenshots';
const testReport = [];

async function testStep(stepName, url, description, checkFn) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📌 步骤: ${stepName}`);
  console.log(`   描述: ${description}`);
  console.log(`   URL: ${url}`);

  const filename = `${stepName.replace(/\s+/g, '_')}.png`;
  const filepath = path.join(screenshotDir, filename);

  try {
    const result = await checkFn(url, filepath);
    testReport.push({
      step: stepName,
      url,
      description,
      ...result
    });
    return result;
  } catch (error) {
    console.log(`   ❌ 执行失败: ${error.message}`);
    testReport.push({
      step: stepName,
      url,
      description,
      success: false,
      error: error.message
    });
    return { success: false, error: error.message };
  }
}

async function checkPage(url, filepath, expectedElements) {
  const errors = [];

  // 访问页面
  const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  const status = response?.status() || 0;

  console.log(`   HTTP 状态: ${status}`);

  if (status !== 200) {
    return { success: false, error: `HTTP ${status}` };
  }

  // 截图
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`   📸 截图: ${filename}`);

  // 检查预期元素
  const results = {};
  for (const [name, selector] of Object.entries(expectedElements)) {
    const element = await page.$(selector);
    results[name] = !!element;
    console.log(`   ${element ? '✅' : '❌'} ${name}: ${selector}`);
  }

  // 检查控制台错误
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const allElementsFound = Object.values(results).every(v => v);
  return {
    success: allElementsFound,
    elements: results,
    error: allElementsFound ? null : '部分元素未找到'
  };
}

async function main() {
  console.log('🚀 BigScreen 完整系统测试');
  console.log('📋 按照用户手册流程测试\n');
  console.log('='.repeat(70));

  // 创建截图目录
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  global.page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // ========== 步骤 1: 访问首页 ==========
    await testStep(
      '1_访问首页',
      'http://localhost:5173/',
      '访问系统首页，查看欢迎信息和功能入口',
      (url, filepath) => checkPage(url, filepath, {
        'BigScreen标题': 'h1, .title, .logo',
        '欢迎信息': '.welcome, .hero, h2',
        '创建按钮': 'button:has-text("创建"), .create-btn'
      })
    );

    // 等待
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ========== 步骤 2: 登录页面 ==========
    await testStep(
      '2_登录页面',
      'http://localhost:5173/login',
      '访问登录页面，查看登录表单',
      (url, filepath) => checkPage(url, filepath, {
        '登录标题': 'h1, .login-title',
        '用户名输入框': 'input[placeholder*="用户名"], input[type="text"]',
        '密码输入框': 'input[type="password"]',
        '登录按钮': 'button:has-text("登录"), .el-button--primary'
      })
    );

    // 等待
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ========== 步骤 3: 仪表盘列表 ==========
    await testStep(
      '3_仪表盘列表',
      'http://localhost:5173/dashboards',
      '访问仪表盘列表页面',
      (url, filepath) => checkPage(url, filepath, {
        '页面标题': 'h1, .page-title',
        '仪表盘卡片': '.dashboard-card, .el-card',
        '创建按钮': 'button:has-text("创建"), .create-btn'
      })
    );

    // 等待
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ========== 步骤 4: 数据源管理 ==========
    await testStep(
      '4_数据源管理',
      'http://localhost:5173/datasources',
      '访问数据源管理页面',
      (url, filepath) => checkPage(url, filepath, {
        '页面标题': 'h1, .page-title',
        '数据源列表': '.datasource-item, .el-card',
        '添加按钮': 'button:has-text("添加"), .add-btn'
      })
    );

    // 等待
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ========== 步骤 5: 编辑器 ==========
    await testStep(
      '5_编辑器',
      'http://localhost:5173/editor/new',
      '访问仪表盘编辑器',
      (url, filepath) => checkPage(url, filepath, {
        '工具栏': '.toolbar, .editor-toolbar',
        '组件库': '.component-library, .components',
        '画布区域': '.canvas, .editor-canvas',
        '保存按钮': 'button:has-text("保存"), .save-btn'
      })
    );

  } finally {
    await browser.close();
  }

  // 生成测试报告
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 测试结果汇总\n');

  const passed = testReport.filter(r => r.success).length;
  const failed = testReport.length - passed;

  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 通过率: ${((passed / testReport.length) * 100).toFixed(1)}%\n`);

  // 详细结果
  console.log('📋 详细结果:\n');
  testReport.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.step}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   描述: ${result.description}`);
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    if (result.elements) {
      Object.entries(result.elements).forEach(([key, value]) => {
        console.log(`   ${value ? '✅' : '❌'} ${key}`);
      });
    }
    console.log('');
  });

  // 保存报告
  const reportPath = path.join(screenshotDir, 'full_test_report.md');
  let report = `# BigScreen 完整系统测试报告\n\n`;
  report += `**测试时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
  report += `**测试步骤**: ${testReport.length}\n\n`;
  report += `## 📊 结果统计\n\n`;
  report += `- ✅ 通过: ${passed}\n`;
  report += `- ❌ 失败: ${failed}\n`;
  report += `- 📈 通过率: ${((passed / testReport.length) * 100).toFixed(1)}%\n\n`;
  report += `## 📋 详细结果\n\n`;

  testReport.forEach((result, index) => {
    report += `### ${index + 1}. ${result.step}\n\n`;
    report += `- **URL**: ${result.url}\n`;
    report += `- **描述**: ${result.description}\n`;
    report += `- **状态**: ${result.success ? '✅ 通过' : '❌ 失败'}\n`;
    if (result.error) {
      report += `- **错误**: ${result.error}\n`;
    }
    report += '\n';
  });

  fs.writeFileSync(reportPath, report);

  console.log(`📄 测试报告: ${reportPath}`);
  console.log(`📁 截图目录: ${screenshotDir}`);
  console.log('\n🎉 测试完成！\n');

  return testReport;
}

main().catch(error => {
  console.error('\n❌ 测试失败:', error.message);
  process.exit(1);
});
