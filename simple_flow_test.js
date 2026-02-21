#!/usr/bin/env node
const { execSync } = require('child_process');
const http = require('http');

// 创建截图目录
execSync('mkdir -p /root/.openclaw/workspace/flow');

function screenshot(url, filename, description) {
  const outputPath = `/root/.openclaw/workspace/flow/${filename}`;
  console.log(`📸 ${description}`);
  console.log(`   URL: ${url}`);
  try {
    execSync(`chromium-browser --headless --no-sandbox --window-size=1280,800 --screenshot="${outputPath}" --hide-scrollbars "${url}"`, {
      timeout: 30000,
      stdio: 'pipe'
    });
    console.log(`✓ 截图完成\n`);
    return true;
  } catch (e) {
    console.log(`✗ 截图失败: ${e.message}\n`);
    return false;
  }
}

async function testFlow() {
  console.log('🚀 开始测试用户流程\n');
  console.log('='.repeat(60) + '\n');

  // 步骤1: 首页
  console.log('📍 步骤1: 访问首页');
  screenshot('http://localhost:5173/', '01_home.png', '首页');

  // 步骤2: 登录页
  console.log('📍 步骤2: 访问登录页');
  screenshot('http://localhost:5173/login', '02_login.png', '登录页');

  // 步骤3: 测试登录API
  console.log('📍 步骤3: 测试登录API');
  try {
    const loginData = JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('   登录响应:', res.statusCode);
        console.log('   响应内容:', data.substring(0, 100));
      });
    });

    req.on('error', (e) => {
      console.log('   ❌ 登录失败:', e.message);
    });

    req.write(loginData);
    req.end();
  } catch (e) {
    console.log('   ❌ 测试失败:', e.message);
  }

  console.log('');

  // 步骤4: 假设登录成功后访问仪表盘
  console.log('📍 步骤4: 访问仪表盘（需要登录）');
  screenshot('http://localhost:5173/dashboards', '04_dashboard.png', '仪表盘');

  console.log('='.repeat(60));
  console.log('✅ 测试完成！');
  console.log('📁 截图位置: /root/.openclaw/workspace/flow/\n');
}

testFlow();
