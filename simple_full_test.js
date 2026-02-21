#!/usr/bin/env node
/**
 * BigScreen 完整系统测试 - 按照用户手册流程测试
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = '/root/.openclaw/workspace/full_test_screenshots';
const testReport = [];

async function main() {
  console.log('🚀 BigScreen 完整系统测试');
  console.log('📋 按照用户手册流程测试\n');
  console.log('='.repeat(70));

  // 创建截图目录
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const steps = [
    {
      name: '1_访问首页',
      url: 'http://localhost:5173/',
      description: '访问系统首页，查看欢迎信息和功能入口',
      elements: {
        'BigScreen标题': 'h1',
        '欢迎信息': 'h2, .subtitle',
        '创建按钮': 'button'
      }
    },
    {
      name: '2_登录页面',
      url: 'http://localhost:5173/login',
      description: '访问登录页面，查看登录表单',
      elements: {
        '登录标题': 'h1',
        '用户名输入框': 'input[type="text"]',
        '密码输入框': 'input[type="password"]',
        '登录按钮': 'button'
      }
    },
    {
      name: '3_仪表盘列表',
      url: 'http://localhost:5173/dashboards',
      description: '访问仪表盘列表页面',
      elements: {
        '页面标题': 'h1',
        '仪表盘卡片': '.el-card',
        '创建按钮': 'button'
      }
    },
    {
      name: '4_数据源管理',
      url: 'http://localhost:5173/datasources',
      description: '访问数据源管理页面',
      elements: {
        '页面标题': 'h1',
        '数据源列表': '.el-card',
        '添加按钮': 'button'
      }
    },
    {
      name: '5_编辑器',
      url: 'http://localhost:5173/editor/new',
      description: '访问仪表盘编辑器',
      elements: {
        '工具栏': '.toolbar',
        '组件库': '.components',
        '画布区域': '.canvas'
      }
    }
  ];

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📌 步骤 ${i + 1}: ${step.name}`);
      console.log(`   描述: ${step.description}`);
      console.log(`   URL: ${step.url}`);

      const filename = `${step.name}.png`;
      const filepath = path.join(screenshotDir, filename);

      try {
        // 访问页面
        const response = await page.goto(step.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        const status = response?.status() || 0;
        console.log(`   HTTP 状态: ${status}`);

        if (status === 200) {
          // 截图
          await page.screenshot({ path: filepath, fullPage: true });
          console.log(`   📸 截图: ${filename}`);

          // 检查元素
          const results = {};
          for (const [elementName, selector] of Object.entries(step.elements)) {
            const element = await page.$(selector);
            results[elementName] = !!element;
            console.log(`   ${element ? '✅' : '❌'} ${elementName}`);
          }

          // 等待控制台错误
          await new Promise(resolve => setTimeout(resolve, 1000));

          const allElementsFound = Object.values(results).every(v => v);

          testReport.push({
            step: step.name,
            url: step.url,
            description: step.description,
            success: allElementsFound,
            elements: results,
            error: allElementsFound ? null : '部分元素未找到'
          });
        } else {
          testReport.push({
            step: step.name,
            url: step.url,
            description: step.description,
            success: false,
            error: `HTTP ${status}`
          });
        }

      } catch (error) {
        console.log(`   ❌ 执行失败: ${error.message}`);
        testReport.push({
          step: step.name,
          url: step.url,
          description: step.description,
          success: false,
          error: error.message
        });
      }

      // 等待一下
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

  } finally {
    await browser.close();
  }

  // 生成测试报告
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 测试结果汇总\n');

  const passed = testReport.filter(r => r.success).length;
  const failed = testReport.length - passed;

  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 通过率: ${((passed / testReport.length) * 100).toFixed(1)}%\n`);

  // 详细结果
  console.log('📋 详细结果:\n');
  testReport.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.step}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   描述: ${result.description}`);
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    if (result.elements) {
      Object.entries(result.elements).forEach(([key, value]) => {
        console.log(`   ${value ? '✅' : '❌'} ${key}`);
      });
    }
    console.log('');
  });

  // 保存报告
  const reportPath = path.join(screenshotDir, 'full_test_report.md');
  let report = `# BigScreen 完整系统测试报告\n\n`;
  report += `**测试时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
  report += `**测试步骤**: ${testReport.length}\n\n`;
  report += `## 📊 结果统计\n\n`;
  report += `- ✅ 通过: ${passed}\n`;
  report += `- ❌ 失败: ${failed}\n`;
  report += `- 📈 通过率: ${((passed / testReport.length) * 100).toFixed(1)}%\n\n`;
  report += `## 📋 详细结果\n\n`;

  testReport.forEach((result, index) => {
    report += `### ${index + 1}. ${result.step}\n\n`;
    report += `- **URL**: ${result.url}\n`;
    report += `- **描述**: ${result.description}\n`;
    report += `- **状态**: ${result.success ? '✅ 通过' : '❌ 失败'}\n`;
    if (result.error) {
      report += `- **错误**: ${result.error}\n`;
    }
    report += '\n';
  });

  fs.writeFileSync(reportPath, report);

  console.log(`📄 测试报告: ${reportPath}`);
  console.log(`📁 截图目录: ${screenshotDir}`);
  console.log('\n🎉 测试完成！\n');
}

main().catch(error => {
  console.error('\n❌ 测试失败:', error.message);
  process.exit(1);
});
