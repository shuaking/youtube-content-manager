# Supabase 云端持久化设置指南

## 概述

本系统支持 **云端优先 + 本地缓存** 的混合存储模式：

- **云端数据库（Supabase）**：主要数据源，支持多设备访问
- **本地 JSON 文件**：缓存和离线备份，快速读取

### 数据流

```
写入：API → Supabase 云端 → 本地 JSON 缓存
读取：优先 Supabase → 失败时回退到本地缓存
```

### 如果不配置 Supabase

系统会自动降级为 **纯本地模式**，仅使用 JSON 文件存储。功能完全正常，但无法跨设备同步。

---

## 第 1 步：创建 Supabase 账号和项目

### 1.1 注册账号

1. 访问 https://supabase.com
2. 点击 **"Start your project"**
3. 使用 GitHub 账号登录（推荐）或邮箱注册

### 1.2 创建新项目

1. 登录后，点击 **"New Project"**
2. 填写项目信息：
   - **Name**: `youtube-content-manager`（或任意名称）
   - **Database Password**: 设置一个强密码（**务必记住**）
   - **Region**: 选择离你最近的区域
     - 中国用户推荐：`Singapore (ap-southeast-1)`
     - 其他选项：`Tokyo`, `Seoul`, `Mumbai`
   - **Pricing Plan**: 选择 **Free**（免费额度足够使用）

3. 点击 **"Create new project"**
4. 等待 1-2 分钟，项目初始化完成

---

## 第 2 步：创建数据库表

### 2.1 打开 SQL Editor

1. 在 Supabase 项目仪表板，点击左侧菜单的 **"SQL Editor"**
2. 点击 **"New query"**

### 2.2 执行 SQL 脚本

1. 打开本地文件 `scripts/supabase-schema.sql`
2. 复制全部内容
3. 粘贴到 Supabase SQL Editor
4. 点击 **"Run"** 按钮（或按 `Ctrl+Enter`）

### 2.3 验证表创建成功

1. 点击左侧菜单的 **"Table Editor"**
2. 应该看到两个表：
   - `videos` - 视频表
   - `channels` - 频道表

---

## 第 3 步：获取 API 凭证

### 3.1 进入 API 设置页面

1. 点击左侧菜单的 **"Settings"**（齿轮图标）
2. 点击 **"API"**

### 3.2 复制凭证

你需要复制两个值：

1. **Project URL**
   - 在 "Project URL" 部分
   - 格式：`https://xxxxxxxxxxxxx.supabase.co`
   - 点击复制按钮

2. **anon public key**
   - 在 "Project API keys" 部分
   - 找到 `anon` `public` 标签的 key
   - 点击复制按钮（这是一个很长的字符串）

---

## 第 4 步：配置环境变量

### 4.1 更新 .env.local

打开项目根目录的 `.env.local` 文件，替换以下两行：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

替换为你刚才复制的实际值：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（很长的字符串）
```

### 4.2 保存文件

确保 `.env.local` 文件已保存。

---

## 第 5 步：迁移现有数据

### 5.1 运行迁移脚本

在项目根目录执行：

```bash
node scripts/migrate-to-supabase.mjs
```

### 5.2 预期输出

```
🚀 Starting migration to Supabase...
📍 Supabase URL: https://xxxxxxxxxxxxx.supabase.co

📊 Local data summary:
   - Videos: 4
   - Channels: 5

📤 Migrating 5 channels...
✅ Successfully migrated 5 channels

📤 Migrating 4 videos...
✅ Successfully migrated 4 videos

🔍 Verifying migration...
✅ Found 4 videos in Supabase
✅ Found 5 channels in Supabase

🎉 Migration completed successfully!
```

### 5.3 如果迁移失败

**错误：Supabase credentials not found**
- 检查 `.env.local` 文件是否正确配置
- 确保没有多余的空格或引号

**错误：Failed to read local data files**
- 确保 `data/videos.json` 和 `data/channels.json` 存在
- 如果是新项目，可以跳过迁移步骤

**错误：Channel/Video migration failed**
- 检查 Supabase SQL 脚本是否正确执行
- 在 Supabase Table Editor 中确认表已创建

---

## 第 6 步：验证集成

### 6.1 重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
npm run dev
```

