# Web Design Builder - Usage Examples

## Complete Examples

### Example 1: Basic Landing Page

**Goal:** Create a simple product landing page with hero, features, and CTA.

**Steps:**

1. **Start with Landing Template**
   - Click "Use This Template" in template selector

2. **Customize Hero Section**
   ```
   Select: "Welcome to Our Product"
   Edit Content: "SoundLabs - Create Professional Music"
   
   Select: Container (hero)
   Style Panel > Colors:
   - Background Color: #1f2937
   - Color (text): #ffffff
   
   Style Panel > Layout:
   - Padding: 80px 24px
   - Text Align: center
   ```

3. **Add Feature Cards**
   - Drag 3x "Card" from library
   - Set each card:
     ```
     Width: 32%
     Background: #ffffff
     Border: 1px solid #e5e7eb
     Padding: 24px
     Border Radius: 8px
     Box Shadow: 0 1px 3px rgba(0,0,0,0.1)
     ```

4. **Add Call-to-Action**
   - Drag "Button" component
   - Style:
     ```
     Background Color: #2563eb
     Color: #ffffff
     Padding: 12px 24px
     Border Radius: 6px
     Font Weight: 600
     ```

5. **Export & Deploy**
   - Click "Export"
   - Download HTML and CSS
   - Upload to web server

---

### Example 2: Portfolio Gallery with Animations

**Goal:** Create portfolio with image gallery and fade-in animations.

**Steps:**

1. **Start with Portfolio Template**

2. **Create Gallery Grid**
   ```
   Drag: Container
   Style:
   - Display: grid
   - Grid Template Columns: repeat(3, 1fr)
   - Gap: 16px
   - Padding: 40px
   - Background: #f9fafb
   ```

3. **Add Portfolio Items (6x)**
   ```
   For each item:
   - Drag: Image
   - Set src: [URL to portfolio image]
   - Set width: 100%
   - Set height: 280px
   - Set object-fit: cover
   - Add Border Radius: 8px
   ```

4. **Add Animations**
   ```
   Select: First image
   Style Panel > Animations:
   - Type: scaleIn
   - Duration: 400ms
   - Delay: 0ms
   
   Select: Second image
   - Type: scaleIn
   - Duration: 400ms
   - Delay: 100ms
   
   Repeat for remaining images (200ms, 300ms, etc.)
   ```

5. **Add Hover Effects**
   ```
   Select: Image
   Style Panel > Effects:
   - Box Shadow: 0 10px 25px rgba(0,0,0,0.1)
   - Transform: scale(1.05)
   ```

6. **Test & Preview**
   - Click "Show Preview"
   - Switch between Desktop/Tablet/Mobile
   - Verify animations play smoothly

---

### Example 3: Services Page with Pricing Table

**Goal:** Create services page with 3 pricing tiers and comparison.

**Steps:**

1. **Start with Services Template**

2. **Create Pricing Section**
   ```
   Drag: Container (main)
   Style:
   - Display: flex
   - Flex Direction: row
   - Justify Content: center
   - Gap: 24px
   - Padding: 60px 24px
   ```

3. **Create First Pricing Card**
   ```
   Drag: Card
   Content: "Starter"
   Style:
   - Width: 300px
   - Padding: 40px 24px
   - Border: 1px solid #e5e7eb
   - Border Radius: 8px
   - Text Align: center
   ```

4. **Add Price Heading**
   ```
   Drag: Heading
   Content: "$29"
   Style:
   - Font Size: 48px
   - Font Weight: bold
   - Color: #2563eb
   - Margin: 16px 0
   ```

5. **Add Feature List**
   ```
   Drag: Paragraph (multiple)
   Content examples:
   - "10 Projects"
   - "5GB Storage"
   - "Email Support"
   
   Style:
   - Font Size: 14px
   - Padding: 8px 0
   - Color: #6b7280
   ```

6. **Add CTA Button**
   ```
   Drag: Button
   Content: "Get Started"
   Style:
   - Background Color: #2563eb
   - Color: #ffffff
   - Padding: 12px 24px
   - Width: 100%
   - Margin Top: 24px
   ```

7. **Duplicate Card for Other Tiers**
   ```
   Select: Starter card container
   Click: Duplicate button (⧉)
   Update: Price and features for "Professional"
   Duplicate again for "Enterprise"
   ```

