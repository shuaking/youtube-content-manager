# Feature Cards Section Specification

## Overview
- **Target files:** 
  - `src/components/FeatureCard.tsx` (reusable card component)
  - `src/components/FeaturesGrid.tsx` (grid container with all cards)
- **Screenshot:** Middle section of `docs/design-references/languagereactor-desktop-1440.png`
- **Interaction model:** Click-driven (cards are links to feature pages)

## Section Structure

### Section Header
- Heading: "从喜爱的内容中学习"
- Subheading: "Language Reactor 帮助你找到适合你水平和兴趣的内容"

### Grid Layout
- Desktop (> 1024px): 3 columns
- Tablet (768px - 1024px): 2 columns
- Mobile (< 768px): 1 column
- Gap between cards: 24px
- Netflix card spans 2 columns on desktop (double-width)

## Card Data (from page snapshot)

### Card 1: Netflix (Double-width)
- **Title:** "Netflix"
- **Description:** "浏览器扩展程序让您喜爱的节目变成语言课堂 🍿 Pro模式支持语音识别和机器翻译，帮助您轻松理解内容 🌍"
- **Image:** `public/images/features/netflix.webp`
- **Link:** "https://chrome.google.com/webstore/detail/language-learning-with-ne/hoombieeljmmljlkjmnheibnpciblicm"
- **Span:** 2 columns (col-span-2 on desktop)

### Card 2: YouTube 和播客
- **Title:** "YouTube 和播客"
- **Description:** "数千个涵盖各种主题的 YouTube 频道 🧠 通过地道的语言环境提升你的理解能力。快来浏览我们精心挑选的内容目录 🎧"
- **Image:** `public/images/features/youtube.webp`
- **Link:** "https://www.languagereactor.com/c/en/yt/t_yt_mix_en"

### Card 3: 📑 书籍与网站
- **Title:** "📑 书籍与网站"
- **Description:** "将任何网页导入到 Language Reactor。或上传你喜欢的书籍！配合文字转语音功能一起学习。🎯"
- **Image:** `public/images/features/books-and-websites.webp`
- **Link:** "https://www.languagereactor.com/text"

### Card 4: Learning Focus (需要从截图确认标题)
- **Image:** `public/images/features/what-to-learn.webp`
- **Link:** TBD

### Card 5: Smart Highlighting
- **Image:** `public/images/features/smart-highlighting.webp`
- **Link:** TBD

### Card 6: ⛽ PhrasePump!
- **Title:** "⛽ PhrasePump!"
- **Description:** "PhrasePump 主要是一个听力练习工具。🎧 系统会选择包含需要复习的已保存单词的句子，同时引入新的词汇。无论是初学者还是高级学习者都能从中受益。"
- **Image:** `public/images/features/phrasepump.webp`
- **Link:** "https://www.languagereactor.com/phrasepump"

### Card 7: 🎴 导出到 Anki
- **Title:** "🎴 导出到 Anki"
- **Description:** "已经在使用 Anki？📤 导出精美的记忆卡片到 Anki，包含截图和音频片段。"
- **Image:** `public/images/features/export-to-anki.webp`
- **Link:** "https://www.languagereactor.com/saved-items"

### Card 8: Aria Chatbot
- **Image:** `public/images/features/aria.webp`
- **Link:** TBD

### Card 9: FSI/DLI
- **Image:** `public/images/features/fsi-dli.webp`
- **Link:** TBD

### Card 10: Tablet/Phone
- **Image:** `public/images/features/phone-tablet.png`
- **Link:** TBD

## FeatureCard Component Specification

### DOM Structure
```
a.card-link (entire card is clickable)
  └─ div.card-container
      ├─ div.image-container
      │   └─ Image (Next.js Image component)
      ├─ div.content-container
      │   ├─ h3.card-title
      │   ├─ p.card-description
      │   └─ button.arrow-button
      │       └─ ChevronRightIcon
```

### Estimated CSS Values

**Card Container:**
- display: flex
- flexDirection: column
- backgroundColor: var(--card) (dark card background)
- borderRadius: 16px
- overflow: hidden
- transition: all 0.3s ease
- cursor: pointer
- border: 1px solid rgba(255, 255, 255, 0.1)

**Card Hover State:**
- transform: translateY(-4px)
- boxShadow: 0 8px 24px rgba(0, 0, 0, 0.3)
- borderColor: rgba(255, 255, 255, 0.2)

