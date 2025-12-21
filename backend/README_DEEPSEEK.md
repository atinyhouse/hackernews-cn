# DeepSeek API 集成说明

## 功能概述

本项目已集成 DeepSeek API 用于：
1. **标题翻译**: 将英文帖子标题翻译成中文
2. **内容翻译**: 将帖子内容和评论翻译成中文
3. **摘要生成**: 基于帖子标题、内容和评论n## 设置 API Key

### 方法 1: 环境变量（推荐）

在项目根目录创建 `.env` 文件：

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

然后在 `package.json` 中添加 dotenv:

```bash
npm install dotenv
```

在 `server.js` 最上方添加:

```javascript
require('dotenv').config();
```

### 方法 2: 直接在启动命令中设置

```bash
DEEPSEEK_API_KEY=your_api_key npm start
```

### 方法 3: 系统环境变量

Mac/Linux:
```bash
export DEEPSEEK_API_KEY=your_api_key
npm start
```

Windows:
```cmd
set DEEPSEEK_API_KEY=your_api_key
npm start
```

## 获取 DeepSeek API Key

1. 访问 DeepSeek 官网: https://platform.deepseek.com/
2. 注册账号并登录
3. 在控制台创建 API Key
4. 将 API Key 复制到环境变量中

## 工作模式

### 有 API Key 时
- 使用 DeepSeek API 进行高质量翻译和摘要
- API 调用参数:
  - Model: `deepseek-chat`
  - Temperature: 0.3 (更精确)
  - Max Tokens: 200-2000 (根据内容类型)

### 无 API Key 时（Fallback 模式）
- 自动使用关键词替换进行简单翻译
- 功能有限但不会中断服务
- 日志会显示警告: "警告: 未设置 DEEPSEEK_API_KEY，翻译功能将使用简单关键词替换"

## API 使用限制

DeepSeek API 的翻译和摘要生成策略：

1. **帖子标题**: 全部翻译（约 20 个/次抓取）
2. **帖子内容**: 前 1000 字符
3. **评论翻译**: 前 5 条，且每条不超过 500 字符
4. **摘要生成**: 使用标题 + 内容前 500 字 + 前 3 条评论

这些限制是为了：
- 控制 API 调用成本
- 加快数据抓取速度
- 保持合理的响应时间

## 手动触发数据抓取

如果你想测试 DeepSeek 翻译效果，可以手动触发数据抓取：

```bash
curl -X POST http://localhost:3000/api/fetch
```

或在前端页面点击"刷新数据"按钮。

## 费用预估

基于每次抓取 20 个帖子的场景：
- 标题翻译: 20 次调用
- 内容翻译: ~10 次（部分帖子有内容）
- 评论翻译: 20 × 5 = 100 次
- 摘要生成: 20 次

**每次完整抓取约 150 次 API 调用**

具体费用请参考 DeepSeek 官方定价。

## 代码位置

- **翻译器实现**: `/backend/deepseekTranslator.js`
- **使用位置**: `/backend/server.js` 的 `fetchAndStoreData()` 函数
- **数据库方法**: `/backend/database.js` 的 `updatePostAbstract()` 方法
