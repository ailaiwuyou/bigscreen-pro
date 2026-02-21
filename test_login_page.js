#!/usr/bin/env node
/**
 * 测试登录页面加载
 */

const puppeteer = require('puppeteer');

async function testLoginPage() {
  console.log('🔍 测试登录页面加载...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // 收集控制台错误
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  try {
    console.log('📡 访问登录页: http://38.12.6.251:5173/login');
    await page.goto('http://38.12.6.251:5173/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 检查页面标题
    const title = await page.title();
    console.log(`✅ 页面标题: ${title}`);

    // 检查关键元素
    const usernameInput = await page.$('input[placeholder*="用户名"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button.el-button--primary');

    console.log(`\n📋 页面元素检查:`);
    console.log(`   用户名输入框: ${usernameInput ? '✅ 存在' : '❌ 不存在'}`);
    console.log(`   密码输入框: ${passwordInput ? '✅ 存在' : '❌ 不存在'}`);
    console.log(`   登录按钮: ${loginButton ? '✅ 存在' : '❌ 不存在'}`);

    // 截图
    await page.screenshot({
      path: '/root/.openclaw/workspace/test_screenshots/login_page_test.png',
      fullPage: true
    });
    console.log(`\n📸 截图已保存: login_page_test.png`);

    // 检查错误
    if (errors.length > 0) {
      console.log(`\n❌ 控制台错误 (${errors.length} 个):`);
      errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 150)}`);
      });
      return { success: false, errors };
    } else {
      console.log(`\n✅ 无控制台错误`);
      return { success: true };
    }

  } catch (error) {
    console.error(`\n❌ 页面加载失败: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

testLoginPage().then(result => {
  console.log(`\n📊 测试结果: ${result.success ? '✅ 通过' : '❌ 失败'}`);
  process.exit(result.success ? 0 : 1);
});
