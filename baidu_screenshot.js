const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  await page.goto('https://www.baidu.com', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: '/root/.openclaw/workspace/baidu_screenshot.png', fullPage: true });
  console.log('截图已保存到 /root/.openclaw/workspace/baidu_screenshot.png');
  await browser.close();
})();
