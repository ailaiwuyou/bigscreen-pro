#!/usr/bin/env node
const { execSync } = require('child_process');
const http = require('http');

const SCREENSHOT_DIR = '/root/.openclaw/workspace/detailed_test_screenshots';
const BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

// 创建截图目录
execSync(`mkdir -p ${SCREENSHOT_DIR}`);

function screenshot(url, filename) {
  const outputPath = `${SCREENSHOT_DIR}/${filename}`;
  console.log(`📸 截图: ${url} -> ${filename}`);
  try {
    execSync(`chromium-browser --headless --no-sandbox --window-size=1280,800 --screenshot="${outputPath}" --hide-scrollbars "${url}" 2>&1`, {
      timeout: 30000,
      stdio: 'pipe'
    });
    console.log(`✓ 截图成功: ${filename}`);
    return true;
  } catch (e) {
    console.log(`✗ 截图失败: ${e.message}`);
    return false;
  }
}

function apiTest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', (e) => {
      resolve({ error: e.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== BigScreen 功能细节测试 ===\n');

  // 1. 后端基础功能测试
  console.log('--- 后端 API 测试 ---');
  
  const health = await apiTest('/health');
  console.log('Health API:', health.status === 200 ? '✓' : '✗', health.data.substring(0, 100));
  screenshot(BASE_URL, '01_backend_home.png');
  
  const dashboards = await apiTest('/api/dashboards');
  console.log('Dashboards API:', dashboards.status, dashboards.data.substring(0, 100));
  
  const users = await apiTest('/api/users');
  console.log('Users API:', users.status, users.data.substring(0, 100));
  
  // 测试登录
  const login = await apiTest('/api/auth/login', 'POST', {
    email: 'admin@example.com',
    password: 'admin123'
  });
  console.log('Login API:', login.status, login.data.substring(0, 100));
  
  screenshot(BASE_URL + '/api', '02_backend_api.png');

  // 2. 前端功能测试
  console.log('\n--- 前端页面测试 ---');
  
  screenshot(FRONTEND_URL, '03_frontend_home.png');
  screenshot(FRONTEND_URL + '/login', '04_frontend_login.png');
  screenshot(FRONTEND_URL + '/dashboard', '05_frontend_dashboard.png');
  
  // 3. 总结
  console.log('\n=== 测试完成 ===');
  console.log('截图保存在:', SCREENSHOT_DIR);
  
  const files = execSync(`ls -lh ${SCREENSHOT_DIR}/`).toString();
  console.log('\n截图文件列表:\n', files);
}

runTests().catch(console.error);
