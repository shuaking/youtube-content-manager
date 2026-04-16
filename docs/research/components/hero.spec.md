# Hero Section Specification

## Overview
- **Target file:** `src/components/HeroSection.tsx`
- **Screenshot:** `docs/design-references/languagereactor-desktop-1440.png` (top section)
- **Interaction model:** Static (no scroll-driven or click-driven behaviors)

## DOM Structure
```
section.hero-container
  └─ div.hero-content (centered container)
      ├─ div.text-content
      │   ├─ h1 "Language Reactor"
      │   └─ p.subtitle (description text)
      ├─ div.cta-button-container
      │   └─ button.install-button
      │       ├─ ExternalLinkIcon
      │       └─ span "安装 CHROME 扩展"
      └─ div.hero-image-container
          └─ img (girl at desk illustration)
```

## Visual Analysis (from screenshot)

### Section Container
- Full-width section
- Dark background (matches --background color)
- Centered content with max-width constraint
- Vertical padding: approximately 80-120px top, 60-80px bottom
- Display: flex or grid for layout

### Text Content

#### Main Heading "Language Reactor"
- Font size: Very large, approximately 56-72px
- Font weight: Bold (700)
- Color: White (--foreground)
- Text align: Center or left
- Letter spacing: Tight (-0.02em to -0.01em)
- Line height: 1.1-1.2
- Margin bottom: 16-24px

#### Subtitle Text
- Font size: Approximately 18-20px
- Font weight: Normal (400)
- Color: Muted white (rgba(255, 255, 255, 0.7) or --muted-foreground)
- Text align: Matches heading
- Line height: 1.5-1.6
- Max width: 600-700px for readability
- Margin bottom: 32-40px

### CTA Button "安装 CHROME 扩展"
- Display: inline-flex
- Align items: center
- Gap: 8-12px (between icon and text)
- Padding: 12-16px 24-32px
- Background: Secondary color (--secondary / teal)
- Color: Dark text (--secondary-foreground)
- Border radius: 8-12px
- Font size: 16-18px
- Font weight: 600
- Text transform: uppercase
- Cursor: pointer
- Transition: all 0.2s ease

#### Button Hover State
- Background: Lighter teal (increase lightness by 5-10%)
- Transform: translateY(-2px)
- Box shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
- Transition: all 0.2s ease

#### Button Icon
- Size: 20-24px
- Color: Inherits from button text color
- Position: Left of text

### Hero Image
- Position: Absolute or relative within container
- Image: Girl at desk illustration
- Width: 400-600px (responsive)
- Height: Auto (maintain aspect ratio)
- Object fit: contain
- Position: Right side on desktop, below text on mobile
- May have multiple layers (small + big variants mentioned in topology)

## Computed Styles (estimated from visual analysis)

### Hero Container
- width: 100%
- maxWidth: 1200px (or similar container width)
- margin: 0 auto
- padding: 80px 24px 60px
- display: flex or grid
- flexDirection: row (desktop) / column (mobile)
- alignItems: center
- justifyContent: space-between
- gap: 48px
- backgroundColor: var(--background)
- color: var(--foreground)

### Text Content Container
- flex: 1
- maxWidth: 600px
- zIndex: 10 (above image if overlapping)

### Heading (h1)
- fontSize: 64px (desktop) / 40px (mobile)
- fontWeight: 700
- lineHeight: 1.1
- letterSpacing: -0.02em
- color: rgb(255, 255, 255)
- marginBottom: 20px

### Subtitle
- fontSize: 18px
- fontWeight: 400
- lineHeight: 1.6
- color: rgba(255, 255, 255, 0.7)
- maxWidth: 560px
- marginBottom: 36px

### CTA Button
- display: inline-flex
- alignItems: center
- gap: 10px
- padding: 14px 28px
- backgroundColor: var(--secondary) (teal)
- color: var(--secondary-foreground) (dark)
- borderRadius: 10px
- fontSize: 16px
- fontWeight: 600
- textTransform: uppercase
- cursor: pointer
- border: none
- transition: all 0.2s ease
- boxShadow: 0 2px 8px rgba(0, 0, 0, 0.1)

### Hero Image Container
- flex: 1
- position: relative
- width: 100%
- maxWidth: 500px
- height: auto

### Hero Image
- width: 100%
- height: auto
- objectFit: contain
- display: block

## States & Behaviors

### Button Hover State
- **Trigger:** Mouse hover
- **State change:** 
  - backgroundColor: Lighter teal (oklch(0.88 0.25 168))
  - transform: translateY(-2px)
  - boxShadow: 0 4px 12px rgba(0, 0, 0, 0.15)
- **Transition:** all 0.2s ease

### Button Active State
- **Trigger:** Mouse click/press
- **State change:**
  - transform: translateY(0)
  - boxShadow: 0 1px 4px rgba(0, 0, 0, 0.1)
- **Transition:** all 0.1s ease

## Assets
- Hero images (layered):
  - Small variant: `public/images/hero/girl_desk-small.webp`
  - Big variant: `public/images/hero/girl_desk-big.webp`
  - Implementation: Use both images layered or choose based on viewport size
- Icon: `ExternalLinkIcon` from `src/components/icons.tsx`

## Text Content (verbatim from site)
- **Heading:** "Language Reactor"
- **Subtitle:** "🚀 探索、理解并从母语材料中学习的完美助手。✨ 体验一种不仅高效，更充满乐趣的沉浸式学习方式！🔥"
- **Button text:** "安装 CHROME 扩展"
- **User count badge:** "2,000,000+ users" (optional, may be displayed below button)

## Responsive Behavior

### Desktop (> 1024px)
- Two-column layout (text left, image right)
- Heading: 64px
- Subtitle: 18px
- Image: Full size (500px max-width)
- Horizontal alignment with gap: 48px

### Tablet (768px - 1024px)
- Two-column layout maintained but tighter
- Heading: 52px
- Subtitle: 17px
- Image: Slightly smaller (400px max-width)
- Gap: 32px
- Padding: 60px 24px 48px

### Mobile (< 768px)
- Single column layout (text above, image below)
- Heading: 40px
- Subtitle: 16px
- Image: Full width (max 400px, centered)
- Text align: center
- Button: Full width or centered
- Padding: 48px 16px 36px
- Gap: 32px

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Implementation Notes

1. **Layout:** Use flexbox for desktop (row) and mobile (column) layouts
2. **Typography:** Use font sizes from globals.css, scale responsively
3. **Colors:** Use CSS variables from globals.css (--secondary for button, --foreground for text)
4. **Button:** Should link to Chrome Web Store URL
5. **Image:** May need to handle multiple image layers if "small + big variants" are present
6. **Spacing:** Use consistent spacing scale (8px base)
7. **Accessibility:** 
   - h1 should be semantic heading
   - Button should have proper aria-label
   - Image should have descriptive alt text
8. **Performance:** Use Next.js Image component for optimization

## Implementation Priority
1. Create semantic HTML structure with h1, p, button
2. Implement responsive layout (flex row → column)
3. Style text with proper typography scale
4. Style CTA button with hover/active states
5. Add hero image with Next.js Image component
6. Test responsive behavior at all breakpoints
7. Verify accessibility (semantic HTML, aria-labels, alt text)