8. **Responsive Adjustments**
   ```
   Select: Main pricing container
   Style Panel > Responsive > Mobile:
   - Flex Direction: column
   - Gap: 16px
   
   Select: Each card
   Style Panel > Responsive > Mobile:
   - Width: 100%
   ```

---

### Example 4: Contact Form with Validation

**Goal:** Create contact form page.

**Steps:**

1. **Start with Contact Template**

2. **Create Form Container**
   ```
   Drag: Form
   Style:
   - Width: 100%
   - Max Width: 500px
   - Margin: 60px auto
   - Padding: 40px
   - Background: #f9fafb
   - Border Radius: 8px
   - Box Shadow: 0 4px 6px rgba(0,0,0,0.1)
   ```

3. **Add Form Fields**
   
   **Field 1: Name**
   ```
   Drag: Form Label
   Content: "Full Name"
   Style: Font Weight: 600, Margin Bottom: 8px
   
   Drag: Form Input
   Style:
   - Width: 100%
   - Padding: 12px
   - Border: 1px solid #d1d5db
   - Border Radius: 6px
   - Font Size: 14px
   - Margin Bottom: 16px
   ```

   **Field 2: Email**
   ```
   Drag: Form Label
   Content: "Email Address"
   
   Drag: Form Input
   Style: [Same as Name field]
   ```

   **Field 3: Message**
   ```
   Drag: Form Label
   Content: "Message"
   
   Drag: Form Input (simulate textarea)
   Style:
   - Width: 100%
   - Height: 150px
   - Padding: 12px
   - Resize: vertical
   ```

4. **Add Submit Button**
   ```
   Drag: Button
   Content: "Send Message"
   Style:
   - Width: 100%
   - Background Color: #2563eb
   - Color: #ffffff
   - Padding: 12px
   - Font Weight: 600
   - Cursor: pointer
   - Margin Top: 16px
   ```

5. **Add Input Focus Styles**
   ```
   Select: Each input
   Style Panel > Effects:
   - Border: 2px solid #2563eb (on focus)
   - Box Shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)
   ```

---

### Example 5: Responsive Team Section

**Goal:** Create responsive team member cards.

**Steps:**

1. **Create Team Container**
   ```
   Drag: Container (main)
   Style:
   - Display: grid
   - Grid Template Columns: repeat(4, 1fr)
   - Gap: 24px
   - Padding: 60px 24px
   ```

2. **Create Team Member Card (repeat 4x)**
   ```
   Drag: Card
   Content: "Team Member Name"
   Style:
   - Padding: 24px
   - Text Align: center
   - Background: #ffffff
   - Border Radius: 8px
   - Box Shadow: 0 1px 3px rgba(0,0,0,0.1)
   ```

3. **Add Member Photo**
   ```
   Drag: Image (first child in card)
   Style:
   - Width: 120px
   - Height: 120px
   - Border Radius: 50% (circle)
   - Margin: 0 auto 16px
   - Object Fit: cover
   ```

4. **Add Name & Role**
   ```
   Drag: Heading (h3)
   Content: "Jane Smith"
   Style:
   - Font Size: 18px
   - Font Weight: 600
   - Margin: 8px 0
   
   Drag: Paragraph
   Content: "Product Designer"
   Style:
   - Color: #6b7280
   - Font Size: 14px
   - Margin Bottom: 12px
   ```

5. **Add Social Links**
   ```
   Drag: Paragraph
   Content: "🔗 LinkedIn | 🐦 Twitter"
   Style:
   - Font Size: 12px
   - Color: #3b82f6
   ```

6. **Make Responsive**
   ```
   Select: Main container
   Style Panel > Responsive > Tablet:
   - Grid Template Columns: repeat(2, 1fr)
   
   Style Panel > Responsive > Mobile:
   - Grid Template Columns: 1fr
   - Gap: 16px
   ```

7. **Add Hover Animation**
   ```
   Select: Card
   Style Panel > Effects:
   - Transform: translateY(-8px) (on hover)
   - Box Shadow: 0 10px 25px rgba(0,0,0,0.1)
   ```

---

### Example 6: Newsletter Signup Section

**Goal:** Create email signup with gradient and animation.

**Steps:**

1. **Create Section Container**
   ```
   Drag: Container
   Style:
   - Width: 100%
   - Padding: 80px 24px
   - Background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
   - Text Align: center
   - Color: #ffffff
   ```

