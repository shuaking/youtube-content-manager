# Vercel 部署指南

## 概述

本指南将帮助你将 YouTube 内容管理系统部署到 Vercel 云平台。

---

## 部署前准备

### 1. 必需的账号和凭证

#### 1.1 GitHub 账号
- 用于托管代码仓库
- Vercel 将从 GitHub 拉取代码

#### 1.2 Vercel 账号
- 访问 https://vercel.com
- 使用 GitHub 账号登录（推荐）

#### 1.3 YouTube API Key
- **必需**：系统核心功能依赖
- 获取方式：参考 `docs/YOUTUBE_API_GUIDE.md`
- ⚠️ **重要**：使用新的 API Key，不要使用已泄露的旧 Key

#### 1.4 Supabase 凭证（可选）
- **可选**：不配置则使用纯本地模式
- 如需云端存储，参考 `docs/SUPABASE_SETUP.md`

### 2. 代码准备

#### 2.1 推送代码到 GitHub

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: ready for Vercel deployment"

# 添加远程仓库
git remote add origin https://github.com/your-username/your-repo-name.git

# 推送到 GitHub
git push -u origin master
```

#### 2.2 确认 .gitignore 配置

确保以下文件/目录已被忽略：

```gitignore
# 已在 .gitignore 中
.env.local
.env*.local
node_modules/
.next/
data/
```

⚠️ **重要**：不要将 `.env.local` 推送到 GitHub！

---

## 部署步骤

### 第 1 步：导入项目到 Vercel

#### 1.1 登录 Vercel
1. 访问 https://vercel.com
2. 点击 **"Login"**
3. 使用 GitHub 账号登录

#### 1.2 创建新项目
1. 点击 **"Add New..."** → **"Project"**
2. 选择你的 GitHub 仓库
3. 点击 **"Import"**

### 第 2 步：配置项目设置

#### 2.1 基本设置

在 "Configure Project" 页面：

- **Project Name**: `youtube-content-manager`（或自定义）
- **Framework Preset**: Next.js（自动检测）
- **Root Directory**: `./`（默认）
- **Build Command**: `npm run build`（默认）
- **Output Directory**: `.next`（默认）
- **Install Command**: `npm install`（默认）

#### 2.2 环境变量配置

点击 **"Environment Variables"** 展开，添加以下变量：

##### 必需变量

**YOUTUBE_API_KEY**
- Value: `你的新 YouTube API Key`
- Environment: Production, Preview, Development（全选）

##### 可选变量（如果使用 Supabase）

**NEXT_PUBLIC_SUPABASE_URL**
- Value: `https://xxxxxxxxxxxxx.supabase.co`
- Environment: Production, Preview, Development（全选）

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Environment: Production, Preview, Development（全选）

#### 2.3 高级设置（可选）

展开 **"Advanced"**：

- **Node.js Version**: 20.x（推荐）
- **Region**: Singapore (sin1)（中国用户推荐）

### 第 3 步：部署

1. 点击 **"Deploy"** 按钮
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后，会显示项目 URL

---

## 部署后配置

### 1. 验证部署

#### 1.1 访问生产环境
```
https://your-project-name.vercel.app
```

#### 1.2 测试核心功能
- ✅ 访问首页
- ✅ 访问 `/catalog` - 查看内容目录
- ✅ 访问 `/admin` - 测试添加视频
- ✅ 检查图片是否正常加载

### 2. 配置自定义域名（可选）

#### 2.1 添加域名
1. 进入项目 Settings → Domains
2. 点击 **"Add"**
3. 输入你的域名（如 `yourdomain.com`）
4. 按照提示配置 DNS 记录

#### 2.2 DNS 配置示例
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. 配置 Supabase（如果使用）

#### 3.1 更新 Supabase 允许的域名
1. 进入 Supabase 项目
2. Settings → API → URL Configuration
3. 添加你的 Vercel 域名：
   ```
   https://your-project-name.vercel.app
   https://yourdomain.com
   ```

---

## 重要注意事项

### 1. 数据持久化问题 ⚠️

**问题**：Vercel 是无服务器环境，本地 JSON 文件不会持久化。

**解决方案**：

#### 选项 1：使用 Supabase（推荐）
- 配置 Supabase 环境变量
- 数据存储在云端数据库
- 支持多实例访问

#### 选项 2：使用 Vercel KV（备选）
- Vercel 提供的 Redis 存储
- 需要额外配置
- 免费额度有限

#### 选项 3：纯展示模式
- 不配置 Supabase
- 每次部署时预填充数据
- 适合静态展示网站

**当前配置**：系统会自动降级为纯本地模式，但数据不会持久化。

### 2. API 配额管理

#### YouTube API 配额
- 免费配额：10,000 单位/天
- 每次视频查询：约 3-5 单位
- 建议：添加缓存机制

#### Supabase 配额
- 免费额度：500 MB 数据库
- 5 GB 带宽/月
- 对个人项目足够

### 3. 环境变量安全

✅ **正确做法**：
- 在 Vercel 仪表板配置环境变量
- 不要将 `.env.local` 提交到 Git

❌ **错误做法**：
- 将 API Key 硬编码在代码中
- 将 `.env.local` 推送到 GitHub

### 4. 图片优化

当前配置：
```typescript
// next.config.ts
images: {
  unoptimized: true,  // 已禁用优化
}
```

**原因**：Next.js Image Optimization 在 standalone 模式下不可用。

**影响**：图片直接从 YouTube CDN 加载，无性能问题。

---

## 持续部署（CI/CD）

### 自动部署

Vercel 已自动配置 CI/CD：

```
Git Push → GitHub → Vercel 自动部署
```

