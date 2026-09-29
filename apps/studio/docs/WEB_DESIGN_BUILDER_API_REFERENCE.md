# Web Design Builder - API Reference

## useWebDesignBuilder Hook

Main Zustand store for managing design state and operations.

### Import

```tsx
import { useWebDesignBuilder } from '@/hooks/useWebDesignBuilder';
```

### Usage

```tsx
const store = useWebDesignBuilder();

// Access state
store.project // Current project
store.selectedElementId // ID of selected element
store.history // Undo/redo history
store.zoomLevel // Current zoom (50-200)

// Call methods
store.addElement(element);
store.updateElementStyle(elementId, styles);
store.undo();
store.exportAsHTML();
```

## State Properties

### `project: DesignProject`

Current design project.

```tsx
{
  id: string;
  name: string;
  description?: string;
  elements: DesignElement[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### `selectedElementId: string | undefined`

ID of currently selected element. `undefined` if nothing selected.

### `history: HistoryEntry[]`

Array of undo/redo history entries (up to 50).

### `historyIndex: number`

Current position in history (for undo/redo).

### `isDragging: boolean`

Whether user is currently dragging an element.

### `isResizing: boolean`

Whether user is currently resizing an element.

### `clipboard: DesignElement | undefined`

Copied element in clipboard.

### `zoomLevel: number`

Current canvas zoom level (50-200).

## Project Management

### `createProject(name: string, templateId?: string): void`

Create a new project.

```tsx
store.createProject('My Design', 'landing');
```

### `updateProjectName(name: string): void`

Rename current project.

```tsx
store.updateProjectName('Updated Name');
```

### `updateProjectColors(colors: Colors): void`

Update project color palette.

```tsx
store.updateProjectColors({
  primary: '#3b82f6',
  secondary: '#1e40af',
  accent: '#dbeafe',
  background: '#ffffff',
  text: '#1f2937',
});
```

### `updateProjectFonts(fonts: { heading: string; body: string }): void`

Update project fonts.

```tsx
store.updateProjectFonts({
  heading: 'Georgia, serif',
  body: 'Arial, sans-serif',
});
```

## Element Management

### `addElement(element: DesignElement, parentId?: string): void`

Add element to canvas.

```tsx
store.addElement(
  {
    id: 'heading-1',
    type: 'heading',
    label: 'My Title',
    content: 'Welcome',
    styles: { fontSize: '32px', fontWeight: 'bold' },
  },
  'container-1' // optional parent
);
```

### `removeElement(elementId: string): void`

Delete element and its children.

```tsx
store.removeElement('heading-1');
```

### `updateElement(elementId: string, updates: Partial<DesignElement>): void`

Update element properties.

```tsx
store.updateElement('heading-1', {
  content: 'New Title',
  label: 'Updated Heading',
});
```

### `selectElement(elementId: string | undefined): void`

Select element for editing. Pass `undefined` to deselect.

```tsx
store.selectElement('heading-1');
store.selectElement(undefined); // deselect
```

### `duplicateElement(elementId: string): void`

Create a copy of element.

```tsx
store.duplicateElement('heading-1');
```

### `moveElement(elementId: string, newIndex: number, parentId?: string): void`

Reorder or move element to different parent.

```tsx
store.moveElement('heading-1', 2); // Move to index 2
store.moveElement('heading-1', 0, 'new-parent-id'); // Move to new parent
```

## Styling

### `updateElementStyle(elementId: string, style: Partial<ElementStyle>): void`

Update element CSS styles.

```tsx
store.updateElementStyle('heading-1', {
  fontSize: '24px',
  color: '#1f2937',
  marginBottom: '16px',
});
```

### `updateElementAnimation(elementId: string, animation?: AnimationConfig): void`

Add or update animation.

```tsx
store.updateElementAnimation('heading-1', {
  type: 'fadeIn',
  duration: 500,
  delay: 0,
  easing: 'ease',
});

