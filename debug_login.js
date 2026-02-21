#!/usr/bin/env node
/**
 * 调试登录流程 - 检查每一步
 */

const puppeteer = require('puppeteer');

async function debugLogin() {
  console.log('🔍 调试登录流程...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 监听控制台消息
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('API响应') || text.includes('Token') || text.includes('登录')) {
      console.log(`   [浏览器控制台] ${text}`);
    }
  });

  // 监听响应
  page.on('response', async response => {
    // 忽略 preflight 请求
    if (response.request().method() === 'OPTIONS') {
      return;
    }
    
    if (response.url().includes('/auth/login')) {
      const status = response.status();
      try {
        const text = await response.text();
        console.log(`\n📡 API响应: ${response.url()}`);
        console.log(`   状态: ${status}`);
        console.log(`   响应: ${text.substring(0, 300)}...`);
      } catch (e) {
        console.log(`\n📡 API响应: ${response.url()}`);
        console.log(`   状态: ${status}`);
        console.log(`   (无法读取响应体)`);
      }
    }
  });

  try {
    // 1. 访问登录页
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log(`✅ 步骤1: 访问登录页 - ${page.url()}`);

    // 2. 输入用户名和密码
    await page.type('input[placeholder*="用户名"]', 'admin', { delay: 100 });
    console.log(`✅ 步骤2: 输入用户名`);

    await page.type('input[type="password"]', 'admin123', { delay: 100 });
    console.log(`✅ 步骤3: 输入密码`);

    // 3. 点击登录按钮
    await page.click('button.el-button--primary');
    console.log(`✅ 步骤4: 点击登录按钮`);

    // 等待登录完成
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 5. 检查当前URL
    console.log(`\n📍 当前URL: ${page.url()}`);

    // 6. 检查localStorage
    const storageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    });

    console.log(`\n📦 LocalStorage数据:`);
    Object.keys(storageData).forEach(key => {
      const value = storageData[key];
      const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
      console.log(`   ${key}: ${displayValue}`);
    });

    // 7. 检查是否跳转到仪表盘
    if (page.url().includes('/dashboards')) {
      console.log(`\n🎉 登录成功！已跳转到仪表盘列表`);
    } else {
      console.log(`\n⚠️  未跳转到仪表盘列表`);
    }

  } catch (error) {
    console.error(`\n❌ 错误: ${error.message}`);
  } finally {
    await browser.close();
  }
}

debugLogin();
