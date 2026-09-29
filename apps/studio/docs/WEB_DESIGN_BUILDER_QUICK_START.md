# Web Design Builder - Quick Start Guide

## Overview

The Web Design Builder is a drag-and-drop visual website designer built into WISE² Studio. Create professional websites without coding using 5 professional templates, 25+ UI components, and real-time preview.

## Getting Started

### 1. Launch the Builder

```tsx
import WebDesignBuilder from '@/components/WebDesignBuilder';

export default function DesignPage() {
  return (
    <WebDesignBuilder
      initialProjectId="project-123"
      showTemplates={true}
      onSave={(projectId) => console.log('Saved:', projectId)}
    />
  );
}
```

### 2. Choose a Template (Optional)

When you first load the builder:
- Click "Use This Template" to start with a professionally designed template
- **Landing** - Product/service promotion with hero section
- **Portfolio** - Showcase your work
- **Services** - Display service offerings and pricing
- **About** - Tell your story
- **Contact** - Collect inquiries

Or start blank and build from scratch.

### 3. Add Elements

**Via Component Library (Left Sidebar):**
- Drag components from the library onto the canvas
- Available categories:
  - **Text** - Headings, paragraphs
  - **Layout** - Containers, cards, dividers
  - **Media** - Images, icons
  - **Forms** - Inputs, buttons, labels
  - **Advanced** - Hero sections, grids, testimonials

**Via Double-Click:**
- Double-click the canvas to add a container
- Type content directly

### 4. Edit Styles

**Select an element** on the canvas (click to highlight with blue ring)

**Style Panel (Right Sidebar):**
- **Layout** - Width, height, padding, margin, display, gap
- **Typography** - Font size, weight, alignment
- **Colors** - Text color, background, opacity
- **Effects** - Border radius, shadows, transforms
- **Animations** - Choose 9 animations with duration/delay
- **Responsive** - Mobile and tablet overrides

### 5. Arrange Elements

**Drag to Move:**
- Click and drag elements on the canvas to reposition

**Copy/Paste:**
- Select element → Right-click → Copy
- Right-click canvas → Paste

**Delete:**
- Select element → Press Delete key

**Duplicate:**
- Select element → Click ⧉ button (appears above selected element)

### 6. Preview Your Design

**Show Preview (Top Right):**
- Click "Show Preview" to toggle preview pane
- Switch between Desktop (1024px) / Tablet (768px) / Mobile (375px)
- See responsive behavior in real-time

### 7. Export

**Click "Export" (Top Right):**
- Downloads both HTML and CSS files
- Ready to deploy or integrate into your website

### 8. Save

**Auto-Save:**
- Design auto-saves every 30 seconds to browser localStorage

**Manual Save:**
- Click "Save" button to force save immediately

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Undo | Ctrl/Cmd + Z |
| Redo | Ctrl/Cmd + Shift + Z |
| Save | Ctrl/Cmd + S |
| Copy | Ctrl/Cmd + C |
| Paste | Ctrl/Cmd + V |
| Cut | Ctrl/Cmd + X |
| Delete | Delete |
| Deselect | Escape |

## Common Tasks

### Create a Two-Column Layout

1. Drag a "Container" from the library
2. Set width to 100%, display to "grid"
3. Set gridTemplateColumns to "1fr 1fr"
4. Drag content into each column

### Add a Button

1. Drag "Button" from Forms category
2. Select it and edit content: "Click Me"
3. Style it:
   - Background Color: #2563eb
   - Color (text): white
   - Padding: 10px 24px
   - Border Radius: 6px

### Make Text Responsive

1. Select text element
2. Scroll to "Responsive" section
3. Under Mobile:
   - Set Font Size to 16px
   - Set Padding to 12px
4. Under Tablet:
   - Set Font Size to 18px
   - Set Padding to 16px

### Add a Fade-In Animation

1. Select element
2. Scroll to "Animations"
3. Animation Type: "Fade"
4. Duration: 500ms
5. Delay: 0ms
6. Easing: "ease"

## Pro Tips

- Use the grid snap feature for aligned layouts
- Adjust zoom level (50-200%) for precise editing
- Mobile preview shows real device frame
- All changes are persisted to localStorage
- History shows up to 50 undo steps
- Z-index calculated automatically based on layer order

## Troubleshooting

### Elements Not Showing

- Check z-index (should be automatic)
- Verify background color is visible (not same as container background)
- Ensure element has width/height defined

### Animation Not Playing

- Verify animation type is selected
- Check duration is > 0
- Ensure element is on canvas (not hidden)

### Styles Not Updating

- Click canvas to ensure focus
- Try saving manually (Ctrl/Cmd + S)
- Refresh page if stuck

### Export Not Working

- Ensure browser allows downloads
- Check console for errors (F12)
- Try refreshing page

## Next Steps

1. **Customize Colors** - Update project colors in style panel
2. **Add Content** - Replace placeholder text with your content
3. **Upload Images** - Use image elements with image URLs
4. **Customize Fonts** - Change heading/body fonts in project settings
5. **Deploy** - Download HTML/CSS and publish to web server

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Tips

- Keep designs under 100 elements for smooth performance
- Use responsive styles instead of multiple breakpoints
- Disable animations on very old devices
- Clear browser cache if slow

---

**Need Help?** Check the API Reference for detailed component documentation.
