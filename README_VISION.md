# 图片识别工具 - 大模型视觉分析

## 📖 功能说明

创建了两款基于大模型的图片识别工具：

### 1. **image_analyzer.js** - 完整版
- 支持单张图片分析
- 支持批量分析
- 支持自定义提示词
- 支持多种视觉 API（OpenAI GPT-4V、GLM-4V 等）
- 自动检测图片信息（尺寸、大小）
- OCR 文本提取（可选）

### 2. **vision_helper.js** - 简化版
- 专注于网页截图分析
- 预设专业的分析提示词
- 支持目录批量分析
- JSON 格式输出结果
- 更易于集成到工作流

## 🚀 快速开始

### 基本使用

```bash
# 分析单张图片
node /root/.openclaw/workspace/code/vision_helper.js screenshot.png

# 自定义提示词
node /root/.openclaw/workspace/code/vision_helper.js screenshot.png \
  --prompt "请检查这个页面是否有错误"

# 批量分析目录
node /root/.openclaw/workspace/code/vision_helper.js ./screenshots/ --dir
```

### 配置 API Key

```bash
# 使用 OpenAI GPT-4V
export OPENAI_API_KEY=sk-proj-xxx

# 使用智谱 AI GLM-4V
export GLM_API_KEY=xxx

# 然后运行分析
node vision_helper.js screenshot.png
```

## 📋 使用场景

### 场景 1: 自动检测截图错误

```bash
# 分析当前截图目录
node vision_helper.js /root/.openclaw/workspace/test_screenshots/ --dir
```

### 场景 2: 分析登录流程

```bash
# 分析登录流程截图
node vision_helper.js /root/.openclaw/workspace/test_screenshots/02_login.png \
  --prompt "请分析登录页面的完整性，检查表单、按钮、验证码等元素"
```

### 场景 3: 批量测试验证

```bash
# 批量分析所有测试截图
node vision_helper.js ./test_results/ --dir \
  --prompt "请检查页面功能是否正常，识别任何错误或异常"
```

## 🔧 集成到 OpenClaw

### 方法 1: 直接调用

```javascript
const { analyzeImageWithLLM } = require('./vision_helper.js');

// 分析截图
const result = await analyzeImageWithLLM('/path/to/screenshot.png');

if (result.success) {
  console.log('分析结果:', result.result);
} else {
  console.error('分析失败:', result.error);
}
```

### 方法 2: 创建封装工具

```javascript
// tools/vision_analyzer.js
const { analyzeImageWithLLM } = require('../code/vision_helper.js');

async function analyzeScreenshot(imagePath) {
  return await analyzeImageWithLLM(imagePath, 
    "请检查页面错误、UI 问题、功能完整性");
}

module.exports = { analyzeScreenshot };
```

## 📊 分析提示词模板

### 通用页面分析
```
请详细描述这张图片的内容，包括：
1. 页面标题和主要元素
2. 是否有错误提示或错误信息
3. UI 布局和设计
4. 功能完整性
5. 需要修复的问题
```

### 错误检测
```
请仔细检查这张截图，识别：
1. 任何错误提示、警告信息
2. 空白区域、加载失败
3. 样式问题、布局错乱
4. 按钮不可点击、表单异常
5. 404、500 等 HTTP 错误
```

### 功能验证
```
请验证此页面的功能：
1. 所有组件是否正确渲染
2. 按钮和链接是否可用
3. 表单字段是否正常显示
4. 数据是否正确加载
5. 交互是否响应正常
```

## 🎯 实际应用示例

### 自动测试流程

```javascript
// 自动化测试脚本
const { analyzeImageWithLLM } = require('./vision_helper.js');

async function runTestFlow() {
  // 1. 截取首页
  const homeScreenshot = await captureScreenshot('http://localhost:5173/');
  
  // 2. 分析首页
  const homeAnalysis = await analyzeImageWithLLM(homeScreenshot,
    "请检查首页是否正常显示");
  
  if (homeAnalysis.success && !homeAnalysis.result.includes('错误')) {
    // 3. 截取登录页
    const loginScreenshot = await captureScreenshot('http://localhost:5173/login');
    
    // 4. 分析登录页
    const loginAnalysis = await analyzeImageWithLLM(loginScreenshot,
      "请检查登录页面的完整性");
    
    return { home: homeAnalysis, login: loginAnalysis };
  }
}
```

### 集成到 CI/CD

```bash
# 测试脚本中
npm run test:visual

# package.json
{
  "scripts": {
    "test:visual": "node vision_helper.js ./screenshots/ --dir"
  }
}
```

## 💡 最佳实践

1. **设置 API Key**: 选择一个可靠的视觉 API（GPT-4V 或 GLM-4V）
2. **优化提示词**: 根据具体场景定制分析提示词
3. **批量处理**: 使用目录批量分析提高效率
4. **结果保存**: 将分析结果保存为 JSON 便于后续处理
5. **错误处理**: 捕获并处理 API 调用失败的情况

## 🔒 安全建议

- 不要在代码中硬编码 API Key
- 使用环境变量或密钥管理服务
- 定期轮换 API Key
- 限制 API 权限范围

## 📈 扩展功能

- 添加更多视觉 API（Claude Vision、Google Gemini 等）
- 实现图像差异对比（前后对比）
- 添加 OCR 文本提取
- 支持视频帧分析
- 集成到自动化测试框架
