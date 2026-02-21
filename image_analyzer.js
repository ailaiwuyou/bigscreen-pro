#!/usr/bin/env node
/**
 * 图片识别工具 - 使用大模型分析图片内容
 * 支持识别截图中的错误、UI元素、文本内容等
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ImageAnalyzer {
  constructor() {
    this.tempDir = '/tmp/image_analysis';
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * 分析图片内容
   * @param {string} imagePath - 图片路径
   * @param {object} options - 分析选项
   * @returns {object} 分析结果
   */
  async analyze(imagePath, options = {}) {
    const {
      prompt = '请详细描述这张图片的内容，包括：1.页面标题和主要元素 2.是否有错误提示或错误信息 3.UI布局和设计 4.功能完整性 5.需要修复的问题',
      outputFormat = 'text' // 'text' | 'json'
    } = options;

    console.log(`🖼️  分析图片: ${imagePath}`);
    console.log(`📝  提示词: ${prompt.substring(0, 50)}...`);

    // 检查图片是否存在
    if (!fs.existsSync(imagePath)) {
      throw new Error(`图片文件不存在: ${imagePath}`);
    }

    // 获取图片信息
    const imageInfo = this.getImageInfo(imagePath);
    console.log(`📐  图片信息: ${imageInfo.width}x${imageInfo.height}, ${imageInfo.sizeKB}KB`);

    // 使用浏览器截图获取文本内容（如果是网页截图）
    const textContent = await this.extractTextFromImage(imagePath);

    // 分析结果
    const result = {
      imageInfo,
      textContent: textContent.substring(0, 500),
      analysis: await this.performAnalysis(imagePath, prompt),
      timestamp: new Date().toISOString()
    };

    return result;
  }

  /**
   * 获取图片基本信息
   */
  getImageInfo(imagePath) {
    try {
      const stats = fs.statSync(imagePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      
      // 尝试获取图片尺寸
      let width = 'unknown';
      let height = 'unknown';
      try {
        const identify = execSync(`identify "${imagePath}" 2>/dev/null || echo ''`, {
          encoding: 'utf-8'
        });
        if (identify) {
          const match = identify.match(/(\d+)x(\d+)/);
          if (match) {
            width = match[1];
            height = match[2];
          }
        }
      } catch (e) {
        // imagemagick 不可用，跳过
      }

      return { path: imagePath, sizeKB, width, height, exists: true };
    } catch (e) {
      return { path: imagePath, exists: false, error: e.message };
    }
  }

  /**
   * 从图片中提取文本（使用 OCR）
   */
  async extractTextFromImage(imagePath) {
    try {
      // 尝试使用 tesseract OCR
      const outputPath = path.join(this.tempDir, `text_${Date.now()}.txt`);
      execSync(`tesseract "${imagePath}" "${outputPath}" 2>/dev/null`, {
        timeout: 30000,
        stdio: 'pipe'
      });
      
      if (fs.existsSync(outputPath)) {
        const text = fs.readFileSync(outputPath, 'utf-8');
        fs.unlinkSync(outputPath);
        return text;
      }
      
      return '';
    } catch (e) {
      // OCR 不可用或失败，返回空
      return '';
    }
  }

  /**
   * 执行大模型分析
   * 这里可以集成各种大模型 API
   */
  async performAnalysis(imagePath, prompt) {
    console.log(`🤖  使用大模型分析...`);
    
    // 这里可以调用各种视觉大模型 API
    // 例如：OpenAI GPT-4V, Claude 3.5 Sonnet (vision), GLM-4V 等
    
    // 示例：调用 GLM-4V API
    const analysis = await this.callVisionAPI(imagePath, prompt);
    
    return analysis;
  }

  /**
   * 调用视觉大模型 API
   */
  async callVisionAPI(imagePath, prompt) {
    // 检查可用的视觉 API
    const apiConfigs = this.getAvailableAPIs();
    
    for (const api of apiConfigs) {
      try {
        console.log(`🔄  尝试使用 ${api.name}...`);
        const result = await api.analyze(imagePath, prompt);
        console.log(`✅  ${api.name} 分析成功`);
        return { provider: api.name, result };
      } catch (e) {
        console.log(`❌  ${api.name} 失败: ${e.message}`);
        continue;
      }
    }
    
    throw new Error('所有视觉 API 都不可用');
  }

  /**
   * 获取可用的视觉 API
   */
  getAvailableAPIs() {
    const apis = [];
    
    // 检查是否有 API key
    if (process.env.OPENAI_API_KEY) {
      apis.push({
        name: 'GPT-4V',
        analyze: async (imagePath, prompt) => {
          const base64Image = this.imageToBase64(imagePath);
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4-vision-preview',
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: base64Image } }
                  ]
                }
              ],
              max_tokens: 1000
            })
          });
          const data = await response.json();
          return data.choices[0].message.content;
        }
      });
    }

    // 检查是否有 GLM API key
    if (process.env.GLM_API_KEY) {
      apis.push({
        name: 'GLM-4V',
        analyze: async (imagePath, prompt) => {
          const base64Image = this.imageToBase64(imagePath);
          const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.GLM_API_KEY}`
            },
            body: JSON.stringify({
              model: 'glm-4v',
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: base64Image } }
                  ]
                }
              ]
            })
          });
          const data = await response.json();
          return data.choices[0].message.content;
        }
      });
    }

    return apis;
  }

  /**
   * 图片转 Base64
   */
  imageToBase64(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    return `data:image/${this.getImageType(imagePath)};base64,${imageBuffer.toString('base64')}`;
  }

  /**
   * 获取图片类型
   */
  getImageType(imagePath) {
    const ext = path.extname(imagePath).toLowerCase();
    const types = {
      '.png': 'png',
      '.jpg': 'jpeg',
      '.jpeg': 'jpeg',
      '.gif': 'gif',
      '.webp': 'webp'
    };
    return types[ext] || 'png';
  }

  /**
   * 批量分析多个图片
   */
  async analyzeBatch(imagePaths, options = {}) {
    const results = [];
    
    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      console.log(`\n[${i + 1}/${imagePaths.length}] 分析: ${imagePath}`);
      
      try {
        const result = await this.analyze(imagePath, options);
        results.push({ success: true, path: imagePath, result });
      } catch (e) {
        results.push({ success: false, path: imagePath, error: e.message });
      }
    }
    
    return results;
  }
}

// CLI 使用
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法: node image_analyzer.js <图片路径> [选项]');
    console.log('');
    console.log('选项:');
    console.log('  --prompt "<提示词>"   自定义分析提示词');
    console.log('  --batch              批量分析（多个图片）');
    console.log('  --json               输出 JSON 格式');
    console.log('');
    console.log('示例:');
    console.log('  node image_analyzer.js screenshot.png');
    console.log('  node image_analyzer.js screenshot.png --prompt "描述页面错误"');
    console.log('  node image_analyzer.js *.png --batch --json');
    process.exit(1);
  }

  const analyzer = new ImageAnalyzer();
  
  // 解析选项
  let imagePath = args[0];
  let prompt = '请详细描述这张图片的内容，包括：1.页面标题和主要元素 2.是否有错误提示或错误信息 3.UI布局和设计 4.功能完整性 5.需要修复的问题';
  let batch = false;
  let outputJson = false;
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--batch') batch = true;
    else if (arg === '--json') outputJson = true;
    else if (arg.startsWith('--prompt=')) prompt = arg.split('=')[1];
  }

  try {
    let result;
    
    if (batch) {
      const imagePaths = args.filter(arg => !arg.startsWith('--'));
      result = await analyzer.analyzeBatch(imagePaths, { prompt });
    } else {
      result = await analyzer.analyze(imagePath, { prompt });
    }
    
    if (outputJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('\n✅ 分析完成!');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (e) {
    console.error('❌ 分析失败:', e.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ImageAnalyzer;
