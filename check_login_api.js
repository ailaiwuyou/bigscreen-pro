#!/usr/bin/env node
/**
 * 检查前端登录API调用
 */

const puppeteer = require('puppeteer');

async function checkLoginAPI() {
  console.log('🔍 检查前端登录流程...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // 监听网络请求
  const requests = [];
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method()
    });
  });

  page.on('response', response => {
    if (response.url().includes('/auth/login')) {
      console.log(`📡 API响应: ${response.url()}`);
      console.log(`   状态: ${response.status()}`);
    }
  });

  try {
    // 访问登录页
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log(`✅ 登录页加载成功: ${page.url()}\n`);

    // 输入用户名和密码
    await page.type('input[placeholder*="用户名"]', 'admin', { delay: 100 });
    console.log(`✅ 输入用户名: admin`);
    
    await page.type('input[type="password"]', 'admin123', { delay: 100 });
    console.log(`✅ 输入密码: admin123`);

    // 点击登录按钮
    await page.click('button.el-button--primary');
    console.log(`✅ 点击登录按钮\n`);

    // 等待API响应
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 检查请求
    console.log('📋 网络请求记录:');
    const loginRequests = requests.filter(r => r.url.includes('/auth/login'));
    loginRequests.forEach(req => {
      console.log(`   ${req.method} ${req.url}`);
    });

    // 检查当前URL
    console.log(`\n📍 当前URL: ${page.url()}`);
    
    // 检查localStorage中的token
    const token = await page.evaluate(() => localStorage.getItem('bigscreen_token'));
    console.log(`🔑 Token: ${token ? '✅ 存在' : '❌ 不存在'}`);
    if (token) {
      console.log(`   ${token.substring(0, 50)}...`);
    }

  } catch (error) {
    console.error(`❌ 错误: ${error.message}`);
  } finally {
    await browser.close();
  }
}

checkLoginAPI();
