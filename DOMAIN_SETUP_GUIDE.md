# 自定义域名配置指南

## 📋 完整流程

### 1. 购买域名

推荐的域名注册商：

#### 国际注册商（推荐）
- **Cloudflare Registrar** - https://www.cloudflare.com/products/registrar/
  - ✅ 价格透明，成本价销售
  - ✅ 免费 SSL 和 CDN
  - ✅ 隐私保护免费
  - 💰 约 $10-15/年（.com）

- **Namecheap** - https://www.namecheap.com/
  - ✅ 价格实惠，经常有优惠
  - ✅ 免费隐私保护
  - ✅ 界面友好
  - 💰 约 $8-12/年（.com）

- **Google Domains** (已转至 Squarespace)
  - ✅ 简单易用
  - ✅ 免费隐私保护
  - 💰 约 $12/年（.com）

#### 国内注册商
- **腾讯云** - https://dnspod.cloud.tencent.com/
- **阿里云** - https://wanwang.aliyun.com/
  - ⚠️ 需要实名认证
  - ⚠️ .cn 域名需要备案

### 2. 配置 DNS

假设你购买的域名是 `example.com`

#### 如果使用 Cloudflare（推荐）

1. **添加 A 记录**（用于 www 和根域名）：
   ```
   类型: A
   名称: @
   内容: 185.199.108.153
   TTL: Auto

   类型: A
   名称: @
   内容: 185.199.109.153

   类型: A
   名称: @
   内容: 185.199.110.153

   类型: A
   名称: @
   内容: 185.199.111.153
   ```

2. **添加 CNAME 记录**（用于 www 子域名）：
   ```
   类型: CNAME
   名称: www
   内容: atinyhouse.github.io
   TTL: Auto
   ```

#### 如果使用其他 DNS 服务商

在你的 DNS 管理面板中添加相同的记录。

### 3. 配置 GitHub Pages

#### 方法 1: 通过 GitHub 网页界面

1. 进入仓库：https://github.com/atinyhouse/hackernews-cn
2. 点击 **Settings** 标签
3. 左侧菜单找到 **Pages**
4. 在 **Custom domain** 输入框中填入你的域名（如 `example.com`）
5. 点击 **Save**
6. 等待 DNS 检查通过（可能需要几分钟）
7. 勾选 **Enforce HTTPS**（启用后需等待证书签发，约 10-30 分钟）

#### 方法 2: 通过 CNAME 文件（自动化）

在 `frontend-react/public/` 目录下创建一个名为 `CNAME` 的文件（无扩展名），内容为你的域名：

```
example.com
```

然后重新构建和部署，GitHub Pages 会自动识别。

### 4. 更新代码中的 URL

需要更新以下文件中的 URL：

#### `frontend-react/index.html`
```html
<!-- 更新 canonical URL -->
<link rel="canonical" href="https://example.com/" />

<!-- 更新 Open Graph -->
<meta property="og:url" content="https://example.com/" />

<!-- 更新 Twitter -->
<meta property="twitter:url" content="https://example.com/" />
```

#### `frontend-react/src/pages/PostDetailPage.jsx`
```javascript
// 更新 pageUrl
const pageUrl = `https://example.com/#/post/${id}`;
```

#### `frontend-react/public/robots.txt`
```
Sitemap: https://example.com/sitemap.xml
```

#### `frontend-react/public/sitemap.xml`
```xml
<loc>https://example.com/</loc>
```

### 5. 验证配置

#### 检查 DNS 传播
```bash
# 检查 A 记录
dig example.com

# 检查 CNAME 记录
dig www.example.com
```

#### 测试网站访问
1. 访问 `http://example.com` - 应该能打开
2. 访问 `https://example.com` - HTTPS 启用后应该能打开
3. 访问 `http://www.example.com` - 应该能打开

#### SEO 验证工具
- **Google Search Console** - https://search.google.com/search-console
- **Bing Webmaster Tools** - https://www.bing.com/webmasters
- **结构化数据测试** - https://search.google.com/test/rich-results

### 6. 提交到搜索引擎

#### Google Search Console
1. 访问 https://search.google.com/search-console
2. 添加你的网站域名
3. 验证所有权（HTML 文件验证最简单）
4. 提交 sitemap: `https://example.com/sitemap.xml`

#### Bing Webmaster Tools
1. 访问 https://www.bing.com/webmasters
2. 添加网站并验证
3. 提交 sitemap

### 7. 高级优化（可选）

#### 启用 Cloudflare CDN
如果使用 Cloudflare DNS，可以免费启用：
- 全球 CDN 加速
- DDoS 防护
- 自动 HTTPS
- 缓存优化

在 Cloudflare 面板中，确保云朵图标是橙色（代理已启用）。

#### 配置缓存策略
在 Cloudflare Page Rules 中添加：
```
URL: example.com/*
设置:
- Cache Level: Standard
- Browser Cache TTL: 4 hours
```

## ⚠️ 常见问题

### Q: DNS 配置后多久生效？
A: 通常 5-30 分钟，最长可能需要 48 小时全球传播。

### Q: HTTPS 证书多久签发？
A: GitHub Pages 自动签发，通常 10-30 分钟。如果超过 1 小时，检查 DNS 配置是否正确。

### Q: 使用 .cn 域名需要备案吗？
A: 如果托管在 GitHub Pages（海外服务器），不需要备案。但 .cn 域名本身在国内注册需要实名认证。

### Q: 如何强制使用 HTTPS？
A: 在 GitHub Pages 设置中勾选 "Enforce HTTPS"，并在 Cloudflare 中启用 "Always Use HTTPS"。

### Q: 网站打不开怎么办？
A:
1. 检查 DNS 配置是否正确
2. 等待 DNS 传播完成
3. 清除浏览器缓存
4. 使用 `dig` 命令检查域名解析

## 📝 示例配置清单

完成后，你的配置应该是这样的：

- [x] 域名购买完成
- [x] DNS A 记录指向 GitHub Pages IP
- [x] CNAME 记录配置完成（如果使用 www）
- [x] GitHub Pages 自定义域名设置完成
- [x] HTTPS 证书已签发并启用
- [x] 代码中的 URL 已更新
- [x] 网站可以通过自定义域名访问
- [x] 提交到 Google Search Console
- [x] 提交到 Bing Webmaster Tools

---

有任何问题，可以参考：
- [GitHub Pages 自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Cloudflare DNS 教程](https://developers.cloudflare.com/dns/)
