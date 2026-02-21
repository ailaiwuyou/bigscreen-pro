#!/usr/bin/env node
/**
 * BigScreen 完整用户流程测试 - 修正版
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = '/root/.openclaw/workspace/user_flow_test_v2';
const testReport = [];

async function main() {
  console.log('🚀 BigScreen 完整用户流程测试 (v2)\n');
  console.log('='.repeat(70));

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // 步骤1: 登录
    console.log('\n📌 步骤1: 用户登录');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.type('input[placeholder*="用户名"]', 'admin', { delay: 100 });
    await page.type('input[type="password"]', 'admin123', { delay: 100 });
    await page.click('button.el-button--primary');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const loginSuccess = page.url().includes('/dashboards');
    console.log(`   ${loginSuccess ? '✅' : '❌'} 登录${loginSuccess ? '成功' : '失败'}: ${page.url()}`);
    await page.screenshot({ path: path.join(screenshotDir, '1_login.png'), fullPage: true });

    testReport.push({ step: '1_登录', url: page.url(), success: loginSuccess, description: loginSuccess ? '登录成功' : '登录失败' });

    // 步骤2: 仪表盘列表
    console.log('\n📌 步骤2: 仪表盘列表');
    await page.waitForSelector('.page-title, h2', { timeout: 5000 });
    const title = await page.$eval('.page-title, h2', el => el.textContent);
    const cards = await page.$$('.el-table .el-table__row');
    console.log(`   📝 标题: ${title}`);
    console.log(`   📊 仪表盘数量: ${cards.length}`);
    await page.screenshot({ path: path.join(screenshotDir, '2_dashboards.png'), fullPage: true });

    testReport.push({ step: '2_仪表盘列表', url: page.url(), success: true, description: `标题: ${title}, 数量: ${cards.length}` });

    // 步骤3: 创建仪表盘
    console.log('\n📌 步骤3: 创建仪表盘');
    
    // 使用 evaluate 来查找包含"新建仪表盘"文本的按钮
    const createBtn = await page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.includes('新建仪表盘')) {
          return btn;
        }
      }
      return null;
    });
    
    if (createBtn) {
      await createBtn.click();
      await new Promise(resolve => setTimeout(resolve, 3000));
      const inEditor = page.url().includes('/editor');
      console.log(`   ${inEditor ? '✅' : '❌'} 进入编辑器: ${page.url()}`);
      await page.screenshot({ path: path.join(screenshotDir, '3_create.png'), fullPage: true });

      testReport.push({ step: '3_创建仪表盘', url: page.url(), success: inEditor, description: inEditor ? '进入编辑器' : '未进入' });

      // 步骤4: 编辑器
      if (inEditor) {
        console.log('\n📌 步骤4: 编辑器');
        await new Promise(resolve => setTimeout(resolve, 2000));
        const toolbar = await page.$('.toolbar, .editor-toolbar');
        const components = await page.$('.components, .component-library, .component-list');
        const canvas = await page.$('.canvas, .editor-canvas');

        console.log(`   ${toolbar ? '✅' : '❌'} 工具栏`);
        console.log(`   ${components ? '✅' : '❌'} 组件库`);
        console.log(`   ${canvas ? '✅' : '❌'} 画布`);
        await page.screenshot({ path: path.join(screenshotDir, '4_editor.png'), fullPage: true });

        const editorOK = toolbar && components && canvas;
        testReport.push({ step: '4_编辑器', url: page.url(), success: editorOK, description: `工具栏:${!!toolbar}, 组件库:${!!components}, 画布:${!!canvas}` });
      }
    } else {
      console.log(`   ❌ 未找到创建按钮`);
      testReport.push({ step: '3_创建仪表盘', url: page.url(), success: false, error: '未找到创建按钮' });
    }

    // 步骤5: 数据源管理
    console.log('\n📌 步骤5: 数据源管理');
    await page.goto('http://localhost:5173/datasources', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.page-title, h2', { timeout: 5000 });
    const dsTitle = await page.$eval('.page-title, h2', el => el.textContent);
    const dsCards = await page.$$('.el-table .el-table__row');
    console.log(`   📝 标题: ${dsTitle}`);
    console.log(`   📊 数据源数量: ${dsCards.length}`);
    await page.screenshot({ path: path.join(screenshotDir, '5_datasources.png'), fullPage: true });

    testReport.push({ step: '5_数据源', url: page.url(), success: true, description: `标题: ${dsTitle}, 数量: ${dsCards.length}` });

  } catch (error) {
    console.error(`\n❌ 错误: ${error.message}`);
    testReport.push({ step: '测试过程', url: page.url(), success: false, error: error.message });
  } finally {
    await browser.close();
  }

  // 生成报告
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 结果汇总\n');
  const passed = testReport.filter(r => r.success).length;
  console.log(`✅ 通过: ${passed}/${testReport.length}`);
  console.log(`📈 通过率: ${((passed / testReport.length) * 100).toFixed(1)}%\n`);

  testReport.forEach((r, i) => {
    console.log(`${r.success ? '✅' : '❌'} ${i + 1}. ${r.step}`);
    console.log(`   URL: ${r.url}`);
    if (r.description) console.log(`   说明: ${r.description}`);
    if (r.error) console.log(`   错误: ${r.error}`);
  });

  // 保存报告
  const reportPath = path.join(screenshotDir, 'report.md');
  let report = `# BigScreen 用户流程测试报告\n\n`;
  report += `**时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
  report += `## 📊 结果\n\n`;
  report += `- 通过: ${passed}/${testReport.length}\n`;
  report += `- 通过率: ${((passed / testReport.length) * 100).toFixed(1)}%\n\n`;
  report += `## 📋 详情\n\n`;
  testReport.forEach((r, i) => {
    report += `### ${i + 1}. ${r.step}\n\n`;
    report += `- URL: ${r.url}\n`;
    report += `- 状态: ${r.success ? '✅ 通过' : '❌ 失败'}\n`;
    if (r.description) report += `- 说明: ${r.description}\n`;
    if (r.error) report += `- 错误: ${r.error}\n`;
  });
  fs.writeFileSync(reportPath, report);

  console.log(`\n📄 报告: ${reportPath}`);
  console.log(`📁 截图: ${screenshotDir}\n`);
}

main();
