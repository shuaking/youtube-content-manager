# YouTube API 集成使用指南

## 功能概述

本系统集成了 YouTube Data API v3，可以自动获取视频和频道信息，无需手动维护视频数据。

## 配置步骤

### 1. 获取 YouTube API Key

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 YouTube Data API v3：
   - 导航到 "APIs & Services" > "Library"
   - 搜索 "YouTube Data API v3"
   - 点击 "Enable"
4. 创建 API 凭据：
   - 导航到 "APIs & Services" > "Credentials"
   - 点击 "Create Credentials" > "API Key"
   - 复制生成的 API Key

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
YOUTUBE_API_KEY=your_youtube_api_key_here
```

将 `your_youtube_api_key_here` 替换为你的实际 API Key。

### 3. 重启开发服务器

```bash
npm run dev
```

## 使用管理界面

访问 `http://localhost:3000/admin` 进入内容管理页面。

### 添加单个视频

1. 选择 "添加视频" 标签
2. 输入 YouTube 视频 ID 或完整 URL，例如：
   - 视频 ID: `dQw4w9WgXcQ`
   - 完整 URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
3. 点击 "获取视频信息"
4. 预览视频信息
5. 点击 "添加到目录" 保存

### 添加频道及其视频

1. 选择 "添加频道" 标签
2. 输入 YouTube 频道 ID 或完整 URL，例如：
   - 频道 ID: `UCsooa4yRKGN_zEE8iknghZA`
   - 完整 URL: `https://www.youtube.com/channel/UCsooa4yRKGN_zEE8iknghZA`
3. 点击 "获取频道信息"
4. 预览频道信息和最近 10 个视频
5. 点击 "添加到目录" 保存

## API 端点

### 获取视频详情

```
GET /api/youtube/video/[videoId]
```

**响应示例：**
```json
{
  "id": "dQw4w9WgXcQ",
  "title": "Video Title",
  "description": "Video description...",
  "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "duration": "3:32",
  "channelId": "UCuAXFkgsw1L7xaCfnd5JJOw",
  "channelName": "Channel Name",
  "views": "1.2M",
  "publishedAt": "2009-10-25T06:57:33Z",
  "tags": ["tag1", "tag2"]
}
```

### 获取频道详情

```
GET /api/youtube/channel/[channelId]
```

**响应示例：**
```json
{
  "id": "UCsooa4yRKGN_zEE8iknghZA",
  "name": "Channel Name",
  "description": "Channel description...",
  "thumbnail": "https://yt3.ggpht.com/...",
  "subscriberCount": "18M",
  "videoCount": 1800,
  "customUrl": "@channelname"
}
```

### 获取频道视频列表

```
GET /api/youtube/channel/[channelId]/videos?maxResults=10
```

**查询参数：**
- `maxResults`: 返回的视频数量（默认 10，最大 50）

**响应示例：**
```json
{
  "channelId": "UCsooa4yRKGN_zEE8iknghZA",
  "videos": [...],
  "count": 10
}
```

## 程序化使用

你也可以在代码中直接调用 YouTube API 服务：

```typescript
import { getVideoDetails, getChannelDetails, getChannelVideos } from "@/lib/youtube-api";

// 获取视频详情
const video = await getVideoDetails("dQw4w9WgXcQ");

// 获取频道详情
const channel = await getChannelDetails("UCsooa4yRKGN_zEE8iknghZA");

// 获取频道视频列表
const videos = await getChannelVideos("UCsooa4yRKGN_zEE8iknghZA", 20);
```

## API 配额限制

YouTube Data API v3 有每日配额限制：
- 免费配额：10,000 单位/天
- 每个 API 调用消耗不同单位数：
  - 视频详情查询：约 1 单位
  - 频道详情查询：约 1 单位
  - 播放列表查询：约 1 单位

建议：
- 缓存 API 响应以减少重复请求
- 批量处理视频 ID 以优化配额使用
- 监控配额使用情况

## 故障排除

### 错误：YOUTUBE_API_KEY is not configured

确保 `.env.local` 文件存在且包含有效的 API Key，然后重启开发服务器。

### 错误：YouTube API error: 403

可能原因：
1. API Key 无效或已过期
2. YouTube Data API v3 未启用
3. 超出每日配额限制

### 错误：Video not found / Channel not found

确保输入的视频 ID 或频道 ID 正确且视频/频道是公开的。

## 下一步开发

当前系统已实现：
- ✅ YouTube API 集成
- ✅ 视频信息自动获取
- ✅ 频道信息自动获取
- ✅ 管理界面

待实现功能：
- ⏳ 数据持久化（保存到数据库或 JSON 文件）
- ⏳ 批量导入视频
- ⏳ 自动分类和难度评估
- ⏳ 定期同步频道新视频
- ⏳ 视频搜索和过滤
