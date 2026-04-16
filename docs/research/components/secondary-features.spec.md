# Secondary Features Section Specification

## Overview
- **Target file:** `src/components/SecondaryFeatures.tsx`
- **Screenshot:** Lower-middle section of `docs/design-references/languagereactor-desktop-1440.png`
- **Interaction model:** Static display (no click interactions, pure informational)

## Section Structure

### Section Header
- Main heading: "语言学习神器"
- Subheading: "让任何内容都易于理解"

### Features Layout
4 feature items displayed in a grid or column layout with large images and text descriptions.

## Feature Data (from page snapshot)

### Feature 1: 👥 双语字幕
- **Icon/Emoji:** "👥"
- **Title:** "双语字幕"
- **Description:** "通过双语对照提升听力理解能力，了解两种语言之间的意义联系 👂"
- **Image:** `public/images/features/bilingual-subtitles.webp`

### Feature 2: ⏯️ 精确播放控制
- **Icon/Emoji:** "⏯️"
- **Title:** "精确播放控制"
- **Description:** "⚡ 暂停时间。控制播放速度。🎮 使用键盘快捷键和手势操作视频。字幕后自动暂停并循环播放直到点击继续。🖱️"
- **Image:** `public/images/features/precise-playback-controls.webp`

### Feature 3: 词典与 Lexa AI
- **Icon/Emoji:** "🔍" (implied from description)
- **Title:** "词典与 Lexa AI"
- **Description:** "🔍 点击任意单词获取即时翻译。真实语境例句配有原声音频。🎧 AI智能解析词语用法。🌱 自定义显示更多信息！"
- **Image:** `public/images/features/dict_and_examples.webp`

### Feature 4: 🌍 多语言支持
- **Icon/Emoji:** "🌍"
- **Title:** "多语言支持"
- **Description:** "学习40多种语言的内容 🔤 查看使用不同书写系统的语言的注音 👀 字幕默认隐藏直到鼠标悬停——完美训练您的听力技能"
- **Image:** `public/images/features/world-map.webp`

## DOM Structure
```
section.secondary-features
  └─ div.container (max-width, centered)
      ├─ div.section-header
      │   ├─ h2.main-heading "语言学习神器"
      │   └─ p.sub-heading "让任何内容都易于理解"
      └─ div.features-container
          ├─ div.feature-item (x4)
          │   ├─ div.image-container
          │   │   └─ Image (Next.js Image)
          │   └─ div.text-content
          │       ├─ div.title-with-icon
          │       │   ├─ span.emoji-icon
          │       │   └─ h3.feature-title
          │       └─ p.feature-description
```

## Estimated CSS Values

### Section Container
- width: 100%
- maxWidth: 1200px
- margin: 0 auto
- padding: 80px 24px (desktop) / 60px 16px (mobile)
- backgroundColor: var(--background)

### Section Header

**Main Heading:**
- fontSize: 36px (desktop) / 28px (mobile)
- fontWeight: 700
- color: white
- textAlign: center
- marginBottom: 12px

**Sub Heading:**
- fontSize: 20px (desktop) / 18px (mobile)
- fontWeight: 400
- color: rgba(255, 255, 255, 0.7)
- textAlign: center
- marginBottom: 64px

### Features Container
- display: grid or flex column
- gap: 48px (desktop) / 32px (mobile)

### Feature Item
- display: flex or grid
- flexDirection: row (desktop) / column (mobile)
- alignItems: center
- gap: 32px
- Alternating layout: image left/right on desktop

### Image Container
- flex: 1
- maxWidth: 500px
- position: relative
- borderRadius: 12px
- overflow: hidden

### Image
- width: 100%
- height: auto
- objectFit: contain or cover

### Text Content
- flex: 1
- maxWidth: 500px

### Title with Icon
- display: flex
- alignItems: center
- gap: 12px
- marginBottom: 16px

**Emoji Icon:**
- fontSize: 32px
- lineHeight: 1

**Feature Title:**
- fontSize: 24px (desktop) / 20px (mobile)
- fontWeight: 600
- color: white
- lineHeight: 1.3

### Feature Description
- fontSize: 16px
- fontWeight: 400
- color: rgba(255, 255, 255, 0.7)
- lineHeight: 1.6

## Layout Pattern

**Desktop (> 768px):**
- Alternating image-text layout:
  - Feature 1: Image left, text right
  - Feature 2: Text left, image right
  - Feature 3: Image left, text right
  - Feature 4: Text left, image right

**Mobile (< 768px):**
- Stacked layout: Image above, text below
- All features follow same pattern

## Responsive Behavior

### Desktop (> 1024px)
- Two-column layout (image + text side by side)
- Images: max-w-[500px]
- Text: max-w-[500px]
- Gap: 32px between image and text
- Section padding: py-20

### Tablet (768px - 1024px)
- Two-column layout maintained
- Slightly smaller images: max-w-[400px]
- Gap: 24px
- Section padding: py-16

### Mobile (< 768px)
- Single column (image above text)
- Images: full width, max-w-[400px] centered
- Text: full width
- Gap: 24px
- Section padding: py-12

## Implementation Notes

1. **Use TypeScript** with proper typing
2. **Use Next.js Image component** for all images
3. **Use Tailwind CSS v4** for styling
4. **Alternating layout** - use conditional rendering or CSS nth-child for alternating image position
5. **Emoji rendering** - ensure emojis display correctly in titles
6. **Semantic HTML** - use section, h2, h3, p tags
7. **Responsive images** - images should scale properly on all devices
8. **No click interactions** - this is a pure informational section
9. **Export as default** - `export default function SecondaryFeatures()`

## Tailwind Classes Guide

**Section:**
- `w-full bg-background`

**Container:**
- `max-w-7xl mx-auto px-6 py-20 md:py-16 lg:py-20`

**Section Header:**
- Main: `text-3xl md:text-4xl font-bold text-white text-center mb-3`
- Sub: `text-lg md:text-xl text-white/70 text-center mb-16`

**Features Container:**
- `flex flex-col gap-12 md:gap-16`

**Feature Item:**
- `flex flex-col md:flex-row items-center gap-8 md:gap-8`
- Alternating: `md:flex-row-reverse` for odd items

**Image Container:**
- `flex-1 w-full max-w-[500px] md:max-w-[400px] lg:max-w-[500px]`

**Text Content:**
- `flex-1 max-w-[500px]`

**Title with Icon:**
- `flex items-center gap-3 mb-4`
- Emoji: `text-3xl`
- Title: `text-xl md:text-2xl font-semibold text-white`

**Description:**
- `text-base text-white/70 leading-relaxed`

## Before Implementation
1. Verify all image files exist in `public/images/features/`
2. Plan alternating layout logic (CSS or conditional rendering)
3. Test responsive behavior at all breakpoints
4. Verify TypeScript compilation with `npx tsc --noEmit`
