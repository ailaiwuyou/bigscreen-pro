#!/usr/bin/env node
const puppeteer = require('puppeteer');

async function testUserFlow() {
  console.log('🚀 启动浏览器测试用户流程...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 步骤1: 访问首页
    console.log('📌 步骤1: 访问首页');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: '/root/.openclaw/workspace/flow/01_home.png', fullPage: true });
    console.log('✓ 首页截图完成\n');

    // 步骤2: 点击登录按钮
    console.log('📌 步骤2: 点击登录按钮');
    const loginButton = await page.$('button:has-text("立即登录"), .el-button--primary');
    if (loginButton) {
      await loginButton.click();
    } else {
      // 直接跳转到登录页
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    }
    await page.screenshot({ path: '/root/.openclaw/workspace/flow/02_login_page.png', fullPage: true });
    console.log('✓ 登录页截图完成\n');

    // 步骤3: 输入用户名
    console.log('📌 步骤3: 输入用户名');
    await page.waitForSelector('input[placeholder*="用户名"]', { timeout: 5000 });
    await page.type('input[placeholder*="用户名"]', 'admin', { delay: 100 });
    await page.screenshot({ path: '/root/.openclaw/workspace/flow/03_username_filled.png', fullPage: true });
    console.log('✓ 用户名输入完成\n');

    // 步骤4: 输入密码
    console.log('📌 步骤4: 输入密码');
    await page.type('input[type="password"]', 'admin123', { delay: 100 });
    await page.screenshot({ path: '/root/.openclaw/workspace/flow/04_password_filled.png', fullPage: true });
    console.log('✓ 密码输入完成\n');

    // 步骤5: 点击登录按钮
    console.log('📌 步骤5: 点击登录按钮');
    const loginSubmitBtn = await page.$('button:has-text("登 录")');
    if (loginSubmitBtn) {
      await loginSubmitBtn.click();
    }
    await page.screenshot({ path: '/root/.openclaw/workspace/flow/05_login_clicked.png', fullPage: true });
    console.log('✓ 登录按钮已点击\n');

    // 步骤6: 等待跳转到仪表盘
    console.log('📌 步骤6: 等待跳转到仪表盘');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    await page.screenshot({ path: '/root/.openclaw/workspace/flow/06_dashboard.png', fullPage: true });
    console.log('✓ 仪表盘截图完成\n');

    console.log('✅ 完整流程测试完成！');
    console.log('📁 截图保存在: /root/.openclaw/workspace/flow/');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    await page.screenshot({ path: '/root/.openclaw/workspace/flow/error.png', fullPage: true });
    console.log('📸 错误截图已保存');
  } finally {
    await browser.close();
  }
}

// 创建截图目录
const { execSync } = require('child_process');
execSync('mkdir -p /root/.openclaw/workspace/flow');

testUserFlow();
