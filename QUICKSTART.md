# HackerNews 中文热议榜 - 快速启动指南

## 🚀 5分钟快速启动

### 第一步：安装依赖
```bash
cd ~/Desktop/hackernews-cn/backend
npm install
```

### 第二步：初始化数据库
```bash
npm run init-db
```

### 第三步：启动后端服务
```bash
npm start
```

等待首次数据抓取完成（约 2-3 分钟）。

### 第四步：打开前端页面

**方法 1: 直接打开文件**
- 在 Finder 中双击 `frontend/index.html`

**方法 2: 使用 Python HTTP 服务器**
```bash
cd ~/Desktop/hackernews-cn/frontend
python3 -m http.server 8080
```
然后访问: http://localhost:8080

## 📱 使用说明

1. **查看热门帖子**: 首页自动展示最新的 20 条热门帖子
2. **查看详情**: 点击任意帖子卡片查看详细信息和评论
3. **搜索**: 使用顶部搜索框搜索关键词
4. **手动刷新**: 点击"刷新数据"按钮手动触发数据抓取

## 🔧 常见问题

### Q1: 前端显示"无法连接到服务器"
**A:** 确保后端服务正在运行 (在 backend 目录执行 `npm start`)

### Q2: 首次启动很慢
**A:** 首次启动会自动抓取数据，需要 2-3 分钟，请耐心等待

### Q3: 如何修改抓取频率
**A:** 编辑 `backend/server.js`，修改 cron.schedule 配置

### Q4: 数据存储在哪里
**A:** SQLite 数据库文件在 `backend/data/hackernews.db`

## 🎯 下一步

- 查看 README.md 了解完整文档
- 探索 API 文档
- 自定义界面样式
- 部署到云服务器

## 📞 需要帮助？

查看完整文档: `README.md`

祝使用愉快！🎉