### 6.2 测试读取功能

访问 http://localhost:3000/catalog

- 应该能看到所有视频和频道
- 数据来自 Supabase 云端

### 6.3 测试写入功能

1. 访问 http://localhost:3000/admin
2. 添加一个新视频（例如：`dQw4w9WgXcQ`）
3. 检查 Supabase Table Editor，应该能看到新视频

### 6.4 测试故障恢复

1. 在 `.env.local` 中临时注释掉 Supabase 配置：
   ```env
   # NEXT_PUBLIC_SUPABASE_URL=https://...
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

2. 重启服务器：`npm run dev`

3. 访问 http://localhost:3000/catalog
   - 应该仍然能看到数据（来自本地缓存）
   - 控制台会显示警告：`Supabase credentials not found. Running in local-only mode.`

4. 恢复 Supabase 配置（取消注释）

---

## 第 7 步：在 Supabase 仪表板查看数据

### 7.1 查看表数据

1. 进入 Supabase 项目
2. 点击 **"Table Editor"**
3. 选择 `videos` 或 `channels` 表
4. 可以直接查看、编辑、删除数据

### 7.2 查看 API 日志

1. 点击 **"Logs"**
2. 选择 **"API"**
3. 可以看到所有 API 请求记录

### 7.3 查看数据库统计

1. 点击 **"Database"**
2. 可以看到：
   - 数据库大小
   - 连接数
   - 查询性能

---

## 常见问题

### Q1: 如何切换回纯本地模式？

在 `.env.local` 中注释掉或删除 Supabase 配置：

```env
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

系统会自动降级为本地模式。

### Q2: 本地数据和云端数据不一致怎么办？

云端数据始终是权威数据源。如果需要重新同步：

```bash
# 重新运行迁移脚本（会覆盖云端数据）
node scripts/migrate-to-supabase.mjs
```

### Q3: Supabase 免费额度够用吗？

免费额度：
- 数据库：500 MB
- 带宽：5 GB/月
- API 请求：无限制

对于个人使用完全足够。

### Q4: 如何备份数据？

**方法 1：导出本地 JSON**
```bash
# 本地缓存文件
data/videos.json
data/channels.json
```

**方法 2：Supabase 仪表板导出**
1. Table Editor → 选择表
2. 点击 "Export" → 选择格式（CSV/JSON）

### Q5: 如何删除所有云端数据？

在 Supabase SQL Editor 执行：

```sql
DELETE FROM videos;
DELETE FROM channels;
```

---

## 架构说明

### 混合存储层（Hybrid Data Store）

位置：`src/lib/hybrid-data-store.ts`

**读取策略**：
```typescript
async function getAllVideos() {
  if (!isSupabaseConfigured()) {
    return localStore.getAllVideos(); // 纯本地模式
  }

  try {
    const data = await supabase.from('videos').select('*');
    await syncToLocalCache(data); // 更新本地缓存
    return data;
  } catch (error) {
    return localStore.getAllVideos(); // 故障回退
  }
}
```

**写入策略**：
```typescript
async function addVideo(video) {
  await Promise.all([
    supabase.from('videos').upsert(video), // 写入云端
    localStore.addVideo(video)              // 写入本地
  ]);
}
```

### 优势

1. **高可用性**：云端故障时自动回退到本地
2. **快速读取**：本地缓存加速
3. **数据安全**：双重备份
4. **渐进增强**：可选配置，不影响核心功能

---

## 下一步

✅ Supabase 集成完成后，你可以：

1. **多设备访问**：在不同电脑上配置相同的 Supabase 凭证
2. **团队协作**：分享 Supabase 项目给团队成员
3. **生产部署**：将应用部署到 Vercel，自动使用云端数据
4. **扩展功能**：
   - 添加用户认证（Supabase Auth）
   - 实时订阅（Supabase Realtime）
   - 文件存储（Supabase Storage）

---

**设置完成！** 🎉

如有问题，请查看：
- Supabase 文档：https://supabase.com/docs
- 项目 GitHub Issues
