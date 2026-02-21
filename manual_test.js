#!/usr/bin/env node
/**
 * BigScreen 系统测试 - 按照用户手册测试各页面
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = '/root/.openclaw/workspace/test_screenshots';

async function testPage(page, url, name, description) {
  console.log(`\n📌 测试页面: ${name}`);
  console.log(`   URL: ${url}`);
  console.log(`   描述: ${description}`);

  const filename = `${name.replace(/\//g, '_')}.png`;
  const filepath = path.join(screenshotDir, filename);

  try {
    // 访问页面
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('   ✅ 页面加载成功');

    // 截图
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`   📸 截图保存: ${filename}`);

    // 检查控制台错误
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // 等待一下让控制台错误出现
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (errors.length > 0) {
      console.log(`   ⚠️  控制台错误: ${errors.length} 个`);
      errors.forEach(err => console.log(`      - ${err.substring(0, 100)}...`));
      return { success: false, name, url, filename, errors, description };
    } else {
      console.log(`   ✅ 无控制台错误`);
      return { success: true, name, url, filename, description };
    }
  } catch (error) {
    console.log(`   ❌ 页面访问失败: ${error.message}`);
    return { success: false, name, url, error: error.message, description };
  }
}

async function main() {
  console.log('🚀 开始 BigScreen 系统测试\n');
  console.log('=' .repeat(70));

  // 创建截图目录
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 定义测试页面（根据用户手册）
  const testPages = [
    {
      name: '首页',
      url: 'http://localhost:5173/',
      description: '系统首页，展示系统功能和创建入口'
    },
    {
      name: '登录页',
      url: 'http://localhost:5173/login',
      description: '用户登录页面，默认账号 admin/admin123'
    },
    {
      name: '仪表盘列表',
      url: 'http://localhost:5173/dashboards',
      description: '仪表盘列表页面，展示所有创建的仪表盘'
    },
    {
      name: '数据源管理',
      url: 'http://localhost:5173/datasources',
      description: '数据源管理页面，配置和管理数据连接'
    },
    {
      name: '编辑器_空白',
      url: 'http://localhost:5173/editor/new',
      description: '仪表盘编辑器，拖拽式设计界面'
    }
  ];

  const results = [];

  // 逐个测试页面
  for (let i = 0; i < testPages.length; i++) {
    const testPageItem = testPages[i];
    console.log(`\n[${i + 1}/${testPages.length}]`);

    const result = await testPage(page, testPageItem.url, testPageItem.name, testPageItem.description);
    results.push(result);

    // 每个页面之间等待一下
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  await browser.close();

  // 生成测试报告
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 测试结果汇总\n');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 通过率: ${((passed / total) * 100).toFixed(1)}%\n`);

  // 详细结果
  console.log('📋 详细测试结果:\n');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.name}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   描述: ${result.description}`);
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    if (result.errors && result.errors.length > 0) {
      console.log(`   控制台错误:`);
      result.errors.forEach(err => console.log(`      - ${err.substring(0, 80)}...`));
    }
    if (result.filename) {
      console.log(`   截图: ${result.filename}`);
    }
    console.log('');
  });

  // 保存报告
  const reportPath = path.join(screenshotDir, 'test_report.md');
  let report = `# BigScreen 系统测试报告\n\n`;
  report += `**测试时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
  report += `**测试页面数**: ${total}\n\n`;
  report += `## 📊 测试结果统计\n\n`;
  report += `- ✅ 通过: ${passed}\n`;
  report += `- ❌ 失败: ${failed}\n`;
  report += `- 📈 通过率: ${((passed / total) * 100).toFixed(1)}%\n\n`;
  report += `## 📋 详细测试结果\n\n`;

  results.forEach((result, index) => {
    report += `### ${index + 1}. ${result.name}\n\n`;
    report += `- **URL**: ${result.url}\n`;
    report += `- **描述**: ${result.description}\n`;
    report += `- **状态**: ${result.success ? '✅ 通过' : '❌ 失败'}\n`;
    if (result.filename) {
      report += `- **截图**: ${result.filename}\n`;
    }
    if (result.error) {
      report += `- **错误**: ${result.error}\n`;
    }
    if (result.errors && result.errors.length > 0) {
      report += `- **控制台错误**:\n`;
      result.errors.forEach(err => {
        report += `  - ${err.substring(0, 100)}\n`;
      });
    }
    report += '\n';
  });

  fs.writeFileSync(reportPath, report);
  console.log(`📄 测试报告已保存: ${reportPath}`);
  console.log(`📁 截图目录: ${screenshotDir}`);
  console.log('\n🎉 测试完成！\n');

  return results;
}

main().catch(error => {
  console.error('\n❌ 测试失败:', error.message);
  process.exit(1);
});
