# 快速开始指南

## 🎉 系统已就绪！

你的YouTube内容管理系统已经完全配置好并测试通过。

## 📊 当前状态

### 已配置
- ✅ YouTube API Key已配置
- ✅ 开发服务器运行中 (http://localhost:3000)
- ✅ 所有API端点正常工作
- ✅ 数据持久化系统就绪

### 已添加测试数据
- 1个视频: Rick Astley - Never Gonna Give You Up
- 1个频道: Rick Astley (4.5M订阅者)

## 🚀 立即开始使用

### 方法1: 通过管理界面添加内容

1. **打开管理界面**
   ```
   http://localhost:3000/admin
   ```

2. **添加视频**
   - 点击"添加视频"标签
   - 输入YouTube视频ID或URL，例如：
     - `YE7VzlLtp-4` (Chrome DevTools教程)
     - `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - 点击"获取视频信息"
   - 预览后点击"添加到目录"

3. **添加频道**
   - 点击"添加频道"标签
   - 输入YouTube频道ID或URL，例如：
     - `UCsooa4yRKGN_zEE8iknghZA` (TED-Ed)
     - `https://www.youtube.com/channel/UCsooa4yRKGN_zEE8iknghZA`
   - 点击"获取频道信息"
   - 预览后点击"添加到目录"

### 方法2: 通过API添加内容

**添加视频**:
```bash
curl -X POST "http://localhost:3000/api/catalog/videos" \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "YE7VzlLtp-4",
    "language": "en",
    "difficulty": "intermediate",
    "topics": ["devtools", "chrome", "tutorial"]
  }'
```

**添加频道**:
```bash
curl -X POST "http://localhost:3000/api/catalog/channels" \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": "UCsooa4yRKGN_zEE8iknghZA",
    "language": "en",
    "platform": "youtube",
    "topics": ["education", "science"]
  }'
```

## 📺 查看内容

访问内容目录页面：
```
http://localhost:3000/catalog
```

在这里你可以：
- 浏览所有已添加的视频和频道
- 按语言筛选
- 按平台筛选（YouTube/Netflix）
- 搜索视频标题和描述
- 按时长和难度过滤
- 按日期或观看次数排序

## 🎯 推荐的视频ID（用于测试）

### 教育类
- `LnJwH_PZXnM` - How does the brain learn? (TED-Ed)
- `YE7VzlLtp-4` - Chrome DevTools新功能
- `cuoMatKjOwc` - Web性能优化技巧

### 英语学习
- `HQjMa28UsrI` - Learn English with Friends
- `b14IFe4an5k` - What makes you happy? (Easy English)

### 推荐的频道ID

- `UCsooa4yRKGN_zEE8iknghZA` - TED-Ed (教育)
- `UCWOA1ZGywLbqmigxE4Qlvuw` - Easy English (英语学习)
- `UC_x5XG1OV2P6uZZ5FSM9Ttw` - Google Developers (技术)

## 📁 数据文件位置

你的内容数据保存在：
- `data/videos.json` - 所有视频
- `data/channels.json` - 所有频道

这些文件可以：
- 直接编辑（JSON格式）
- 备份和恢复
- 版本控制（建议添加到Git）

## 🔧 常用操作

### 查看所有视频
```bash
curl http://localhost:3000/api/catalog/videos
```

### 查看所有频道
```bash
curl http://localhost:3000/api/catalog/channels
```

### 获取YouTube视频信息（不保存）
```bash
curl http://localhost:3000/api/youtube/video/dQw4w9WgXcQ
```

### 获取YouTube频道信息（不保存）
```bash
curl http://localhost:3000/api/youtube/channel/UCuAXFkgsw1L7xaCfnd5JJOw
```

## ⚠️ 重要提醒

### API配额管理
- YouTube API每日配额：10,000单位
- 每次视频查询：~1单位
- 每次频道查询：~1单位
- 建议：避免重复查询同一内容

### 安全注意事项
- ✅ `.env.local`已添加到`.gitignore`
- ⚠️ 永远不要将API Key提交到Git仓库
- ⚠️ 不要在公开场合分享API Key
- 💡 如果API Key泄露，立即在Google Cloud Console撤销并重新生成

## 📚 更多文档

- `docs/YOUTUBE_API_GUIDE.md` - YouTube API详细使用指南
- `docs/IMPLEMENTATION_SUMMARY.md` - 完整实现总结
- `docs/TEST_REPORT.md` - 系统测试报告

## 🎨 界面导航

系统包含以下页面：
- `/` - 首页
- `/catalog` - 内容目录（浏览视频和频道）
- `/admin` - 内容管理（添加视频和频道）
- `/player/[videoId]` - 视频播放器（带字幕和翻译）

## 💡 下一步建议

1. **添加更多内容**
   - 通过`/admin`页面添加5-10个视频
   - 添加2-3个不同类型的频道

2. **测试完整流程**
   - 在catalog页面浏览内容
   - 测试搜索和过滤功能
   - 点击视频进入播放器页面

3. **自定义配置**
   - 修改难度级别分类
   - 添加自定义主题标签
   - 调整视频元数据

4. **数据备份**
   - 定期备份`data/`目录
   - 考虑使用Git版本控制

## 🐛 遇到问题？

### 服务器未启动
```bash
npm run dev
```

### API返回错误
1. 检查`.env.local`文件是否存在
2. 确认API Key正确
3. 重启开发服务器

### 视频未显示
1. 确认视频已添加到`data/videos.json`
2. 刷新catalog页面
3. 检查浏览器控制台错误

## ✨ 开始使用

现在就打开浏览器访问：
```
http://localhost:3000/admin
```

开始添加你的第一个视频吧！🎬
