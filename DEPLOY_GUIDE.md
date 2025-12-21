# GitHub Pages 部署完整指南

这是一份为代码小白准备的完整部署指南，我会带你一步步完成所有操作。

## 你需要准备的

1. 一个 GitHub 账号
2. DeepSeek API Key（已有）

## 部署步骤

### 步骤 1: 初始化 Git 仓库

已经在本地为你准备好了代码，现在需要把它变成 Git 仓库。

执行命令：
```bash
cd ~/Desktop/hackernews-cn
git init
git add .
git commit -m "Initial commit: HackerNews Chinese site"
```

### 步骤 2: 在 GitHub 创建仓库

1. 打开浏览器，访问 https://github.com/new
2. 填写信息：
   - Repository name: `hackernews-cn`（或你喜欢的名字）
   - Description: `HackerNews 中文热议榜`
   - 选择 Public（公开）
   - 不要勾选任何初始化选项
3. 点击 "Create repository"

### 步骤 3: 关联并推送到 GitHub

在创建仓库后，GitHub 会显示一些命令。执行：

```bash
git remote add origin https://github.com/你的用户名/hackernews-cn.git
git branch -M main
git push -u origin main
```

### 步骤 4: 配置 GitHub Secrets

1. 在你的 GitHub 仓库页面，点击 Settings
2. 左侧菜单找到 "Secrets and variables" -> "Actions"
3. 点击 "New repository secret"
4. 添加密钥：
   - Name: `DEEPSEEK_API_KEY`
   - Value: 粘贴你的 DeepSeek API Key
5. 点击 "Add secret"

### 步骤 5: 启用 GitHub Pages

1. 在 Settings 页面
2. 左侧菜单找到 "Pages"
3. Source 选择 "Deploy from a branch"
4. Branch 选择 `gh-pages`，目录选择 `/ (root)`
5. 点击 "Save"

### 步骤 6: 手动触发第一次 Workflow

1. 在仓库页面点击 "Actions" 标签
2. 找到 "Fetch HackerNews Data" workflow
3. 点击右侧 "Run workflow" 按钮
4. 点击绿色的 "Run workflow" 确认
5. 等待 workflow 运行完成（约 5-10 分钟）

### 步骤 7: 访问你的网站

Workflow 运行成功后，访问：
```
https://你的GitHub用户名.github.io/hackernews-cn/
```

## 自动更新

网站会在每天北京时间 8:00 自动更新数据，无需手动操作。

## 常见问题

### Q: Workflow 失败了怎么办？
A: 点击失败的 workflow，查看错误信息。常见原因：
- DEEPSEEK_API_KEY 没有正确配置
- API Key 额度不足

### Q: 网站打不开怎么办？
A:
1. 确认 workflow 已经成功运行
2. 检查 GitHub Pages 设置是否正确
3. 等待几分钟，GitHub Pages 需要时间部署

### Q: 如何修改更新时间？
A: 编辑 `.github/workflows/fetch-data.yml` 文件中的 cron 表达式

## 技术支持

如有问题，可以：
1. 查看 GitHub Actions 的运行日志
2. 检查浏览器控制台的错误信息
3. 在 GitHub Issues 中提问
