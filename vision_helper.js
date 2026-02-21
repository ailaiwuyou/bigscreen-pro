#!/usr/bin/env node
/**
 * 视觉分析助手 - 使用大模型识别图片
 * 集成到现有工作流中
 */

const fs = require('fs');
const path = require('path');

/**
 * 使用大模型分析图片（简化版）
 * 可以集成到 OpenClaw 工作流中
 */
async function analyzeImageWithLLM(imagePath, customPrompt) {
  const defaultPrompt = `请仔细分析这张截图，回答以下问题：

1. **页面内容**：这是什么页面？主要内容是什么？
2. **错误检测**：是否有任何错误提示、警告信息、空白区域、破损元素？
3. **UI状态**：页面是否正常渲染？是否有样式问题、布局错乱？
4. **功能性**：页面功能是否完整？按钮、表单、链接是否可用？
5. **问题总结**：如果存在问题，请详细描述问题并给出修复建议。

请用中文回答，格式清晰。`;

  const prompt = customPrompt || defaultPrompt;
  const imageBase64 = imageToBase64(imagePath);

  console.log('🖼️  分析图片:', imagePath);
  console.log('📝  使用提示词:', prompt.substring(0, 50) + '...');

  // 检查是否有可用的 API key
  const apiType = detectAvailableAPI();
  
  if (!apiType) {
    throw new Error('未找到可用的视觉 API，请设置环境变量：');
  }

  console.log(`🤖  使用 ${apiType.name} 进行分析...`);

  try {
    const result = await apiType.analyze(imageBase64, prompt);
    console.log('\n✅ 分析完成!\n');
    console.log('='.repeat(60));
    console.log(result);
    console.log('='.repeat(60));
    
    return {
      success: true,
      provider: apiType.name,
      result: result,
      imagePath: imagePath
    };
  } catch (error) {
    console.error('❌ 分析失败:', error.message);
    return {
      success: false,
      error: error.message,
      imagePath: imagePath
    };
  }
}

/**
 * 检测可用的 API
 */
function detectAvailableAPI() {
  // 优先使用 OpenAI
  if (process.env.OPENAI_API_KEY) {
    return {
      name: 'OpenAI GPT-4V',
      analyze: async (imageBase64, prompt) => {
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
                  { type: 'image_url', image_url: { url: imageBase64 } }
                ]
              }
            ],
            max_tokens: 1500
          })
        });
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message);
        }
        
        return data.choices[0].message.content;
      }
    };
  }

  // 尝试使用 GLM（智谱 AI）
  if (process.env.GLM_API_KEY) {
    return {
      name: 'GLM-4V',
      analyze: async (imageBase64, prompt) => {
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
                  { type: 'image_url', image_url: { url: imageBase64 } }
                ]
              }
            ]
          })
        });
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message);
        }
        
        return data.choices[0].message.content;
      }
    };
  }

  // 默认返回 null
  return null;
}

/**
 * 图片转 Base64
 */
function imageToBase64(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  }[ext] || 'image/png';

  const imageBuffer = fs.readFileSync(imagePath);
  return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
}

/**
 * 批量分析截图目录
 */
async function analyzeScreenshotsDir(dirPath, customPrompt) {
  console.log(`📁 分析目录: ${dirPath}\n`);
  
  const files = fs.readdirSync(dirPath);
  const images = files
    .filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file))
    .map(file => path.join(dirPath, file))
    .sort();

  console.log(`📊 找到 ${images.length} 张图片\n`);

  const results = [];
  for (let i = 0; i < images.length; i++) {
    const imagePath = images[i];
    console.log(`\n[${i + 1}/${images.length}] ${path.basename(imagePath)}`);
    console.log('-'.repeat(60));
    
    const result = await analyzeImageWithLLM(imagePath, customPrompt);
    results.push(result);
    
    // 避免请求过快
    if (i < images.length - 1) {
      await sleep(2000);
    }
  }

  return results;
}

/**
 * 延迟函数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('用法: node vision_helper.js <图片路径或目录> [选项]');
    console.log('');
    console.log('选项:');
    console.log('  --prompt "<提示词>"   自定义分析提示词');
    console.log('  --dir                分析整个目录');
    console.log('');
    console.log('环境变量:');
    console.log('  OPENAI_API_KEY        OpenAI API Key (用于 GPT-4V)');
    console.log('  GLM_API_KEY            智谱 AI API Key (用于 GLM-4V)');
    console.log('');
    console.log('示例:');
    console.log('  node vision_helper.js screenshot.png');
    console.log('  node vision_helper.js screenshot.png --prompt "检查错误"');
    console.log('  node vision_helper.js ./screenshots/ --dir');
    process.exit(1);
  }

  const inputPath = args[0];
  let customPrompt = null;
  let isDir = false;

  // 解析选项
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dir') isDir = true;
    else if (arg.startsWith('--prompt=')) customPrompt = arg.split('=')[1];
  }

  try {
    let results;

    if (isDir || fs.statSync(inputPath).isDirectory()) {
      results = await analyzeScreenshotsDir(inputPath, customPrompt);
    } else {
      results = await analyzeImageWithLLM(inputPath, customPrompt);
    }

    // 保存结果
    const outputPath = path.join('/tmp', `vision_analysis_${Date.now()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 分析结果已保存到: ${outputPath}`);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    if (error.message.includes('未找到可用的视觉 API')) {
      console.log('\n💡 提示: 请设置以下环境变量之一:');
      console.log('   export OPENAI_API_KEY=sk-xxx');
      console.log('   export GLM_API_KEY=xxx');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeImageWithLLM, analyzeScreenshotsDir };
