# Language Reactor 播放器页面功能对比

## 真实网站功能（已观察到）

### 1. 视频播放器
- ✅ YouTube 嵌入播放器
- ❌ 自定义视频控制条（播放、进度条、音量、全屏）
- ❌ 与字幕同步的控制系统

### 2. 字幕显示
- ✅ 双语字幕（原文 + 翻译）
- ❌ **逐词显示格式** - 每个单词独立显示，可点击
- ❌ 单词间有明确的空格分隔
- ✅ 字幕自动滚动

### 3. 标签界面
- ❌ **"文本" 标签** - 显示完整字幕文本
- ❌ **"词语" 标签** - 显示词汇列表
- 当前我们没有这个标签切换功能

### 4. 导航功能
- ❌ **上一个视频按钮** (previous document)
- ❌ **下一个视频按钮** (next document)
- ❌ 视频列表导航

### 5. 工具按钮
- ❌ **更多信息按钮**
- ❌ **导出按钮** - 导出字幕或词汇
- ✅ 全屏按钮（YouTube 自带）

### 6. 词汇交互
- ❌ **点击单词查看详情** - 当前我们的实现是预定义的高亮词
- ❌ **保存单词到词汇表** - 点击即可保存
- ❌ **单词难度标记** - 不同颜色表示难度

### 7. 侧边栏/面板
- ✅ 字幕列表（我们有）
- ❌ 词汇详情面板（点击单词时显示）
- ❌ 学习统计

### 8. 键盘快捷键
- ❌ 空格键播放/暂停
- ❌ 左右箭头前进/后退
- ❌ 上下箭头调整音量
- ❌ 数字键跳转到特定位置

## 我们当前的实现

### 已有功能 ✅
1. YouTube 视频嵌入
2. 双语字幕显示
3. 字幕列表
4. 播放控制（基础）
5. 字幕后自动暂停
6. 播放速度调整
7. 显示/隐藏翻译

### 缺失的关键功能 ❌

#### 高优先级
1. **逐词可点击文本** - 这是核心功能
   - 每个单词独立渲染
   - 点击单词显示详情
   - 保存单词功能
   
2. **标签界面（文本/词语）**
   - 文本视图：完整字幕
   - 词语视图：词汇列表

3. **自定义视频控制**
   - 与字幕同步的进度条
   - 点击字幕跳转到对应时间

#### 中优先级
4. **导航功能**
   - 上一个/下一个视频
   - 视频列表

5. **导出功能**
   - 导出字幕
   - 导出词汇列表

6. **更多信息面板**
   - 视频详情
   - 频道信息

#### 低优先级
7. **键盘快捷键**
8. **学习统计**
9. **进度跟踪**

## 实现建议

### 第一步：逐词文本渲染
```typescript
// 将字幕文本拆分为单词数组
const words = subtitle.originalText.split(/(\s+)/);

// 渲染每个单词为可点击元素
{words.map((word, idx) => (
  word.trim() ? (
    <span
      key={idx}
      onClick={() => handleWordClick(word)}
      className="cursor-pointer hover:bg-secondary/30 px-1 rounded"
    >
      {word}
    </span>
  ) : (
    <span key={idx}>{word}</span>
  )
))}
```

### 第二步：添加标签界面
```typescript
const [activeTab, setActiveTab] = useState<"text" | "words">("text");

// 文本标签：显示完整字幕
// 词语标签：显示词汇列表和统计
```

### 第三步：自定义视频控制
- 使用 YouTube IFrame API
- 监听播放状态
- 同步字幕高亮

### 第四步：导航和导出
- 添加视频列表数据结构
- 实现上一个/下一个逻辑
- 添加导出为 CSV/JSON 功能

## 技术实现要点

### YouTube IFrame API 集成
```typescript
// 加载 YouTube API
const onYouTubeIframeAPIReady = () => {
  player = new YT.Player('player', {
    events: {
      'onStateChange': onPlayerStateChange,
      'onReady': onPlayerReady
    }
  });
};

// 同步字幕
const syncSubtitles = () => {
  const currentTime = player.getCurrentTime();
  const currentSub = subtitles.find(
    sub => currentTime >= sub.startTime && currentTime < sub.endTime
  );
  setCurrentSubtitle(currentSub);
};
```

### 词汇数据结构
```typescript
interface Word {
  text: string;
  translation: string;
  definition: string;
  examples: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  partOfSpeech: string;
  frequency: number;
  saved: boolean;
}
```

## 估计工作量

- 逐词文本渲染：2-3 小时
- 标签界面：1-2 小时
- YouTube API 集成：3-4 小时
- 导航功能：1-2 小时
- 导出功能：2-3 小时
- 键盘快捷键：1-2 小时

**总计：10-16 小时**

## 优先级排序

1. **立即实现**：逐词文本 + 标签界面（核心体验）
2. **短期实现**：YouTube API 集成（功能完整性）
3. **中期实现**：导航 + 导出（实用功能）
4. **长期优化**：快捷键 + 统计（用户体验）