**Image Container:**
- width: 100%
- height: 200px (or auto)
- position: relative
- overflow: hidden
- backgroundColor: rgba(255, 255, 255, 0.05)

**Image:**
- width: 100%
- height: 100%
- objectFit: cover

**Content Container:**
- padding: 24px
- display: flex
- flexDirection: column
- gap: 12px
- flex: 1

**Card Title:**
- fontSize: 20px
- fontWeight: 600
- color: white
- lineHeight: 1.3
- marginBottom: 8px

**Card Description:**
- fontSize: 15px
- fontWeight: 400
- color: rgba(255, 255, 255, 0.7)
- lineHeight: 1.6
- flex: 1

**Arrow Button:**
- display: inline-flex
- alignItems: center
- justifyContent: center
- width: 32px
- height: 32px
- borderRadius: 50%
- backgroundColor: rgba(255, 255, 255, 0.1)
- color: white
- transition: all 0.2s ease
- alignSelf: flex-end

**Arrow Button Hover:**
- backgroundColor: rgba(255, 255, 255, 0.2)
- transform: translateX(4px)

## FeaturesGrid Component Specification

### DOM Structure
```
section.features-section
  └─ div.container
      ├─ div.section-header
      │   ├─ h2.section-title
      │   └─ p.section-subtitle
      └─ div.cards-grid
          ├─ FeatureCard (Netflix - col-span-2)
          ├─ FeatureCard (YouTube)
          ├─ FeatureCard (Books)
          ├─ FeatureCard (Learning Focus)
          ├─ FeatureCard (Smart Highlighting)
          ├─ FeatureCard (PhrasePump)
          ├─ FeatureCard (Anki)
          ├─ FeatureCard (Aria)
          ├─ FeatureCard (FSI/DLI)
          └─ FeatureCard (Tablet/Phone)
```

### Section Header Styles

**Section Title:**
- fontSize: 36px (desktop) / 28px (mobile)
- fontWeight: 700
- color: white
- textAlign: center
- marginBottom: 12px

**Section Subtitle:**
- fontSize: 18px
- color: rgba(255, 255, 255, 0.7)
- textAlign: center
- marginBottom: 48px
- maxWidth: 700px
- margin: 0 auto 48px

### Grid Styles

**Cards Grid:**
- display: grid
- gridTemplateColumns: repeat(3, 1fr) (desktop)
- gridTemplateColumns: repeat(2, 1fr) (tablet)
- gridTemplateColumns: 1fr (mobile)
- gap: 24px
- width: 100%

**Netflix Card (double-width):**
- gridColumn: span 2 (desktop only)
- gridColumn: span 1 (tablet and mobile)

## Props Interface (TypeScript)

```typescript
interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  imageAlt: string;
  span?: 1 | 2; // For grid column span
}
```

## Responsive Behavior

### Desktop (> 1024px)
- 3-column grid
- Netflix card spans 2 columns
- Card height: auto (content-based)
- Gap: 24px

### Tablet (768px - 1024px)
- 2-column grid
- All cards span 1 column (including Netflix)
- Gap: 20px

### Mobile (< 768px)
- 1-column grid
- All cards full width
- Gap: 16px
- Section padding reduced

## Assets
All images are in `public/images/features/`:
- netflix.webp
- youtube.webp
- books-and-websites.webp
- what-to-learn.webp
- smart-highlighting.webp
- phrasepump.webp
- export-to-anki.webp
- aria.webp
- fsi-dli.webp
- phone-tablet.png

## Implementation Notes

1. **Component Split:** Build FeatureCard first (reusable), then FeaturesGrid (uses FeatureCard)
2. **Entire card is clickable:** Wrap card in `<a>` tag, not just the arrow button
3. **Next.js Image:** Use Image component for optimization
4. **Hover effects:** Smooth transitions on card lift and arrow movement
5. **Grid span:** Netflix card uses `lg:col-span-2` class
6. **Icon:** Import ChevronRightIcon from icons.tsx
7. **Accessibility:** 
   - Cards should have descriptive aria-labels
   - Images should have alt text
   - Links should open in same tab (internal) or new tab (external)
8. **Data structure:** FeaturesGrid should define card data as an array of objects

## TODO: Complete Missing Data
Need to extract from screenshot or live site:
- Titles and descriptions for cards 4, 5, 8, 9, 10
- Exact link URLs for cards 4, 5, 8, 9, 10
- Verify all image paths are correct
