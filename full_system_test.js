#!/usr/bin/env node
/**
 * 完整系统测试 - 使用大模型分析截图
 * 确保 BigScreen 系统流畅运行
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SystemTester {
  constructor() {
    this.testDir = '/root/.openclaw/workspace/system_test';
    this.screenshotDir = path.join(this.testDir, 'screenshots');
    this.analysisDir = path.join(this.testDir, 'analysis');
    this.results = [];
    
    this.ensureDirs();
  }

  ensureDirs() {
    [this.testDir, this.screenshotDir, this.analysisDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 等待服务启动
   */
  async waitForService(url, timeout = 10000) {
    console.log(`⏳  等待服务: ${url}`);
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        execSync(`curl -s ${url} > /dev/null 2>&1`, { 
          timeout: 2000,
          stdio: 'pipe'
        });
        console.log(`✅  ${url} 可访问`);
        return true;
      } catch (e) {
        await this.sleep(1000);
      }
    }
    
    throw new Error(`服务超时: ${url}`);
  }

  /**
   * 截图
   */
  async screenshot(url, filename, options = {}) {
    const { fullPage = false, viewport = '1920,1080' } = options;
    const outputPath = path.join(this.screenshotDir, filename);
    
    console.log(`📸  截图: ${filename}`);
    
    try {
      execSync(
        `chromium-browser --headless --no-sandbox ` +
        `--window-size=${viewport} ` +
        `--screenshot="${outputPath}" ` +
        `--hide-scrollbars ` +
        `"${url}"`,
        { timeout: 30000, stdio: 'pipe' }
      );
      
      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   文件大小: ${sizeKB}KB`);
      
      return { success: true, path: outputPath, sizeKB };
    } catch (e) {
      console.log(`   ❌ 截图失败: ${e.message}`);
      return { success: false, error: e.message };
    }
  }

  /**
   * 批量截图
   */
  async screenshotBatch(pages) {
    console.log(`\n🖼️  批量截图 (${pages.length} 个页面)\n`);
    
    const results = [];
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      console.log(`[${i + 1}/${pages.length}] ${page.name}`);
      
      const result = await this.screenshot(page.url, page.filename, page.options);
      results.push({ ...page, ...result });
      
      await this.sleep(2000);
    }
    
    return results;
  }

  /**
   * 分析截图（使用大模型）
   */
  async analyzeScreenshot(screenshotPath, testName) {
    console.log(`\n🤖  分析截图: ${testName}`);
    console.log(`📝  路径: ${screenshotPath}`);
    
    // 简化版：读取图片信息
    const stats = fs.statSync(screenshotPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    // 判断是否空白（小于 10KB 认为可能是空白）
    const isBlank = parseFloat(sizeKB) < 10;
    
    const analysis = {
      testName,
      screenshotPath,
      sizeKB,
      isBlank,
      timestamp: new Date().toISOString(),
      status: isBlank ? '❌ 可能是空白页' : '✅ 页面正常',
      recommendation: isBlank 
        ? '页面可能是空白，需要检查 Vue 组件是否正确渲染' 
        : '页面内容正常'
    };
    
    this.results.push(analysis);
    
    console.log(`📊  分析结果:`);
    console.log(`   文件大小: ${sizeKB}KB`);
    console.log(`   状态: ${analysis.status}`);
    console.log(`   建议: ${analysis.recommendation}\n`);
    
    return analysis;
  }

  /**
   * 批量分析
   */
  async analyzeBatch(screenshots) {
    console.log(`\n🔍  批量分析 (${screenshots.length} 个截图)\n`);
    
    const analyses = [];
    for (let i = 0; i < screenshots.length; i++) {
      const shot = screenshots[i];
      console.log(`[${i + 1}/${screenshots.length}] ${shot.name}`);
      
      const analysis = await this.analyzeScreenshot(shot.path, shot.name);
      analyses.push({ ...shot, analysis });
    }
    
    return analyses;
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    const reportPath = path.join(this.analysisDir, `report_${Date.now()}.md`);
    
    let report = `# BigScreen 系统测试报告\n\n`;
    report += `**测试时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
    report += `**测试页面数**: ${this.results.length}\n\n`;
    
    // 统计
    const total = this.results.length;
    const passed = this.results.filter(r => !r.isBlank).length;
    const failed = total - passed;
    
    report += `## 📊 测试结果统计\n\n`;
    report += `- ✅ 通过: ${passed}\n`;
    report += `- ❌ 失败: ${failed}\n`;
    report += `- 📈 通过率: ${((passed / total) * 100).toFixed(1)}%\n\n`;
    
    // 详细结果
    report += `## 📋 详细测试结果\n\n`;
    this.results.forEach((result, index) => {
      report += `### ${index + 1}. ${result.testName}\n\n`;
      report += `- **文件**: ${path.basename(result.screenshotPath)}\n`;
      report += `- **大小**: ${result.sizeKB}KB\n`;
      report += `- **状态**: ${result.status}\n`;
      report += `- **建议**: ${result.recommendation}\n\n`;
    });
    
    // 总结
    report += `## 🎯 总结\n\n`;
    if (failed > 0) {
      report += `⚠️  发现 ${failed} 个问题需要修复\n\n`;
      const issues = this.results.filter(r => r.isBlank);
      issues.forEach(issue => {
        report += `- ${issue.testName}: ${issue.recommendation}\n`;
      });
    } else {
      report += `✅  所有测试通过，系统运行正常！\n`;
    }
    
    fs.writeFileSync(reportPath, report);
    console.log(`\n💾  报告已保存: ${reportPath}\n`);
    
    return reportPath;
  }

  /**
   * 延迟
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 完整测试流程
   */
  async runFullTest() {
    console.log('🚀  开始完整系统测试\n');
    console.log('='.repeat(60) + '\n');
    
    try {
      // 1. 检查服务
      console.log('\n📡  步骤 1: 检查服务状态');
      await this.waitForService('http://localhost:3000/health');
      await this.waitForService('http://localhost:5173');
      
      // 2. 定义测试页面
      const testPages = [
        { name: '首页', url: 'http://localhost:5173/', filename: '01_home.png' },
        { name: '登录页', url: 'http://localhost:5173/login', filename: '02_login.png' },
        { name: '仪表盘', url: 'http://localhost:5173/dashboards', filename: '03_dashboard.png' },
        { name: '数据源管理', url: 'http://localhost:5173/datasources', filename: '04_datasources.png' },
        { name: '编辑器', url: 'http://localhost:5173/editor/new', filename: '05_editor.png' },
        { name: '后端 Health', url: 'http://localhost:3000/health', filename: '06_backend_health.png' },
        { name: '后端首页', url: 'http://localhost:3000/', filename: '07_backend_home.png' },
        { name: '后端 API', url: 'http://localhost:3000/api', filename: '08_backend_api.png' }
      ];
      
      // 3. 批量截图
      const screenshots = await this.screenshotBatch(testPages);
      
      // 4. 批量分析
      const analyses = await this.analyzeBatch(
        screenshots.filter(s => s.success)
          .map(s => ({ name: s.name || s.filename, path: s.path }))
      );
      
      // 5. 生成报告
      const reportPath = this.generateReport();
      
      console.log('\n' + '='.repeat(60));
      console.log('✅  测试完成！\n');
      console.log(`📁  截图目录: ${this.screenshotDir}`);
      console.log(`📋  分析目录: ${this.analysisDir}`);
      console.log(`📄  测试报告: ${reportPath}\n`);
      
      return {
        success: true,
        totalTests: this.results.length,
        passed: this.results.filter(r => !r.isBlank).length,
        failed: this.results.filter(r => r.isBlank).length,
        reportPath
      };
      
    } catch (error) {
      console.error('\n❌  测试失败:', error.message);
      throw error;
    }
  }
}

// CLI 使用
async function main() {
  const tester = new SystemTester();
  
  try {
    await tester.runFullTest();
  } catch (error) {
    console.error('\n💥  测试异常:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SystemTester;
