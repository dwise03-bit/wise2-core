/**
 * Web Design Builder Type Definitions
 * MVP for WISE² Studio Web Design Builder
 */

/**
 * Design element types available in the builder
 */
export type ElementType =
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

/**
 * Style properties for design elements
 */
export interface ElementStyle {
  // Layout
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  display?: 'block' | 'flex' | 'grid' | 'inline-block';
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: string;

  // Typography
  fontSize?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontFamily?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';

  // Colors
  color?: string;
  backgroundColor?: string;
  opacity?: number;

  // Borders & Shadows
  border?: string;
  borderRadius?: string;
  boxShadow?: string;

  // Positioning
  position?: 'static' | 'relative' | 'absolute' | 'fixed';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;

  // Effects
  transition?: string;
  transform?: string;
  filter?: string;

  // Responsive
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  type: 'fade' | 'slideIn' | 'scaleIn' | 'rotateIn' | 'bounceIn' | 'pulse' | 'wiggle' | 'flip' | 'zoom';
  duration: number; // ms
  delay: number; // ms
  easing: 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'linear';
  repeat?: boolean;
  repeatDelay?: number;
}

/**
 * Design element in the canvas
 */
export interface DesignElement {
  id: string;
  type: ElementType;
  label: string;
  content?: string;
  src?: string; // for images
  href?: string; // for links/buttons
  styles: ElementStyle;
  children?: DesignElement[];
  animation?: AnimationConfig;
  responsive?: {
    mobile?: ElementStyle;
    tablet?: ElementStyle;
  };
}

/**
 * Template definition
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'landing' | 'portfolio' | 'services' | 'about' | 'contact';
  preview?: string; // preview image URL
  elements: DesignElement[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

/**
 * Design project state
 */
export interface DesignProject {
  id: string;
  name: string;
  description?: string;
  elements: DesignElement[];
  selectedElementId?: string;
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
  template?: string; // template ID used
}

/**
 * Undo/Redo history entry
 */
export interface HistoryEntry {
  elements: DesignElement[];
  timestamp: number;
}

/**
 * Design builder state
 */
export interface DesignBuilderState {
  project: DesignProject;
  selectedElementId?: string;
  history: HistoryEntry[];
  historyIndex: number;
  isDragging: boolean;
  isResizing: boolean;
  clipboard?: DesignElement;
  zoomLevel: number; // percentage
}

/**
 * Export options
 */
export interface ExportOptions {
  format: 'html' | 'css' | 'jsx' | 'markdown';
  includeAnimations: boolean;
  minify: boolean;
  responsive: boolean;
}

/**
 * Exported design output
 */
export interface DesignExport {
  html: string;
  css: string;
  metadata: {
    name: string;
    createdAt: string;
    template?: string;
  };
}

/**
 * Color palette entry
 */
export interface ColorPalette {
  name: string;
  colors: string[];
  description?: string;
}

/**
 * Font configuration
 */
export interface FontConfig {
  name: string;
  family: string;
  variants: Array<{ weight: number; style: 'normal' | 'italic' }>;
  url?: string;
}

/**
 * Design system tokens
 */
export interface DesignTokens {
  colors: Record<string, string>;
  fonts: Record<string, FontConfig>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  animations: Record<string, AnimationConfig>;
}
