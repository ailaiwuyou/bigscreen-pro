#!/usr/bin/env node
/**
 * 检查仪表盘列表页面
 */

const puppeteer = require('puppeteer');

async function checkDashboards() {
  console.log('🔍 检查仪表盘列表页面...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // 1. 先登录
    console.log('📌 步骤1: 登录');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.type('input[placeholder*="用户名"]', 'admin', { delay: 100 });
    await page.type('input[type="password"]', 'admin123', { delay: 100 });
    await page.click('button.el-button--primary');

    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log(`   登录后URL: ${page.url()}`);

    // 2. 访问仪表盘列表
    console.log('\n📌 步骤2: 访问仪表盘列表');
    await page.goto('http://localhost:5173/dashboards', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log(`   当前URL: ${page.url()}`);

    // 3. 等待并截图
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: '/root/.openclaw/workspace/dashboards_check.png', fullPage: true });
    console.log('   📸 截图已保存: /root/.openclaw/workspace/dashboards_check.png');

    // 4. 检查页面内容
    const title = await page.$('h1');
    console.log(`   h1 元素: ${title ? '存在' : '不存在'}`);

    const pageContent = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log(`   页面内容预览:\n   ${pageContent}`);

  } catch (error) {
    console.error(`❌ 错误: ${error.message}`);
  } finally {
    await browser.close();
  }
}

checkDashboards();
