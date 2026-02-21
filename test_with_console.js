const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/chromium-browser'
  });

  const page = await browser.newPage();

  // 监听控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
        ? `${msg.location().url}:${msg.location().lineNumber}`
        : ''
    });
  });

  // 监听页面错误
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });

  // 监听请求失败
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure().errorText
    });
  });

  try {
    await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.screenshot({
      path: '/root/.openclaw/workspace/test/home_debug.png',
      fullPage: true
    });

    console.log('\n=== 控制台消息 ===');
    consoleMessages.forEach(msg => {
      console.log(`[${msg.type}] ${msg.text}`);
      if (msg.location) console.log(`  位置: ${msg.location}`);
    });

    console.log('\n=== 页面错误 ===');
    if (pageErrors.length === 0) {
      console.log('✓ 无页面错误');
    } else {
      pageErrors.forEach(err => {
        console.log(`✗ ${err.message}`);
        console.log(`  ${err.stack}`);
      });
    }

    console.log('\n=== 失败的请求 ===');
    if (failedRequests.length === 0) {
      console.log('✓ 无失败请求');
    } else {
      failedRequests.forEach(req => {
        console.log(`✗ ${req.url}`);
        console.log(`  原因: ${req.failure}`);
      });
    }

  } catch (e) {
    console.error('页面加载失败:', e.message);
  }

  await browser.close();
})();
