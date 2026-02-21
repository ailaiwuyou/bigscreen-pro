#!/usr/bin/env node
/**
 * BigScreen 登录后完整流程测试
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = '/root/.openclaw/workspace/logged_in_test_screenshots';
const testReport = [];

async function main() {
  console.log('🚀 BigScreen 登录后完整流程测试');
  console.log('📋 先登录，再测试各个页面\n');
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

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // ========== 步骤 1: 访问登录页 ==========
    console.log(`\n📌 步骤 1: 访问登录页`);
    console.log(`   URL: http://localhost:5173/login`);

    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotDir, '1_login_page.png'), fullPage: true });

    // 填写用户名
    await page.waitForSelector('input[placeholder*="用户名"]', { timeout: 5000 });
    await page.type('input[placeholder*="用户名"]', 'admin', { delay: 100 });
    console.log(`   ✅ 输入用户名: admin`);

    // 填写密码
    await page.type('input[type="password"]', 'admin123', { delay: 100 });
    console.log(`   ✅ 输入密码: admin123`);

    // 点击登录按钮
    await page.click('button.el-button--primary');
    console.log(`   ✅ 点击登录按钮`);

    // 等待登录完成
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 检查是否跳转到仪表盘列表
    const currentUrl = page.url();
    console.log(`   📍 跳转到: ${currentUrl}`);

    if (currentUrl.includes('/dashboards')) {
      console.log(`   ✅ 登录成功！`);
      testReport.push({
        step: '1_登录',
        url: 'http://localhost:5173/login',
        success: true,
        description: '登录流程'
      });
    } else {
      console.log(`   ❌ 登录可能失败，当前URL: ${currentUrl}`);
      testReport.push({
        step: '1_登录',
        url: 'http://localhost:5173/login',
        success: false,
        error: '登录后未跳转到仪表盘列表'
      });
    }

    // ========== 步骤 2: 仪表盘列表 ==========
    console.log(`\n📌 步骤 2: 仪表盘列表`);
    const dashboardUrl = 'http://localhost:5173/dashboards';
    console.log(`   URL: ${dashboardUrl}`);

    await page.goto(dashboardUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotDir, '2_dashboards.png'), fullPage: true });

    // 检查页面元素
    const title = await page.$('h1');
    const titleText = title ? await title.evaluate(el => el.textContent) : '未找到';
    console.log(`   📝 页面标题: ${titleText}`);

    const cards = await page.$$('.el-card');
    console.log(`   📊 仪表盘卡片数量: ${cards.length}`);

    testReport.push({
      step: '2_仪表盘列表',
      url: dashboardUrl,
      success: true,
      description: `页面标题: ${titleText}, 卡片数: ${cards.length}`
    });

    // ========== 步骤 3: 创建仪表盘 ==========
    console.log(`\n📌 步骤 3: 创建仪表盘`);

    // 点击创建按钮
    const createBtn = await page.$('button:has-text("创建")');
    if (createBtn) {
      await createBtn.click();
      console.log(`   ✅ 点击创建按钮`);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const createUrl = page.url();
      console.log(`   📍 跳转到: ${createUrl}`);

      testReport.push({
        step: '3_创建仪表盘',
        url: createUrl,
        success: createUrl.includes('/editor'),
        description: createUrl.includes('/editor') ? '成功进入编辑器' : '未进入编辑器'
      });
    } else {
      console.log(`   ❌ 未找到创建按钮`);
      testReport.push({
        step: '3_创建仪表盘',
        url: dashboardUrl,
        success: false,
        error: '未找到创建按钮'
      });
    }

    // ========== 步骤 4: 数据源管理 ==========
    console.log(`\n📌 步骤 4: 数据源管理`);
    const datasourceUrl = 'http://localhost:5173/datasources';
    console.log(`   URL: ${datasourceUrl}`);

    await page.goto(datasourceUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotDir, '4_datasources.png'), fullPage: true });

    const dsTitle = await page.$('h1');
    const dsTitleText = dsTitle ? await dsTitle.evaluate(el => el.textContent) : '未找到';
    console.log(`   📝 页面标题: ${dsTitleText}`);

    const dsCards = await page.$$('.el-card');
    console.log(`   📊 数据源卡片数量: ${dsCards.length}`);

    testReport.push({
      step: '4_数据源管理',
      url: datasourceUrl,
      success: true,
      description: `页面标题: ${dsTitleText}`
    });

  } catch (error) {
    console.error(`\n❌ 测试过程出错: ${error.message}`);
    testReport.push({
      step: '测试过程',
      url: page.url(),
      success: false,
      error: error.message
    });
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
    if (result.description) {
      console.log(`   说明: ${result.description}`);
    }
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    console.log('');
  });

  // 保存报告
  const reportPath = path.join(screenshotDir, 'logged_in_test_report.md');
  let report = `# BigScreen 登录后完整流程测试报告\n\n`;
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
    report += `- **状态**: ${result.success ? '✅ 通过' : '❌ 失败'}\n`;
    if (result.description) {
      report += `- **说明**: ${result.description}\n`;
    }
    if (result.error) {
      report += `- **错误**: ${result.error}\n`;
    }
    report += '\n';
  });

  fs.writeFileSync(reportPath, report);

  console.log(`📄 测试报告: ${reportPath}`);
  console.log(`📁 截图目录: ${screenshotDir}`);
  console.log('\n🎉 测试完成！\n');
}

main().catch(error => {
  console.error('\n❌ 测试失败:', error.message);
  process.exit(1);
});
