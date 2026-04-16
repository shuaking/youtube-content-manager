# Language Reactor Clone

一个功能完整的语言学习平台，克隆自 [Language Reactor](https://www.languagereactor.com/)。通过观看 YouTube 视频、阅读双语字幕、学习词汇来提升语言能力。

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## ✨ 功能特性

### 🎬 视频播放器
- YouTube IFrame API 集成
- 双语字幕显示（原文 + 翻译）
- 逐词可点击文本
- 自定义进度条（可视化字幕片段）
- 字幕与视频双向同步
- 点击字幕跳转到对应时间
- 自动暂停功能

### ⌨️ 键盘快捷键
- `空格` / `K` - 播放/暂停
- `←` / `→` - 前进/后退 5 秒
- `J` / `L` - 前进/后退 10 秒
- `N` / `P` - 下一条/上一条字幕
- `R` - 重播当前字幕
- `<` / `>` - 减速/加速
- `T` - 切换翻译显示
- `Tab` - 切换文本/词语标签
- `1-9` - 跳转到视频 10%-90% 位置
- `?` - 显示快捷键帮助

### 📚 内容目录
- 按语言和平台筛选（YouTube/Netflix）
- 频道和视频浏览
- 搜索功能
- 难度标记（初级/中级/高级）

### 💾 学习管理
- 词汇保存和管理
- 学习统计追踪（时长、已学字幕数、词汇数）
- 词汇难度分布可视化
- 导出功能（CSV/JSON 格式）

### 🤖 AI 对话 (Aria)
- 话题建议卡片
- 对话历史
- 录音功能（UI）

### 📝 文本分析
- 文本词汇分析
- 难度标记和高亮
- 词汇统计

### 🔄 词汇复习
- SRS 间隔重复系统（SM-2 算法）
- 闪卡复习模式
- 3D 翻转动画

### 🎯 PhrasePump
- 句子练习
- 进度追踪
- 难度和速度调整

## 🚀 快速开始

### 前置要求
- Node.js 24+
- npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd my-clone

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看应用。

### 构建生产版本

```bash
npm run build
npm run start
```

### Docker 部署

```bash
# 构建并运行
docker compose up app --build

# 开发模式（端口 3001）
docker compose up dev --build
```

## 📁 项目结构

```
my-clone/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── page.tsx            # 首页
│   │   ├── catalog/            # 内容目录
│   │   ├── player/[videoId]/   # 视频播放器
│   │   ├── chatbot/            # AI 对话
│   │   ├── saved-items/        # 已保存词汇
│   │   ├── text/               # 文本分析
│   │   ├── phrasepump/         # 句子练习
│   │   └── review/             # 词汇复习
│   ├── components/             # React 组件
│   │   ├── ui/                 # shadcn/ui 组件
│   │   └── icons.tsx           # 自定义图标
│   ├── lib/                    # 工具函数
│   │   ├── utils.ts            # cn() 工具
│   │   └── export.ts           # 导出功能
│   └── types/                  # TypeScript 类型
│       ├── catalog.ts          # 目录数据类型
│       └── subtitles.ts        # 字幕数据类型
├── public/                     # 静态资源
├── docs/                       # 项目文档
│   └── research/               # 研究与分析
├── ARCHITECTURE.md             # 架构设计文档
└── README.md                   # 本文件
```

## 🛠️ 技术栈

- **Next.js 16** - React 框架（App Router）
- **React 19** - UI 库
- **TypeScript** - 类型安全
- **Tailwind CSS v4** - 样式框架
- **shadcn/ui** - UI 组件库
- **YouTube IFrame API** - 视频播放
- **Lucide React** - 图标库

## 📖 文档

- [架构设计文档](ARCHITECTURE.md) - 详细的技术架构说明
- [页面逻辑问题报告](docs/research/PAGE_LOGIC_ISSUES.md) - 已知问题和修复
- [播放器功能对比](docs/research/PLAYER_PAGE_COMPARISON.md) - 与原站对比
- [实现状态](docs/research/PHASE3_IMPLEMENTATION_STATUS.md) - 功能完成度

## 🎯 核心功能实现

### YouTube IFrame API 集成
播放器使用 YouTube IFrame API 实现视频控制和时间同步：
- 动态加载 API 脚本
- 播放状态监听
- 每 100ms 同步当前时间
- 支持播放速度调整

### 字幕同步系统
双向同步机制：
- **视频 → 字幕**: 根据当前时间自动高亮字幕
- **字幕 → 视频**: 点击字幕跳转到对应时间
- 字幕列表自动滚动到当前位置

### 自定义进度条
可视化字幕片段：
- 每个字幕在进度条上显示为独立片段
- 当前字幕高亮显示
- 点击进度条任意位置跳转
- 悬停显示时间预览

### 学习统计
实时追踪学习数据：
- 学习时长计时器
- 已观看字幕数量
- 已保存词汇统计
- 词汇难度分布

## 🔧 开发命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 生产构建
npm run start      # 启动生产服务器
npm run lint       # ESLint 检查
npm run typecheck  # TypeScript 类型检查
npm run check      # 运行所有检查 + 构建
```

## 🚧 当前限制

- 使用模拟数据（Mock Data），无后端 API
- 无用户认证系统
- 数据不持久化（刷新页面会丢失）
- 部分页面为占位符（Dashboard、History、Search 等）

## 🔮 未来优化

### 高优先级
- [ ] 数据持久化（localStorage/IndexedDB）
- [ ] 后端 API 集成
- [ ] 用户认证系统
- [ ] 真实音频集成（PhrasePump）
- [ ] AI 集成（Chatbot）

### 中优先级
- [ ] 响应式布局优化（移动端）
- [ ] 更多模拟数据
- [ ] 文件上传功能（文本分析）
- [ ] Anki 导出功能

### 低优先级
- [ ] 动画优化
- [ ] 无障碍功能改进
- [ ] Service Worker（离线支持）
- [ ] 多语言界面

## 📝 代码规范

- TypeScript strict mode
- ESLint + Prettier
- 组件命名：PascalCase
- 文件命名：kebab-case 或 PascalCase
- 工具函数：camelCase
- 使用 Tailwind 类名，避免内联样式

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**注意**: 本项目仅用于学习和研究目的。所有品牌、商标和内容版权归原所有者所有。

