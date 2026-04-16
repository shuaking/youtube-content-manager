# Language Reactor Clone - 架构设计文档

## 目录
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [核心设计决策](#核心设计决策)
- [路由架构](#路由架构)
- [数据流与状态管理](#数据流与状态管理)
- [组件层次](#组件层次)
- [关键功能实现](#关键功能实现)
- [性能优化](#性能优化)

---

## 技术栈

### 核心框架
- **Next.js 16** (App Router)
  - 选择理由：服务端渲染、文件系统路由、优化的性能
  - 使用 App Router 而非 Pages Router，利用 React Server Components
  
- **React 19**
  - 最新特性：use() hook 用于 Promise 解包
  - 严格模式启用，确保代码质量

- **TypeScript** (strict mode)
  - 类型安全，减少运行时错误
  - 严格模式配置，强制类型检查

### UI 框架
- **Tailwind CSS v4**
  - 实用优先的 CSS 框架
  - 使用 oklch 色彩空间实现更好的颜色一致性
  - 自定义设计令牌系统

- **shadcn/ui**
  - 基于 Radix UI 的可访问组件
  - 完全可定制，代码直接集成到项目中
  - 不是 npm 包，而是可复制的组件代码

### 图标与资源
- **Lucide React**
  - 轻量级图标库
  - 树摇优化，只打包使用的图标

### 外部 API
- **YouTube IFrame API**
  - 视频播放控制
  - 播放状态监听
  - 时间同步

---

## 项目结构

```
my-clone/
├── src/
│   ├── app/                          # Next.js App Router 页面
│   │   ├── layout.tsx                # 根布局（Header）
│   │   ├── page.tsx                  # 首页（营销页面）
│   │   ├── catalog/                  # 内容目录
│   │   │   ├── page.tsx              # 目录首页
│   │   │   └── [lang]/[platform]/   # 动态路由
│   │   │       ├── channel/[channelId]/
│   │   │       └── video/[videoId]/
│   │   ├── player/[videoId]/         # 视频播放器
│   │   ├── chatbot/                  # AI 对话
│   │   ├── saved-items/              # 已保存词汇
│   │   ├── text/                     # 文本分析
│   │   ├── phrasepump/               # 句子练习
│   │   ├── review/                   # 词汇复习（SRS）
│   │   ├── dashboard/                # 仪表盘
│   │   ├── history/                  # 学习历史
│   │   ├── search/                   # 搜索
│   │   ├── settings/                 # 设置
│   │   ├── pro-mode/                 # Pro 模式
│   │   └── help/basic/               # 帮助
│   │
│   ├── components/                   # React 组件
│   │   ├── ui/                       # shadcn/ui 基础组件
│   │   ├── icons.tsx                 # 自定义 SVG 图标
│   │   ├── Header.tsx                # 全局导航栏
│   │   ├── Footer.tsx                # 页脚
│   │   ├── HeroSection.tsx           # 首页英雄区
│   │   ├── FeaturesGrid.tsx          # 功能网格
│   │   └── ...                       # 其他营销页面组件
│   │
│   ├── lib/                          # 工具函数
│   │   ├── utils.ts                  # cn() 工具（shadcn）
│   │   └── export.ts                 # 导出功能（CSV/JSON）
│   │
│   └── types/                        # TypeScript 类型定义
│       ├── catalog.ts                # 目录数据类型
│       └── subtitles.ts              # 字幕数据类型
│
├── public/                           # 静态资源
│   ├── images/                       # 图片资源
│   │   ├── hero/                     # 首页图片
│   │   ├── features/                 # 功能截图
│   │   └── icons/                    # 图标
│   └── seo/                          # SEO 资源（favicon 等）
│
├── docs/                             # 项目文档
│   └── research/                     # 研究与分析文档
│       ├── BEHAVIORS.md              # 行为分析
│       ├── PAGE_TOPOLOGY.md          # 页面拓扑
│       ├── PLAYER_PAGE_COMPARISON.md # 播放器对比
│       ├── PHASE3_IMPLEMENTATION_STATUS.md
│       └── PAGE_LOGIC_ISSUES.md      # 逻辑问题报告
│
├── scripts/                          # 构建脚本
│   └── download-assets.mjs           # 资源下载脚本
│
├── next.config.ts                    # Next.js 配置
├── tailwind.config.ts                # Tailwind 配置
├── tsconfig.json                     # TypeScript 配置
└── package.json                      # 依赖管理
```

---

## 核心设计决策

### 1. App Router vs Pages Router
**决策**: 使用 Next.js 16 App Router

**理由**:
- React Server Components 支持
- 更好的数据获取模式
- 布局系统更灵活
- 文件系统路由更直观

**权衡**:
- 学习曲线较陡
- 某些第三方库可能不兼容
- 需要使用 `use()` hook 处理 Promise params

### 2. 客户端渲染 vs 服务端渲染
**决策**: 大部分页面使用客户端渲染（"use client"）

**理由**:
- 需要大量交互（播放器、聊天、表单）
- 状态管理复杂（播放时间、字幕同步）
- YouTube API 只能在客户端运行

**例外**:
- 首页营销内容可以 SSR（但当前为简化使用 CSR）

### 3. 状态管理策略
**决策**: 使用 React 内置状态管理（useState, useRef）

**理由**:
- 应用规模适中，不需要 Redux/Zustand
- 状态大多局部于单个页面
- 避免引入额外依赖

**未来考虑**:
- 如果需要跨页面共享状态，可引入 Context API
- 如果需要持久化，可使用 localStorage + Context

### 4. 数据获取策略
**决策**: 使用模拟数据（Mock Data）

**当前实现**:
- 所有数据定义在 `src/types/catalog.ts`
- 直接导入使用，无需 API 调用

**生产环境迁移路径**:
```typescript
// 当前
import { mockVideos } from "@/types/catalog";

// 未来
const videos = await fetch('/api/videos').then(r => r.json());
```

### 5. 样式方案
**决策**: Tailwind CSS + shadcn/ui

**理由**:
- Tailwind: 快速开发，一致性好
- shadcn/ui: 可访问性好，可定制性强
- 避免 CSS-in-JS 的运行时开销

**样式组织**:
- 全局样式: `src/app/globals.css`
- 组件样式: Tailwind 类名
- 设计令牌: CSS 变量（`:root`）

---

## 路由架构

### 路由层次结构

```
/                                    # 首页（营销页面）
├── /catalog                         # 内容目录首页
│   ├── /catalog/en/youtube/channel/UCWOA1ZGywLbqmigxE4Qlvuw
│   │                                # 频道详情页
│   └── /catalog/en/youtube/video/HQjMa28UsrI
│                                    # 视频详情页
├── /player/HQjMa28UsrI              # 视频播放器
├── /chatbot                         # AI 对话
├── /saved-items                     # 已保存词汇
├── /text                            # 文本分析
├── /phrasepump                      # 句子练习
├── /review                          # 词汇复习
├── /dashboard                       # 仪表盘
├── /history                         # 学习历史
├── /search                          # 搜索
├── /settings                        # 设置
├── /pro-mode                        # Pro 模式
└── /help/basic                      # 帮助
```

### 动态路由参数

#### Catalog 路由
```typescript
/catalog/[lang]/[platform]/channel/[channelId]
/catalog/[lang]/[platform]/video/[videoId]

// 参数解析（Next.js 16）
const { lang, platform, channelId } = use(params);
```

**参数说明**:
- `lang`: 语言代码（en, zh, ja, es, fr, de, ko, it）
- `platform`: 平台（youtube, netflix）
- `channelId`: 频道 ID
- `videoId`: 视频 ID

#### Player 路由
```typescript
/player/[videoId]

// 参数解析
const { videoId } = use(params);
```

### 路由导航流程

```
首页
  ↓ 点击"浏览内容"
内容目录 (/catalog)
  ↓ 选择频道
频道详情 (/catalog/en/youtube/channel/xxx)
  ↓ 选择视频
视频详情 (/catalog/en/youtube/video/xxx)
  ↓ 点击"使用 Language Reactor 播放"
播放器 (/player/xxx)
```

**快捷路径**:
- 内容目录 → 视频卡片悬停播放按钮 → 直接跳转播放器
- 播放器 → 视频信息面板 → 相关视频 → 其他播放器

---

## 数据流与状态管理

### 数据类型定义

#### Catalog 数据
```typescript
// src/types/catalog.ts

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  channelId: string;        // 关联频道
  channelName: string;
  views: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  topics: string[];
}

interface Channel {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
  videoCount: number;
  language: string;         // 关联语言
  platform: "youtube" | "netflix";
  topics: string[];
}
```

#### Subtitle 数据
```typescript
// src/types/subtitles.ts

interface SubtitleWord {
  text: string;
  startIndex: number;
  endIndex: number;
  translation?: string;
  definition?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  saved?: boolean;
}

interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  originalText: string;
  translatedText: string;
  words: SubtitleWord[];
}
```

### 状态管理模式

#### 播放器页面状态
```typescript
// 播放状态
const [currentTime, setCurrentTime] = useState(0);
const [isPlaying, setIsPlaying] = useState(false);
const [playbackSpeed, setPlaybackSpeed] = useState(1);

// UI 状态
const [activeTab, setActiveTab] = useState<"text" | "words">("text");
const [showTranslation, setShowTranslation] = useState(true);
const [selectedWord, setSelectedWord] = useState<SubtitleWord | null>(null);

// 学习统计
const [studyStartTime] = useState(Date.now());
const [studyTime, setStudyTime] = useState(0);
const [viewedSubtitles, setViewedSubtitles] = useState<Set<number>>(new Set());
const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

// YouTube API
const [playerReady, setPlayerReady] = useState(false);
const [videoDuration, setVideoDuration] = useState(0);
const playerRef = useRef<YTPlayer | null>(null);
```

#### 状态同步机制

**YouTube Player ↔ React State**:
```typescript
// 1. YouTube API 初始化
useEffect(() => {
  window.onYouTubeIframeAPIReady = () => {
    playerRef.current = new YT.Player("youtube-player", {
      events: {
        onReady: (event) => {
          setPlayerReady(true);
          setVideoDuration(event.target.getDuration());
        },
        onStateChange: (event) => {
          setIsPlaying(event.data === YT.PlayerState.PLAYING);
        },
      },
    });
  };
}, [videoId]);

// 2. 时间同步（每 100ms）
useEffect(() => {
  if (!playerReady) return;
  
  const syncInterval = setInterval(() => {
    const time = playerRef.current.getCurrentTime();
    setCurrentTime(time);
  }, 100);
  
  return () => clearInterval(syncInterval);
}, [playerReady]);

// 3. 字幕自动高亮
const currentSubtitle = mockSubtitles.find(
  (sub) => currentTime >= sub.startTime && currentTime < sub.endTime
);
```

---

## 组件层次

### 页面组件层次（播放器示例）

```
PlayerPage
├── Breadcrumb
├── VideoTitle
├── Toolbar
│   ├── NavigationButtons (Previous/Next)
│   ├── VideoCounter
│   ├── MoreInfoButton
│   ├── ExportDropdown
│   └── FullscreenButton
├── MainContent (lg:col-span-2)
│   ├── VideoPlayer (YouTube IFrame)
│   ├── CustomProgressBar
│   │   ├── SubtitleSegments
│   │   ├── CurrentTimeIndicator
│   │   └── HoverTimePreview
│   ├── TabNavigation (Text/Words)
│   ├── TabContent
│   │   ├── TextView (if activeTab === "text")
│   │   │   └── ClickableWordText
│   │   └── WordsView (if activeTab === "words")
│   │       ├── VocabularyStatistics
│   │       └── WordList
│   ├── CurrentSubtitleDisplay
│   ├── PlaybackControls
│   │   ├── SkipButtons
│   │   ├── PlayPauseButton
│   │   └── SpeedSelector
│   └── SubtitleList
└── Sidebar (lg:col-span-1)
    ├── LearningStatistics
    │   ├── StudyTime
    │   ├── ProgressGrid
    │   └── DifficultyBreakdown
    ├── WordDetails (if selectedWord)
    └── UsageTips (if !selectedWord)
```

### 可复用组件

#### UI 组件（shadcn/ui）
- `Button` - 按钮
- `Input` - 输入框
- `Select` - 下拉选择
- `Dialog` - 对话框
- `Card` - 卡片容器

#### 自定义组件
- `Header` - 全局导航栏
- `Footer` - 页脚
- `SearchIcon`, `PlayIcon`, `ChevronRightIcon` - 图标组件

---

## 关键功能实现

### 1. YouTube IFrame API 集成

**初始化流程**:
```typescript
// 1. 动态加载 API 脚本
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName("script")[0].parentNode.insertBefore(tag, firstScriptTag);

// 2. 全局回调
window.onYouTubeIframeAPIReady = () => {
  initializePlayer();
};

// 3. 创建播放器实例
playerRef.current = new YT.Player("youtube-player", {
  videoId: videoId,
  events: {
    onReady: handleReady,
    onStateChange: handleStateChange,
  },
});
```

**关键方法**:
- `playVideo()` / `pauseVideo()` - 播放控制
- `seekTo(seconds, allowSeekAhead)` - 跳转
- `getCurrentTime()` - 获取当前时间
- `getDuration()` - 获取总时长
- `setPlaybackRate(rate)` - 设置速度

### 2. 字幕同步系统

**双向同步**:
```typescript
// 视频 → 字幕（自动高亮）
const currentSubtitle = mockSubtitles.find(
  (sub) => currentTime >= sub.startTime && currentTime < sub.endTime
);

// 字幕 → 视频（点击跳转）
const handleSkipToSubtitle = (subtitle) => {
  playerRef.current.seekTo(subtitle.startTime, true);
  playerRef.current.playVideo();
};
```

**自动滚动**:
```typescript
useEffect(() => {
  if (currentSubtitle && subtitleListRef.current) {
    const activeElement = subtitleListRef.current.querySelector(
      `[data-subtitle-id="${currentSubtitle.id}"]`
    );
    activeElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}, [currentSubtitle]);
```

### 3. 自定义进度条

**可视化字幕片段**:
```typescript
{mockSubtitles.map((subtitle) => {
  const startPercent = (subtitle.startTime / videoDuration) * 100;
  const widthPercent = ((subtitle.endTime - subtitle.startTime) / videoDuration) * 100;
  
  return (
    <div
      style={{
        left: `${startPercent}%`,
        width: `${widthPercent}%`,
      }}
      className={currentSubtitle?.id === subtitle.id ? "active" : ""}
    />
  );
})}
```

**点击跳转**:
```typescript
const handleProgressBarClick = (e) => {
  const rect = progressBarRef.current.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const percentage = clickX / rect.width;
  const seekTime = percentage * videoDuration;
  
  playerRef.current.seekTo(seekTime, true);
};
```

### 4. 键盘快捷键系统

**事件监听**:
```typescript
useEffect(() => {
  const handleKeyDown = (e) => {
    // 忽略输入框
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }
    
    switch (e.key) {
      case " ": case "k": case "K":
        handlePlayPause();
        break;
      case "ArrowLeft":
        handleSkipBackward();
        break;
      // ... 更多快捷键
    }
  };
  
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [dependencies]);
```

**快捷键列表**:
- `空格` / `K` - 播放/暂停
- `←` / `→` - 前进/后退 5 秒
- `J` / `L` - 前进/后退 10 秒
- `N` / `P` - 下一条/上一条字幕
- `R` - 重播当前字幕
- `<` / `>` - 减速/加速
- `T` - 切换翻译
- `Tab` - 切换标签
- `1-9` - 跳转到 10%-90%
- `?` - 显示帮助
- `Esc` - 关闭弹窗

### 5. 导出功能

**CSV 导出**:
```typescript
export function exportSubtitlesToCSV(subtitles: Subtitle[]): string {
  const headers = ["ID", "Start Time", "End Time", "Original Text", "Translation"];
  const rows = subtitles.map((sub) => [
    sub.id.toString(),
    sub.startTime.toFixed(2),
    sub.endTime.toFixed(2),
    `"${sub.originalText.replace(/"/g, '""')}"`,  // CSV 转义
    `"${sub.translatedText.replace(/"/g, '""')}"`,
  ]);
  
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
```

**文件下载**:
```typescript
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### 6. 学习统计追踪

**时长追踪**:
```typescript
const [studyStartTime] = useState(Date.now());
const [studyTime, setStudyTime] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setStudyTime(Math.floor((Date.now() - studyStartTime) / 1000));
  }, 1000);
  
  return () => clearInterval(interval);
}, [studyStartTime]);
```

**字幕追踪**:
```typescript
const [viewedSubtitles, setViewedSubtitles] = useState<Set<number>>(new Set());

useEffect(() => {
  if (currentSubtitle) {
    setViewedSubtitles((prev) => new Set(prev).add(currentSubtitle.id));
  }
}, [currentSubtitle]);
```

---

## 性能优化

### 已实现的优化

1. **图片优化**
   - 使用 Next.js Image 组件
   - 自动 WebP 转换
   - 响应式图片（sizes 属性）
   - 懒加载（默认行为）

2. **代码分割**
   - 每个页面自动代码分割
   - 动态导入（如需要）

3. **YouTube API 优化**
   - 只在需要时加载脚本
   - 单例模式（检查是否已加载）
   - 组件卸载时清理

4. **状态更新优化**
   - 使用 useRef 避免不必要的重渲染
   - 合理使用 useEffect 依赖数组
   - Set 数据结构用于快速查找

### 未来优化方向

1. **数据持久化**
   - localStorage 存储已保存词汇
   - IndexedDB 存储学习历史

2. **虚拟滚动**
   - 字幕列表（如果数量很大）
   - 词汇列表

3. **Service Worker**
   - 离线支持
   - 资源缓存

4. **React Server Components**
   - 首页和目录页可以 SSR
   - 减少客户端 JavaScript

---

## 部署架构

### 构建配置
```typescript
// next.config.ts
const nextConfig = {
  output: "standalone",  // Docker 部署优化
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};
```

### 推荐部署平台
- **Vercel** (推荐) - Next.js 原生支持
- **Docker** - 使用 standalone 输出
- **静态托管** - 需要配置 SSR 支持

---

## 开发工作流

### 本地开发
```bash
npm run dev      # 启动开发服务器 (http://localhost:3000)
npm run build    # 生产构建
npm run start    # 启动生产服务器
npm run lint     # ESLint 检查
```

### 代码规范
- TypeScript strict mode
- ESLint + Prettier
- 组件命名：PascalCase
- 文件命名：kebab-case 或 PascalCase
- 工具函数：camelCase

---

## 总结

这个架构设计实现了一个功能完整的语言学习平台克隆，核心特点：

✅ **模块化设计** - 清晰的文件组织和组件层次  
✅ **类型安全** - TypeScript 严格模式  
✅ **性能优化** - Next.js 优化 + 合理的状态管理  
✅ **可扩展性** - 易于添加新功能和页面  
✅ **可维护性** - 清晰的代码结构和文档  

**技术债务**:
- 数据持久化未实现（使用 Mock 数据）
- 无后端 API（需要时可添加 Next.js API Routes）
- 无用户认证系统
- 响应式布局需要进一步优化

**下一步**:
1. 实现数据持久化（localStorage/IndexedDB）
2. 添加后端 API 和数据库
3. 实现用户认证
4. 移动端优化
5. 添加更多语言支持
