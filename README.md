# HackerNews 中文热议榜 🔥

一个基于 GitHub Pages 的 HackerNews 热门讨论中文翻译站点,使用 DeepSeek API 自动翻译并每天更新。

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 功能特点

### 核心功能
- 🔄 **GitHub Actions 自动更新**: 每天北京时间 8:00 自动抓取最新数据
- 🌏 **智能中文翻译**: 使用 DeepSeek AI 翻译标题、内容和评论
- 📊 **智能排序**: 支持按评论数和点赞数排序
- 💬 **完整评论树**: 获取并展示帖子的所有评论（支持嵌套显示）
- 📝 **AI 摘要生成**: 自动生成讨论摘要,体现多元观点
- 🔍 **搜索功能**: 支持中英文搜索
- 📱 **响应式设计**: 完美适配 PC 和移动端
- 📈 **数据统计**: 实时展示帖子数、评论数、点赞数
- 🚀 **零服务器成本**: 完全静态部署，无需后端服务器

### 技术亮点
- ⚡️ **React 18**: 使用最新的 React 框架构建
- 🎨 **Semi Design**: 字节跳动开源的企业级UI组件库
- 🤖 **AI 翻译**: DeepSeek API 提供专业的技术翻译
- 🔄 **自动化运维**: GitHub Actions 自动抓取和部署
- 📦 **Vite**: 快速的构建工具，开发体验极佳

## 🚀 部署到 GitHub Pages

### 1. Fork 或复制此仓库

### 2. 设置 DeepSeek API Key

1. 前往 [DeepSeek 官网](https://platform.deepseek.com/) 注册并获取 API Key
2. 在 GitHub 仓库的 Settings -> Secrets and variables -> Actions 中添加:
   - Name: `DEEPSEEK_API_KEY`
   - Value: 你的 DeepSeek API Key

### 3. 启用 GitHub Pages

1. 进入仓库 Settings -> Pages
2. Source 选择 `Deploy from a branch`
3. Branch 选择 `gh-pages`，目录选择 `/ (root)`
4. 保存设置

### 4. 手动触发第一次数据抓取

1. 进入 Actions 标签页
2. 选择 "Fetch HackerNews Data" workflow
3. 点击 "Run workflow" 按钮
4. 等待 workflow 运行完成（约 5-10 分钟）

### 5. 访问你的网站

访问 `https://你的用户名.github.io/仓库名/`

## 🔧 本地测试

### 生成测试数据

```bash
cd backend
npm install
DEEPSEEK_API_KEY=your_key node generate-static-data.js
```

### 本地预览

```bash
cd frontend
# 使用任何静态服务器，比如:
python3 -m http.server 8000
# 或
npx http-server
```

然后访问 `http://localhost:8000`

## ⏰ 自动更新

GitHub Actions workflow 会每天 UTC 0:00（北京时间 8:00）自动抓取最新数据并更新网站。

你也可以手动触发 workflow 来立即更新数据。

## 📁 项目结构

```
hackernews-cn/
├── .github/
│   └── workflows/
│       └── fetch-data.yml      # GitHub Actions 配置
├── backend/                     # 数据抓取脚本
│   ├── generate-static-data.js # 生成静态JSON数据
│   ├── hackerNewsAPI.js        # HackerNews API 封装
│   ├── deepseekTranslator.js   # DeepSeek 翻译模块
│   ├── package.json
│   └── output/                 # 生成的JSON文件
│       └── posts.json
├── frontend/                   # 前端页面
│   ├── index.html             # 首页
│   ├── post.html              # 详情页
│   └── data/                  # 数据文件（workflow生成）
│       └── posts.json
└── README.md
```

## 🎯 技术栈

- **前端**: 纯 HTML/CSS/JavaScript
- **数据抓取**: Node.js + HackerNews API
- **翻译**: DeepSeek API
- **部署**: GitHub Pages
- **自动化**: GitHub Actions

## 📝 开发路线图

- [x] GitHub Pages 静态部署
- [x] DeepSeek AI 自动翻译
- [x] GitHub Actions 自动化
- [x] AI 生成讨论摘要
- [ ] 支持多语言（英/中切换）
- [ ] 添加 RSS 订阅
- [ ] 趋势图表可视化
- [ ] PWA 支持

## 📄 许可证

MIT License

## 🙏 致谢

- [HackerNews](https://news.ycombinator.com/) - 数据来源
- [DeepSeek](https://platform.deepseek.com/) - AI 翻译服务
- [GitHub Pages](https://pages.github.com/) - 免费托管

---

**Enjoy! 🎉**

### 安装步骤
