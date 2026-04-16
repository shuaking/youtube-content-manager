# Header Component Specification

## Overview
- **Target file:** `src/components/Header.tsx`
- **Screenshot:** `docs/design-references/header-section.png`
- **Interaction model:** Static with backdrop blur effect (always present, not scroll-triggered)

## DOM Structure
```
header (fixed, backdrop-blur)
  └─ div.toolbar (flex container)
      ├─ div.logo-container
      │   └─ svg (Language Reactor logo)
      ├─ div.divider (vertical separator)
      ├─ div.icon-group (search + history icons)
      │   ├─ svg (search icon)
      │   └─ svg (history icon)
      ├─ div.divider
      ├─ div.notification-badge
      │   └─ span.badge (with notification indicator)
      ├─ p (spacer - flex-grow)
      ├─ div.language-selector
      │   ├─ svg (translate icon)
      │   └─ div.autocomplete (language dropdown)
      ├─ span.user-profile-container
      │   └─ span (user avatar/icon)
      └─ button.menu-button (hamburger icon)
```

## Computed Styles (exact values from getComputedStyle)

### Header Container
- position: fixed
- top: 0px
- left: 0px (adjusts with viewport)
- width: 100% (1215.67px at 1440px viewport)
- height: 56px
- zIndex: 1100
- backgroundColor: rgba(0, 0, 0, 0) (transparent)
- backdropFilter: blur(3px)
- borderBottom: 0.666667px solid rgba(255, 255, 255, 0.15)
- padding: 7px 0px
- display: flex
- flexDirection: column
- color: rgb(255, 255, 255)
- fontFamily: "Noto Sans", Helvetica, Arial, sans-serif
- transition: left 0.195s cubic-bezier(0.4, 0, 0.6, 1), width 0.195s cubic-bezier(0.4, 0, 0.6, 1)

### Toolbar (inner container)
- display: flex
- flexDirection: row
- alignItems: center
- height: 42px
- minHeight: 42px
- padding: 0px 4px
- width: 100%
- position: relative

### Logo Container
- display: flex
- flexDirection: row
- alignItems: center
- margin: 0px 5px 0px 10px
- width: 131.823px
- height: 29.7396px
- opacity: 0.9

### Logo Inner (clickable area)
- display: flex
- flexDirection: row
- alignItems: center
- gap: 6px
- padding: 4px 10px
- backgroundColor: rgba(255, 255, 255, 0.06)
- border: 0.666667px solid rgba(255, 255, 255, 0.1)
- borderRadius: 16px
- cursor: pointer
- fontSize: 13.6px
- lineHeight: 20.4px

### Vertical Divider
- display: block
- width: 1px
- height: 18px
- backgroundColor: rgba(255, 255, 255, 0.15)
- margin: 0px 4px

### Icon Group (Search + History)
- display: flex
- flexDirection: row
- alignItems: center
- gap: 8px
- margin: 0px 5px 0px 15px
- opacity: 0.6

### Icon (SVG)
- width: 19.1979px
- height: 19.1979px
- color: oklch(0.6 0 0)
- transition: fill 0.2s cubic-bezier(0.4, 0, 0.2, 1)

### Notification Badge Container
- display: flex
- flexDirection: row
- alignItems: center
- gap: 8px
- margin: 0px 10px
- width: 22.8542px
- height: 22.8542px
- opacity: 0.6
- cursor: pointer
- transition: opacity 0.2s

### Spacer (flex-grow element)
- display: block
- width: auto (flex-grow)
- fontSize: 16px
- lineHeight: 24px

### Language Selector Container
- display: flex
- flexDirection: row
- alignItems: center
- width: 180.854px
- height: 40px

### Translate Icon
- width: 22.8542px
- height: 22.8542px
- margin: 0px 8px 0px 0px
- color: rgb(255, 255, 255)

### Language Dropdown
- width: 150px
- height: 40px

### User Profile Container
- display: flex
- flexDirection: row
- width: 44px
- height: 36px

### Menu Button (Hamburger)
- display: flex
- flexDirection: row
- justifyContent: center
- alignItems: center
- padding: 5px
- margin: 0px 0px 0px 2px
- width: 37.4271px
- height: 37.4271px
- borderRadius: 50%
- backgroundColor: rgba(0, 0, 0, 0)
- color: rgba(255, 255, 255, 0.7)
- cursor: pointer
- transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)
- border: 0px

