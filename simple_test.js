#!/usr/bin/env node
/**
 * 简化系统测试 - 不依赖超时
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const testDir = '/root/.openclaw/workspace/simple_test';
const screenshotDir = path.join(testDir, 'screenshots');

// 创建目录
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

function screenshot(url, filename) {
  const outputPath = path.join(screenshotDir, filename);
  console.log(`📸  截图: ${filename}`);
  
  try {
    execSync(
      `chromium-browser --headless --no-sandbox ` +
      `--window-size=1920,1080 ` +
      `--screenshot="${outputPath}" ` +
      `--hide-scrollbars "${url}"`,
      { timeout: 25000, stdio: 'pipe' }
    );
    
    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   大小: ${sizeKB}KB`);
    
    return { success: true, path: outputPath, sizeKB };
  } catch (e) {
    console.log(`   ❌ 失败: ${e.message}`);
    return { success: false, error: e.message };
  }
}

function checkAPI(url, name) {
  try {
    const response = execSync(`curl -s -w "%{http_code}" "${url}" -o /dev/null`, {
      timeout: 5000,
      stdio: 'pipe'
    }).toString().trim();
    
    const isOK = response === '200' || response === '304';
    console.log(`${isOK ? '✅' : '❌'} ${name}: HTTP ${response}`);
    return { name, status: response, ok: isOK };
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`);
    return { name, status: 'error', ok: false };
  }
}

async function main() {
  console.log('🚀  开始简化系统测试\n');
  console.log('='.repeat(60) + '\n');
  
  const results = [];
  
  // 1. 检查 API
  console.log('📡  1. 检查 API 端点\n');
  results.push(checkAPI('http://localhost:3000/health', '后端 Health'));
  results.push(checkAPI('http://localhost:3000/api', '后端 API'));
  results.push(checkAPI('http://localhost:3000/', '后端首页'));
  results.push(checkAPI('http://localhost:5173/', '前端首页'));
  results.push(checkAPI('http://localhost:5173/login', '登录页'));
  results.push(checkAPI('http://localhost:5173/dashboards', '仪表盘'));
  
  console.log('');
  
  // 2. 截图
  console.log('🖼️  2. 截取关键页面\n');
  const screenshots = [
    { url: 'http://localhost:5173/', file: '01_home.png', name: '首页' },
    { url: 'http://localhost:5173/login', file: '02_login.png', name: '登录页' },
    { url: 'http://localhost:5173/dashboards', file: '03_dashboard.png', name: '仪表盘' },
    { url: 'http://localhost:3000/', file: '04_backend.png', name: '后端首页' },
    { url: 'http://localhost:3000/health', file: '05_health.png', name: 'Health API' }
  ];
  
  for (const shot of screenshots) {
    const result = screenshot(shot.url, shot.file);
    results.push({ 
      type: 'screenshot', 
      name: shot.name, 
      ...result 
    });
    console.log('');
  }
  
  // 3. 生成报告
  console.log('\n📊  测试结果汇总\n');
  console.log('='.repeat(60) + '\n');
  
  const apiResults = results.filter(r => r.type !== 'screenshot');
  const screenshotResults = results.filter(r => r.type === 'screenshot');
  
  const apiPassed = apiResults.filter(r => r.ok).length;
  const screenshotPassed = screenshotResults.filter(r => r.success).length;
  
  console.log(`API 测试: ${apiPassed}/${apiResults.length} 通过`);
  console.log(`截图测试: ${screenshotPassed}/${screenshotResults.length} 通过`);
  
  const total = results.length;
  const passed = apiPassed + screenshotPassed;
  const rate = ((passed / total) * 100).toFixed(1);
  
  console.log(`总体通过率: ${rate}%\n`);
  
  // 详细结果
  console.log('📋 详细结果:\n');
  results.forEach(r => {
    if (r.type === 'screenshot') {
      const status = r.success 
        ? `✅ 通过 (${r.sizeKB}KB)` 
        : `❌ 失败`;
      console.log(`  ${r.name}: ${status}`);
    } else {
      const status = r.ok ? `✅ OK (HTTP ${r.status})` : `❌ 失败 (${r.status})`;
      console.log(`  ${r.name}: ${status}`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`📁 截图目录: ${screenshotDir}`);
  console.log('🎉 测试完成！\n');
  
  return { total, passed, rate, results };
}

main().catch(e => {
  console.error('\n❌ 测试失败:', e.message);
  process.exit(1);
});