// Remove animation
store.updateElementAnimation('heading-1', undefined);
```

### `updateResponsiveStyle(elementId: string, breakpoint: 'mobile' | 'tablet', style: Partial<ElementStyle>): void`

Set responsive overrides.

```tsx
store.updateResponsiveStyle('heading-1', 'mobile', {
  fontSize: '18px',
  padding: '12px',
});
```

## History & Undo/Redo

### `undo(): void`

Undo last change.

```tsx
store.undo();
```

### `redo(): void`

Redo last undone change.

```tsx
store.redo();
```

### `clearHistory(): void`

Clear all undo/redo history.

```tsx
store.clearHistory();
```

### `pushHistory(): void`

Manually add current state to history. (Usually automatic)

```tsx
store.pushHistory();
```

## Clipboard Operations

### `copyElement(elementId: string): void`

Copy element to clipboard.

```tsx
store.copyElement('heading-1');
```

### `pasteElement(parentId?: string): void`

Paste clipboard element.

```tsx
store.pasteElement(); // Paste at root
store.pasteElement('container-id'); // Paste into container
```

### `cutElement(elementId: string): void`

Cut element (copy + delete).

```tsx
store.cutElement('heading-1');
```

## Canvas Interactions

### `setDragging(isDragging: boolean): void`

Update dragging state. (Usually automatic)

```tsx
store.setDragging(true);
```

### `setResizing(isResizing: boolean): void`

Update resizing state. (Usually automatic)

```tsx
store.setResizing(true);
```

### `setZoomLevel(zoom: number): void`

Set canvas zoom level (50-200).

```tsx
store.setZoomLevel(150); // 150%
```

## Persistence

### `saveToLocalStorage(): void`

Save project to browser localStorage.

```tsx
store.saveToLocalStorage();
```

### `loadFromLocalStorage(projectId: string): boolean`

Load project from localStorage. Returns success status.

```tsx
const loaded = store.loadFromLocalStorage('project-123');
if (loaded) console.log('Project loaded');
```

## Export

### `exportAsHTML(): string`

Generate HTML document.

```tsx
const html = store.exportAsHTML();
// Download or send to server
```

### `exportAsCSS(): string`

Generate CSS stylesheet.

```tsx
const css = store.exportAsCSS();
// Download or send to server
```

## Utilities

### `getAllElements(): DesignElement[]`

Get flat array of all elements (including nested).

```tsx
const elements = store.getAllElements();
elements.forEach(el => console.log(el.label));
```

### `getElementById(elementId: string): DesignElement | undefined`

Find element by ID anywhere in tree.

```tsx
const element = store.getElementById('heading-1');
if (element) console.log(element.content);
```

### `resetProject(): void`

Reset to initial empty state.

```tsx
store.resetProject();
```

## Type Definitions

### `DesignElement`

```tsx
interface DesignElement {
  id: string;
  type: ElementType;
  label: string;
  content?: string;
  src?: string; // for images
  href?: string; // for links
  styles: ElementStyle;
  children?: DesignElement[];
  animation?: AnimationConfig;
  responsive?: {
    mobile?: ElementStyle;
    tablet?: ElementStyle;
  };
}
```

### `ElementType`

```tsx
type ElementType =
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'image'
  | 'card'
  | 'form'
  | 'form-input'
  | 'form-label'
  | 'divider'
  | 'icon'
  | 'container';
```

### `ElementStyle`

All standard CSS properties as TypeScript object keys:

```tsx
interface ElementStyle {
  // Layout
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  display?: 'block' | 'flex' | 'grid' | 'inline-block';
  
  // Typography
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  
  // Colors
  color?: string;
  backgroundColor?: string;
  opacity?: number;
  
  // Borders & Shadows
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  
  // More...
}
```

### `AnimationConfig`

```tsx
interface AnimationConfig {
  type: 'fade' | 'slideIn' | 'scaleIn' | 'rotateIn' | 'bounceIn' | 
        'pulse' | 'wiggle' | 'flip' | 'zoom';
  duration: number; // milliseconds
  delay: number; // milliseconds
  easing: 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'linear';
  repeat?: boolean;
  repeatDelay?: number;
}
```

## Web Design Service

Helper functions in `lib/web-design-service.ts`:

```tsx
import {
  generateHTML,
  generateCSS,
  generateJSX,
  exportDesign,
  downloadFile,
  validateElement,
  validateProject,
  cloneElement,
} from '@/lib/web-design-service';
```

### `generateHTML(project: DesignProject): string`

Generate complete HTML document.

### `generateCSS(project: DesignProject): string`

Generate complete CSS stylesheet.

### `exportDesign(project, options): DesignExport`

Export with options.

```tsx
exportDesign(store.project, {
  format: 'html',
  includeAnimations: true,
  minify: true,
  responsive: true,
});
```

### `downloadFile(content, filename, type): void`

Download file to user's device.

```tsx
const html = store.exportAsHTML();
downloadFile(html, 'my-design.html', 'text/html');
```

---

**Note:** All methods automatically trigger undo/redo history and persist to localStorage.
