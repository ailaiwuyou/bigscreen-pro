const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: '/usr/bin/chromium-browser'
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('Navigating to BigScreen...');
  await page.goto('http://localhost:5173');
  
  console.log('Waiting for page to load...');
  await page.waitForTimeout(5000);
  
  // 截图
  await page.screenshot({ path: '/tmp/bigscreen_screenshot.png', fullPage: true });
  console.log('Screenshot saved to /tmp/bigscreen_screenshot.png');
  
  // 检查页面内容
  const title = await page.title();
  console.log('Page title:', title);
  
  const content = await page.content();
  console.log('Page content length:', content.length);
  
  // 检查是否有登录页面元素
  const hasLogin = await page.locator('text=登录').count() > 0;
  const hasUsername = await page.locator('input[type="text"], input[name="username"]').count() > 0;
  
  console.log('Has login text:', hasLogin);
  console.log('Has username input:', hasUsername);
  
  // 等待一段时间以便录屏
  console.log('Waiting 10 seconds for recording...');
  await page.waitForTimeout(10000);
  
  console.log('Closing browser...');
  await browser.close();
  console.log('Test completed!');
})();
