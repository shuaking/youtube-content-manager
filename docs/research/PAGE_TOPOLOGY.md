# Language Reactor - Page Topology

## Visual Order (Top to Bottom)

1. **Fixed Header** (z-index: 1100)
   - Logo
   - Language selector
   - Navigation menu (drawer on mobile)
   - Search/history icons
   - Login button
   - Install Chrome Extension CTA button

2. **Hero Section**
   - Large heading "Language Reactor"
   - Subheading text
   - Girl at desk image (layered: small + big variants)
   - Install Chrome Extension button with icon

3. **Main Content Cards Section**
   - Grid of feature cards (3 columns on desktop)
   - Each card has: image, title, description, arrow button
   - Cards include:
     - Netflix (double-width card)
     - YouTube and Podcasts
     - Books & Websites
     - Learning Focus
     - Smart Highlighting
     - PhrasePump
     - Export to Anki
     - Aria Chatbot
     - FSI/DLI
     - Tablet/Phone

4. **Secondary Features Section**
   - Additional feature cards with screenshots
   - Bilingual subtitles
   - Precise playback controls
   - Dictionary and examples
   - World map

5. **Footer**
   - Social media links
   - Additional navigation
   - Copyright info

## Layout Structure

- **Page container:** Standard flow, no scroll-snap
- **Header:** Fixed position, top: 0, z-index: 1100, backdrop-filter: blur(3px)
- **Content:** Max-width container, centered
- **Grid system:** CSS Grid for cards, responsive columns (3 → 2 → 1)

## Z-Index Layers

- 1200: Drawer/Modal overlays
- 1100: Fixed header
- 1000: Side drawer
- Auto: Content flow

## Interaction Models by Section

- **Header:** Static with scroll-triggered backdrop blur (always present)
- **Hero:** Static
- **Cards:** Click-driven (links to different pages)
- **Footer:** Static

## Dependencies

- Header overlays all content (fixed positioning)
- No section dependencies otherwise
- Cards are independent, can be built in parallel
