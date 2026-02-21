#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const URL = process.argv[2] || 'https://www.baidu.com';
const OUTPUT = process.argv[3] || '/root/.openclaw/workspace/baidu_screenshot.png';

async function downloadChromium() {
  const chromiumDir = path.join(process.env.HOME || '/root', '.local', 'share', 'chromium');
  const chromePath = path.join(chromiumDir, 'chrome-linux', 'chrome');
  
  if (fs.existsSync(chromePath)) {
    console.log('✓ Chromium already exists');
    return chromePath;
  }
  
  fs.mkdirSync(chromiumDir, { recursive: true });
  const zipPath = path.join(chromiumDir, 'chrome-linux.zip');
  
  console.log('📥 Downloading Chromium...');
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(zipPath);
    https.get('https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1300590/chrome-linux.zip', (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed: ${response.statusCode}`));
        return;
      }
      
      const total = parseInt(response.headers['content-length'], 10);
      let downloaded = 0;
      
      response.on('data', (chunk) => {
        downloaded += chunk.length;
        const percent = ((downloaded / total) * 100).toFixed(1);
        process.stdout.write(`\r  Progress: ${percent}% (${(downloaded/1024/1024).toFixed(1)}MB / ${(total/1024/1024).toFixed(1)}MB)`);
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        console.log('\n✓ Download complete');
        file.close();
        
        console.log('📦 Extracting...');
        try {
          execSync(`unzip -q "${zipPath}" -d "${chromiumDir}"`, { stdio: 'inherit' });
          fs.unlinkSync(zipPath);
          console.log('✓ Extraction complete');
          resolve(chromePath);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function takeScreenshot(url, outputPath) {
  const chromePath = await downloadChromium();
  
  const args = [
    '--headless',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-dev-shm-usage',
    '--window-size=1280,800',
    '--hide-scrollbars',
    `--screenshot=${outputPath}`,
    url
  ];
  
  console.log('\n📸 Taking screenshot...');
  execSync(`"${chromePath}" ${args.join(' ')}`, { stdio: 'inherit', timeout: 60000 });
  
  console.log('✓ Screenshot saved:', outputPath);
}

takeScreenshot(URL, OUTPUT).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
