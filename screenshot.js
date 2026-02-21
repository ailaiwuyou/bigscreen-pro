#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 下载 Chromium
const chromiumDir = path.join(process.env.HOME || '/root', '.local', 'share', 'chromium');
const chromiumPath = path.join(chromiumDir, 'chrome-linux', 'chrome');

async function downloadChromium() {
  if (fs.existsSync(chromiumPath)) {
    console.log('Chromium already exists');
    return chromiumPath;
  }
  
  console.log('Downloading Chromium...');
  fs.mkdirSync(chromiumDir, { recursive: true });
  
  // 使用 chromium 的 snapshot
  const downloadUrl = 'https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1300590/chrome-linux.zip';
  const zipPath = path.join(chromiumDir, 'chrome-linux.zip');
  
  try {
    execSync(`curl -L "${downloadUrl}" -o "${zipPath}"`, { stdio: 'inherit', timeout: 120000 });
    execSync(`unzip -q "${zipPath}" -d "${chromiumDir}"`, { stdio: 'inherit' });
    fs.unlinkSync(zipPath);
    console.log('Chromium downloaded successfully');
    return chromiumPath;
  } catch (e) {
    console.error('Failed to download Chromium:', e.message);
    return null;
  }
}

async function takeScreenshot(url, outputPath) {
  const chromiumExec = await downloadChromium();
  if (!chromiumExec) {
    console.error('Could not get Chromium');
    process.exit(1);
  }
  
  // 使用 chromium 直接截图
  const cmd = [
    chromiumExec,
    '--headless',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-dev-shm-usage',
    '--window-size=1280,800',
    '--screenshot=' + outputPath,
    '--hide-scrollbars',
    url
  ].join(' ');
  
  console.log('Taking screenshot...');
  execSync(cmd, { stdio: 'inherit', timeout: 60000 });
  console.log('Screenshot saved to', outputPath);
}

const url = process.argv[2] || 'https://www.baidu.com';
const output = process.argv[3] || '/root/.openclaw/workspace/baidu.png';
takeScreenshot(url, output).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
