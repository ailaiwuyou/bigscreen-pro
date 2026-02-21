#!/usr/bin/env node
/**
 * BigScreen 完整用户流程测试
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = '/root/.openclaw/workspace/complete_user_flow_test';
const testReport = [];

async function main() {
  console.log('🚀 BigScreen 完整用户流程测试');
  console.log('📋 登录 → 仪表盘 → 数据源 → 编辑器\n');
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
    // ========== 步骤 1: 登录 ==========
    console.log(`\n📌 步骤 1: 用户登录`);
    console.log(`   URL: http://localhost:5173/login`);

    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotDir, '1_login_page.png'), fullPage: true });

    await page.type('input[placeholder*="用户名"]', 'admin', { delay: 100 });
    await page.type('input[type="password"]', 'admin123', { delay: 100 });
    await page.click('button.el-button--primary');

    await new Promise(resolve => setTimeout(resolve, 3000));

    const loginSuccess = page.url().includes('/dashboards');
    console.log(`   ${loginSuccess ? '✅' : '❌'} 登录${loginSuccess ? '成功' : '失败'}, 跳转到: ${page.url()}`);

    testReport.push({
      step: '1_用户登录',
      url: page.url(),
      success: loginSuccess,
      description: loginSuccess ? '登录成功，进入仪表盘列表' : '登录失败'
    });

    // ========== 步骤 2: 仪表盘列表 ==========
    console.log(`\n📌 步骤 2: 仪表盘列表`);
    console.log(`   URL: ${page.url()}`);

    await page.waitForSelector('h1', { timeout: 5000 });
    const dashboardTitle = await page.$eval('h1', el => el.textContent);
    const dashboardCards = await page.$$('.el-card');
    console.log(`   📝 页面标题: ${dashboardTitle}`);
    console.log(`   📊 仪表盘数量: ${dashboardCards.length}`);

    await page.screenshot({ path: path.join(screenshotDir, '2_dashboard_list.png'), fullPage: true });

    testReport.push({
      step: '2_仪表盘列表',
      url: page.url(),
      success: true,
      description: `标题: ${dashboardTitle}, 仪表盘数: ${dashboardCards.length}`
    });

    // ========== 步骤 3: 创建仪表盘 ==========
    console.log(`\n📌 步骤 3: 创建仪表盘`);

    const createBtn = await page.$('button:contains("创建")');
    if (createBtn) {
      await createBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));

      const editorUrl = page.url();
      const inEditor = editorUrl.includes('/editor');
      console.log(`   ${inEditor ? '✅' : '❌'} ${inEditor ? '进入' : '未进入'}编辑器: ${editorUrl}`);
      await page.screenshot({ path: path.join(screenshotDir, '3_create_dashboard.png'), fullPage: true });

      testReport.push({
        step: '3_创建仪表盘',
        url: editorUrl,
        success: inEditor,
        description: inEditor ? '成功进入编辑器' : '未进入编辑器'
      });

      // ========== 步骤 4: 编辑器 ==========
      if (inEditor) {
        console.log(`\n📌 步骤 4: 仪表盘编辑器`);

        await new Promise(resolve => setTimeout(resolve, 2000));

        const toolbar = await page.$('.toolbar, .editor-toolbar');
        const components = await page.$('.components, .component-library');
        const canvas = await page.$('.canvas, .editor-canvas');

        console.log(`   ${toolbar ? '✅' : '❌'} 工具栏`);
        console.log(`   ${components ? '✅' : '❌'} 组件库`);
        console.log(`   ${canvas ? '✅' : '❌'} 画布区域`);

        await page.screenshot({ path: path.join(screenshotDir, '4_editor.png'), fullPage: true });

        const editorReady = toolbar && components && canvas;
        testReport.push({
          step: '4_编辑器界面',
          url: page.url(),
          success: editorReady,
          description: `工具栏: ${!!toolbar}, 组件库: ${!!components}, 画布: ${!!canvas}`
        });
      }
    } else {
      console.log(`   ❌ 未找到创建按钮`);
      testReport.push({
        step: '3_创建仪表盘',
        url: page.url(),
        success: false,
        error: '未找到创建按钮'
      });
    }

    // ========== 步骤 5: 数据源管理 ==========
    console.log(`\n📌 步骤 5: 数据源管理`);

    await page.goto('http://localhost:5173/datasources', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 5000 });
    const dsTitle = await page.$eval('h1', el => el.textContent);
    const dsCards = await page.$$('.el-card');

    console.log(`   📝 页面标题: ${dsTitle}`);
    console.log(`   📊 数据源数量: ${dsCards.length}`);
    await page.screenshot({ path: path.join(screenshotDir, '5_datasources.png'), fullPage: true });

    testReport.push({
      step: '5_数据源管理',
      url: page.url(),
      success: true,
      description: `标题: ${dsTitle}, 数据源数: ${dsCards.length}`
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
  const reportPath = path.join(screenshotDir, 'complete_flow_report.md');
  let report = `# BigScreen 完整用户流程测试报告\n\n`;
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