2. **Add Heading**
   ```
   Drag: Heading
   Content: "Stay Updated"
   Style:
   - Font Size: 36px
   - Font Weight: bold
   - Color: #ffffff
   - Margin Bottom: 12px
   ```

3. **Add Description**
   ```
   Drag: Paragraph
   Content: "Get weekly tips and insights delivered to your inbox"
   Style:
   - Font Size: 16px
   - Color: rgba(255, 255, 255, 0.9)
   - Max Width: 600px
   - Margin: 0 auto 32px
   ```

4. **Create Signup Form**
   ```
   Drag: Container (flex, row)
   Style:
   - Display: flex
   - Gap: 8px
   - Max Width: 500px
   - Margin: 0 auto
   - Flex Direction: row
   
   Mobile responsive:
   - Flex Direction: column
   ```

5. **Add Email Input**
   ```
   Drag: Form Input
   Placeholder: "Enter your email"
   Style:
   - Flex: 1
   - Padding: 12px 16px
   - Border: none
   - Border Radius: 6px
   - Font Size: 14px
   ```

6. **Add Subscribe Button**
   ```
   Drag: Button
   Content: "Subscribe"
   Style:
   - Background: #ffffff
   - Color: #667eea
   - Padding: 12px 32px
   - Border: none
   - Border Radius: 6px
   - Font Weight: 600
   - Cursor: pointer
   ```

7. **Add Animation**
   ```
   Select: Container
   Style Panel > Animations:
   - Type: slideIn
   - Duration: 600ms
   - Delay: 0ms
   ```

---

## Advanced Techniques

### Creating Custom Component

```tsx
// In useWebDesignBuilder hook
const button = {
  id: 'custom-button',
  type: 'button',
  label: 'Primary Button',
  content: 'Click Me',
  styles: {
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

store.addElement(button);
```

### Staggered Animations

```tsx
// Add multiple items with increasing delays
for (let i = 0; i < 5; i++) {
  store.addElement({
    id: `item-${i}`,
    type: 'card',
    label: `Item ${i + 1}`,
    styles: { /* ... */ },
    animation: {
      type: 'fadeIn',
      duration: 400,
      delay: i * 100, // Stagger by 100ms
      easing: 'ease',
    },
  });
}
```

### Conditional Styling

```tsx
// Apply different styles based on breakpoint
store.updateResponsiveStyle(elementId, 'mobile', {
  fontSize: '14px',
  padding: '12px',
});

store.updateResponsiveStyle(elementId, 'tablet', {
  fontSize: '16px',
  padding: '16px',
});
```

---

## Common Patterns

### Hero Section
```
┌─────────────────────────┐
│   Large Headline (48px) │
│                         │
│   Small Subtitle (18px) │
│                         │
│      [CTA Button]       │
└─────────────────────────┘
```

### Feature Cards
```
[Icon/Image]  [Icon/Image]  [Icon/Image]
   Title         Title         Title
Description   Description   Description
```

### Testimonial
```
┌─────────────────────────┐
│  "Quote text here"      │
│  - Person Name, Title   │
└─────────────────────────┘
```

### Stats Section
```
┌────┐  ┌────┐  ┌────┐  ┌────┐
│500 │  │1M+ │  │98% │  │24/7 │
│  K │  │ Users│  │Uptime│Support│
└────┘  └────┘  └────┘  └────┘
```

---

## Troubleshooting Examples

### Problem: Buttons not clickable

**Solution:**
```
Select: Button
Style Panel > Layout > Display: block
Verify: Cursor is set to "pointer"
```

### Problem: Text overlapping

**Solution:**
```
Select: Container
Style Panel > Layout:
- Padding: Increase (e.g., 24px)
- Gap: Set appropriate value (16px)
Display: flex or grid
```

### Problem: Images not showing

**Solution:**
```
Select: Image element
Style Panel > Layout:
- Width: Check it's set (e.g., 100%)
- Height: Check it's set (e.g., auto)
Check: Image URL is valid and accessible
```

---

## Export & Integration

### Export to HTML/CSS
```tsx
const html = store.exportAsHTML();
const css = store.exportAsCSS();

// Download files
downloadFile(html, 'index.html', 'text/html');
downloadFile(css, 'styles.css', 'text/css');
```

### Integrate with React
```tsx
// Generated JSX from builder
import Page from './generated/page.jsx';
import './generated/styles.css';

export default function MyPage() {
  return <Page />;
}
```

---

**For more details, see the API Reference and Template Guide.**