### Menu Icon (SVG inside button)
- width: 27.4271px
- height: 27.4271px
- fontSize: 27.4286px
- fontFamily: Arial

## States & Behaviors

### Hover States

#### Logo Container Hover
- **Trigger:** Mouse hover
- **State change:** opacity: 0.9 → 1.0
- **Transition:** opacity 0.2s ease

#### Icon Group Hover
- **Trigger:** Mouse hover on individual icons
- **State change:** opacity: 0.6 → 1.0
- **Transition:** opacity 0.2s ease

#### Notification Badge Hover
- **Trigger:** Mouse hover
- **State change:** opacity: 0.6 → 1.0
- **Transition:** opacity 0.2s

#### Menu Button Hover
- **Trigger:** Mouse hover
- **State change:** backgroundColor: rgba(0, 0, 0, 0) → rgba(255, 255, 255, 0.08)
- **Transition:** background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)

### Click Behaviors

#### Logo Click
- **Action:** Navigate to home page
- **Implementation:** Link wrapper

#### Language Selector Click
- **Action:** Open language dropdown menu
- **Implementation:** MUI Autocomplete component (simplified for clone)

#### Search Icon Click
- **Action:** Open search modal/panel
- **Implementation:** Button with onClick handler (mock for clone)

#### History Icon Click
- **Action:** Open history panel
- **Implementation:** Button with onClick handler (mock for clone)

#### Notification Badge Click
- **Action:** Open notifications panel
- **Implementation:** Button with onClick handler (mock for clone)

#### User Profile Click
- **Action:** Open user menu
- **Implementation:** Button with onClick handler (mock for clone)

#### Menu Button Click
- **Action:** Open mobile navigation drawer
- **Implementation:** Button with onClick handler (opens drawer on mobile)

## Assets
- Logo SVG: Use `LogoIcon` from `src/components/icons.tsx`
- Search Icon: Use `SearchIcon` (needs to be added to icons.tsx)
- History Icon: Use `HistoryIcon` from icons.tsx
- Translate Icon: Use `TranslateIcon` from icons.tsx
- Menu Icon: Use `MenuIcon` from icons.tsx
- User Profile Icon: Use `UserProfileIcon` from icons.tsx

## Text Content (verbatim)
- Language selector default: "英英语" (Chinese for "English")
- No other visible text in header at default state

## Responsive Behavior

### Desktop (1440px)
- Full header visible
- All elements displayed inline
- Logo with text
- Language selector visible
- User profile visible
- Menu button hidden or minimal

### Tablet (768px)
- Header maintains structure
- Some elements may reduce spacing
- Menu button becomes more prominent

### Mobile (390px)
- Logo may shrink or become icon-only
- Language selector may be hidden or moved to drawer
- Search/history icons may be hidden
- Menu button (hamburger) becomes primary navigation trigger
- User profile may be hidden or moved to drawer

### Breakpoints
- Mobile: < 600px
- Tablet: 600px - 960px
- Desktop: > 960px

## Implementation Notes

1. **Fixed Positioning:** Header must stay at top of viewport at all times
2. **Backdrop Blur:** Critical for the glassmorphism effect - use `backdrop-filter: blur(3px)`
3. **Z-Index Layering:** Must be above all content (z-index: 1100)
4. **Border Bottom:** Subtle separator with rgba(255, 255, 255, 0.15)
5. **Transparent Background:** Background is fully transparent, blur provides visual separation
6. **Icon Opacity:** Icons start at 0.6 opacity, increase to 1.0 on hover
7. **Smooth Transitions:** All interactive elements have smooth transitions (0.2s)
8. **Flexbox Layout:** Use flexbox for horizontal alignment and spacing
9. **Vertical Dividers:** Thin 1px dividers between major sections
10. **Language Selector:** Can be simplified to a button for the clone (no full dropdown functionality needed)
11. **Notification Badge:** Can show a static indicator for the clone
12. **User Profile:** Can be a static icon/avatar for the clone
13. **Menu Button:** Should trigger mobile drawer (implement drawer separately)

## Accessibility Notes
- All interactive elements should be keyboard accessible
- Icons should have aria-labels
- Menu button should have aria-label="Open menu"
- Language selector should have aria-label="Select language"
- Notification badge should indicate count if present
