# DSA Sheet Tracker - Color Theme Reference

## 🎨 Orange, White & Black Theme

### Primary Colors

| Color | Value | Usage |
|-------|-------|-------|
| **Primary Orange** | `#ff6b35` | Main brand color, buttons, links, accents |
| **Primary Hover** | `#ff8555` | Hover states for primary elements |
| **Primary Light** | `#fff1ec` | Light backgrounds, subtle highlights |
| **Primary Dark** | `#d45a00` | Dark accents, active states |

### Secondary Colors

| Color | Value | Usage |
|-------|-------|-------|
| **Secondary Orange** | `#f77f00` | Secondary accent color |
| **Secondary Hover** | `#ff9520` | Hover states for secondary elements |
| **Secondary Light** | `#fff5e6` | Light secondary backgrounds |

### Difficulty Colors (DSA Problems)

| Difficulty | Color | Background | Usage |
|------------|-------|------------|-------|
| **Easy** | `#10b981` (Green) | `#d1fae5` | Easy problems badge |
| **Medium** | `#f59e0b` (Yellow/Orange) | `#fef3c7` | Medium problems badge |
| **Hard** | `#ef4444` (Red) | `#fee2e2` | Hard problems badge |

### Status Colors

| Status | Color | Light Background |
|--------|-------|------------------|
| **Success** | `#10b981` | `#d1fae5` |
| **Warning** | `#f59e0b` | `#fef3c7` |
| **Danger** | `#ef4444` | `#fee2e2` |
| **Info** | `#ff6b35` | `#fff1ec` |

## 🌞 Light Theme (Default)

### Backgrounds
- **Main Background**: `#ffffff` (Pure White)
- **Surface**: `#fafafa` (Light Gray)
- **Surface Elevated**: `#ffffff` (White)
- **Border**: `#e5e5e5` (Light Gray)

### Text Colors
- **Primary Text**: `#0a0a0a` (Near Black)
- **Secondary Text**: `#525252` (Medium Gray)
- **Muted Text**: `#a3a3a3` (Light Gray)
- **Inverse Text**: `#ffffff` (White)

### Gradients
- **Primary Gradient**: `linear-gradient(135deg, #ff6b35 0%, #f77f00 100%)`
- **Subtle Gradient**: `linear-gradient(135deg, #fff1ec 0%, #fff5e6 100%)`

## 🌙 Dark Theme

### Backgrounds
- **Main Background**: `#0a0a0a` (Pure Black)
- **Surface**: `#171717` (Dark Gray)
- **Surface Elevated**: `#262626` (Medium Dark Gray)
- **Border**: `#262626` (Medium Dark Gray)

### Text Colors
- **Primary Text**: `#fafafa` (Near White)
- **Secondary Text**: `#d4d4d4` (Light Gray)
- **Muted Text**: `#737373` (Medium Gray)
- **Inverse Text**: `#0a0a0a` (Black)

### Gradients
- **Primary Gradient**: `linear-gradient(135deg, #ff6b35 0%, #f77f00 100%)`
- **Subtle Gradient**: `linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 127, 0, 0.1) 100%)`

## 🎯 Sidebar/Header (Both Themes)

| Element | Color | Usage |
|---------|-------|-------|
| **Background** | `#0a0a0a` (Black) | Always dark, even in light theme |
| **Text** | `#d4d4d4` (Light Gray) | Normal sidebar text |
| **Text Active** | `#ffffff` (White) | Active/selected item |
| **Hover** | `#1a1a1a` (Slightly lighter black) | Hover state |
| **Accent** | `#ff6b35` (Orange) | Active indicator, highlights |

## 🎨 Design Tokens

### Border Radius
- **Small**: `0.375rem` (6px)
- **Medium**: `0.5rem` (8px)
- **Large**: `0.75rem` (12px)
- **Extra Large**: `1rem` (16px)

### Shadows
- **Card**: `0 1px 3px rgba(255, 107, 53, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)`
- **Card Hover**: `0 4px 6px rgba(255, 107, 53, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)`

### Typography
- **Font Family**: `'Geist Variable', 'Inter', ui-sans-serif, system-ui, sans-serif`

### Layout
- **Sidebar Width**: `260px`
- **Header Height**: `74px`

## 📝 Usage Examples

### Buttons
```tsx
// Primary Button
<button className="bg-[--color-primary] hover:bg-[--color-primary-hover] text-white">
  Submit
</button>

// Secondary Button
<button className="bg-[--color-secondary] hover:bg-[--color-secondary-hover] text-white">
  Cancel
</button>
```

### Difficulty Badges
```tsx
// Easy
<span className="bg-[--color-difficulty-easy-bg] text-[--color-difficulty-easy]">Easy</span>

// Medium
<span className="bg-[--color-difficulty-medium-bg] text-[--color-difficulty-medium]">Medium</span>

// Hard
<span className="bg-[--color-difficulty-hard-bg] text-[--color-difficulty-hard]">Hard</span>
```

### Cards
```tsx
<div className="bg-[--color-surface] border border-[--color-border] rounded-[--radius-lg]">
  Card Content
</div>
```

## 🎯 Color Philosophy

1. **Orange** (`#ff6b35`): Energy, enthusiasm, learning - represents the active journey of DSA preparation
2. **White** (`#ffffff`): Clean, clear, focused - provides a distraction-free environment for studying
3. **Black** (`#0a0a0a`): Professional, elegant - creates contrast and hierarchy, especially in dark mode

This color scheme is designed to be:
- ✅ **Energetic yet professional**
- ✅ **Eye-friendly for long study sessions**
- ✅ **High contrast for accessibility**
- ✅ **Consistent across light and dark themes**


claude --resume 4c1f99e8-d312-4bc2-b74c-187421beed7f