**触发条件**：
- Push 到 `master` 分支 → 生产环境部署
- Push 到其他分支 → 预览环境部署
- Pull Request → 自动创建预览

### 部署分支策略

```
master (main)     → Production  (your-project.vercel.app)
develop           → Preview     (your-project-git-develop.vercel.app)
feature/xxx       → Preview     (your-project-git-feature-xxx.vercel.app)
```

---

## 监控和日志

### 1. 查看部署日志

1. 进入 Vercel 项目仪表板
2. 点击 **"Deployments"**
3. 选择一个部署
4. 查看 **"Build Logs"** 和 **"Function Logs"**

### 2. 实时日志

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 查看实时日志
vercel logs your-project-name --follow
```

### 3. 性能监控

Vercel 自动提供：
- **Analytics**：访问量、页面性能
- **Speed Insights**：Core Web Vitals
- **Real-time Logs**：API 请求日志

---

## 故障排查

### 问题 1：构建失败 "Module not found"

**原因**：依赖未正确安装

**解决**：
```bash
# 本地测试构建
npm run build

# 如果成功，检查 package.json 是否已提交
git add package.json package-lock.json
git commit -m "fix: update dependencies"
git push
```

### 问题 2：环境变量未生效

**检查**：
1. Vercel 仪表板 → Settings → Environment Variables
2. 确认变量名称正确（区分大小写）
3. 确认已选择正确的环境（Production/Preview/Development）
4. 重新部署：Deployments → 点击 "Redeploy"

### 问题 3：API 请求失败

**检查**：
1. YouTube API Key 是否有效
2. API 配额是否耗尽
3. Supabase 凭证是否正确
4. 查看 Function Logs 获取详细错误

### 问题 4：图片不显示

**检查**：
1. `next.config.ts` 中 `unoptimized: true` 是否配置
2. `remotePatterns` 是否包含 YouTube 域名
3. 浏览器控制台是否有 CORS 错误

### 问题 5：数据不持久化

**原因**：Vercel 无服务器环境不支持文件系统持久化

**解决**：
1. 配置 Supabase（推荐）
2. 或使用 Vercel KV
3. 或接受纯展示模式

---

## 性能优化

### 1. 启用缓存

已在 `vercel.json` 中配置：

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate=300"
        }
      ]
    }
  ]
}
```

### 2. 区域配置

```json
{
  "regions": ["sin1"]  // Singapore - 中国用户推荐
}
```

其他选项：
- `hnd1` - Tokyo（东京）
- `icn1` - Seoul（首尔）
- `hkg1` - Hong Kong（香港）

### 3. 函数超时

Vercel 免费计划：
- 函数超时：10 秒
- 如需更长时间，升级到 Pro 计划

---

## 成本估算

### Vercel 免费计划

✅ **包含**：
- 无限部署
- 100 GB 带宽/月
- 无限网站
- 自动 HTTPS
- 全球 CDN

⚠️ **限制**：
- 函数执行时间：10 秒
- 函数大小：50 MB
- 并发执行：10 个

### 升级到 Pro（可选）

💰 **$20/月**：
- 1 TB 带宽
- 60 秒函数超时
- 优先支持
- 高级分析

**建议**：个人项目使用免费计划足够。

---

## 安全检查清单

部署前确认：

- [ ] ✅ `.env.local` 已添加到 `.gitignore`
- [ ] ✅ 旧的 YouTube API Key 已撤销
- [ ] ✅ 新的 API Key 已在 Vercel 配置
- [ ] ✅ Supabase RLS 策略已配置
- [ ] ✅ 敏感信息未硬编码在代码中
- [ ] ✅ 生产环境使用 HTTPS
- [ ] ✅ API 端点有适当的错误处理

---

## 部署检查清单

- [ ] ✅ 代码已推送到 GitHub
- [ ] ✅ Vercel 项目已创建
- [ ] ✅ 环境变量已配置
- [ ] ✅ 首次部署成功
- [ ] ✅ 网站可访问
- [ ] ✅ Catalog 页面正常
- [ ] ✅ Admin 页面可添加视频
- [ ] ✅ 图片正常加载
- [ ] ✅ API 请求正常
- [ ] ✅ Supabase 连接正常（如果使用）

---

## 快速命令参考

```bash
# 本地测试生产构建
npm run build
npm start

# 安装 Vercel CLI
npm install -g vercel

# 本地预览 Vercel 环境
vercel dev

# 手动部署到 Vercel
vercel

# 部署到生产环境
vercel --prod

# 查看实时日志
vercel logs --follow

# 查看环境变量
vercel env ls

# 添加环境变量
vercel env add YOUTUBE_API_KEY
```

---

## 下一步

部署成功后，你可以：

1. **配置自定义域名**
   - 让网站更专业
   - 提升 SEO

2. **启用 Supabase**
   - 实现数据持久化
   - 支持多设备访问

3. **添加分析**
   - Vercel Analytics
   - Google Analytics

4. **优化性能**
   - 启用缓存
   - 优化图片加载

5. **添加更多功能**
   - 用户认证
   - 评论系统
   - 搜索优化

---

## 相关文档

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Supabase 设置指南](./SUPABASE_SETUP.md)
- [YouTube API 指南](./YOUTUBE_API_GUIDE.md)

---

## 获取帮助

### 遇到问题？

1. **查看日志**：Vercel Deployments → Function Logs
2. **检查文档**：本指南 + Vercel 官方文档
3. **社区支持**：
   - Vercel Discord
   - GitHub Issues
   - Stack Overflow

---

**部署指南完成！** 🚀

按照本指南操作，你的应用将在几分钟内上线。

**预计部署时间**：10-15 分钟（首次）

祝部署顺利！
