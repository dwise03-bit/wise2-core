'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  DesignElement,
  DesignProject,
  HistoryEntry,
  DesignBuilderState,
  ElementType,
  ElementStyle,
  AnimationConfig,
  Template,
} from '../types/web-design';

/**
 * Web Design Builder Store
 * Manages all state for the design builder including undo/redo, drag/drop, styling
 */
interface WebDesignStore extends DesignBuilderState {
  // Project management
  createProject: (name: string, templateId?: string) => void;
  updateProjectName: (name: string) => void;
  updateProjectColors: (colors: DesignProject['colors']) => void;
  updateProjectFonts: (fonts: DesignProject['fonts']) => void;

  // Element management
  addElement: (element: DesignElement, parentId?: string) => void;
  removeElement: (elementId: string) => void;
  updateElement: (elementId: string, updates: Partial<DesignElement>) => void;
  selectElement: (elementId: string | undefined) => void;
  duplicateElement: (elementId: string) => void;
  moveElement: (elementId: string, newIndex: number, parentId?: string) => void;

  // Styling
  updateElementStyle: (elementId: string, style: Partial<ElementStyle>) => void;
  updateElementAnimation: (elementId: string, animation: AnimationConfig | undefined) => void;
  updateResponsiveStyle: (elementId: string, breakpoint: 'mobile' | 'tablet', style: Partial<ElementStyle>) => void;

  // History & Undo/Redo
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  pushHistory: () => void;

  // Clipboard
  copyElement: (elementId: string) => void;
  pasteElement: (parentId?: string) => void;
  cutElement: (elementId: string) => void;

  // Canvas interactions
  setDragging: (isDragging: boolean) => void;
  setResizing: (isResizing: boolean) => void;
  setZoomLevel: (zoom: number) => void;

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: (projectId: string) => boolean;
  exportAsHTML: () => string;
  exportAsCSS: () => string;

  // Utilities
  getAllElements: () => DesignElement[];
  getElementById: (elementId: string) => DesignElement | undefined;
  resetProject: () => void;
}

const initialProject: DesignProject = {
  id: Math.random().toString(36).substr(2, 9),
  name: 'Untitled Design',
  elements: [],
  colors: {
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#dbeafe',
    background: '#ffffff',
    text: '#1f2937',
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const initialState: DesignBuilderState = {
  project: initialProject,
  selectedElementId: undefined,
  history: [{ elements: [], timestamp: Date.now() }],
  historyIndex: 0,
  isDragging: false,
  isResizing: false,
  clipboard: undefined,
  zoomLevel: 100,
};

const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Helper: find element by ID in tree
 */
const findElement = (elements: DesignElement[], id: string): DesignElement | undefined => {
  for (const element of elements) {
    if (element.id === id) return element;
    if (element.children) {
      const found = findElement(element.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * Helper: update element in tree
 */
const updateElementInTree = (
  elements: DesignElement[],
  id: string,
  updates: Partial<DesignElement>
): DesignElement[] => {
  return elements.map((element) => {
    if (element.id === id) {
      return { ...element, ...updates };
    }
    if (element.children) {
      return {
        ...element,
        children: updateElementInTree(element.children, id, updates),
      };
    }
    return element;
  });
};

/**
 * Helper: remove element from tree
 */
const removeElementFromTree = (elements: DesignElement[], id: string): DesignElement[] => {
  return elements
    .filter((element) => element.id !== id)
    .map((element) => ({
      ...element,
      children: element.children ? removeElementFromTree(element.children, id) : undefined,
    }));
};

/**
 * Helper: flatten all elements for easier traversal
 */
const flattenElements = (elements: DesignElement[]): DesignElement[] => {
  const result: DesignElement[] = [];
  const traverse = (items: DesignElement[]) => {
    items.forEach((item) => {
      result.push(item);
      if (item.children) traverse(item.children);
    });
  };
  traverse(elements);
  return result;
};

export const useWebDesignBuilder = create<WebDesignStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Project Management
        createProject: (name: string, templateId?: string) => {
          const newProject: DesignProject = {
            ...initialProject,
            id: generateId(),
            name,
            template: templateId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set(
            {
              project: newProject,
              selectedElementId: undefined,
              history: [{ elements: [], timestamp: Date.now() }],
              historyIndex: 0,
            },
            false,
            'createProject'
          );
        },

        updateProjectName: (name: string) => {
          set(
            (state) => ({
              project: {
                ...state.project,
                name,
                updatedAt: new Date(),
              },
            }),
            false,
            'updateProjectName'
          );
        },

        updateProjectColors: (colors) => {
          set(
            (state) => ({
              project: {
                ...state.project,
                colors,
                updatedAt: new Date(),
              },
            }),
            false,
            'updateProjectColors'
          );
        },

        updateProjectFonts: (fonts) => {
          set(
            (state) => ({
              project: {
                ...state.project,
                fonts,
                updatedAt: new Date(),
              },
            }),
            false,
            'updateProjectFonts'
          );
        },

        // Element Management
        addElement: (element: DesignElement, parentId?: string) => {
          set(
            (state) => {
              const newElement = { ...element, id: generateId() };
              let newElements = [...state.project.elements];

              if (parentId) {
                newElements = updateElementInTree(newElements, parentId, {
                  children: [
                    ...(findElement(newElements, parentId)?.children || []),
                    newElement,
                  ],
                });
              } else {
                newElements.push(newElement);
              }

              return {
                project: {
                  ...state.project,
                  elements: newElements,
                  updatedAt: new Date(),
                },
                selectedElementId: newElement.id,
              };
            },
            false,
            'addElement'
          );
          get().pushHistory();
        },

        removeElement: (elementId: string) => {
          set(
            (state) => ({
              project: {
                ...state.project,
                elements: removeElementFromTree(state.project.elements, elementId),
                updatedAt: new Date(),
              },
              selectedElementId:
                state.selectedElementId === elementId ? undefined : state.selectedElementId,
            }),
            false,
            'removeElement'
          );
          get().pushHistory();
        },

        updateElement: (elementId: string, updates: Partial<DesignElement>) => {
          set(
            (state) => ({
              project: {
                ...state.project,
                elements: updateElementInTree(state.project.elements, elementId, updates),
                updatedAt: new Date(),
              },
            }),
            false,
            'updateElement'
          );
          get().pushHistory();
        },

        selectElement: (elementId: string | undefined) => {
          set({ selectedElementId: elementId }, false, 'selectElement');
        },

        duplicateElement: (elementId: string) => {
          const element = get().getElementById(elementId);
          if (!element) return;

          const newElement: DesignElement = {
            ...element,
            id: generateId(),
            label: `${element.label} (copy)`,
          };

          get().addElement(newElement);
        },

        moveElement: (elementId: string, newIndex: number, parentId?: string) => {
          set(
            (state) => {
              const elements = [...state.project.elements];
              const element = findElement(elements, elementId);
              if (!element) return state;

              // Remove from current location
              let updated = removeElementFromTree(elements, elementId);

              // Add to new location
              if (parentId) {
                const parent = findElement(updated, parentId);
                if (parent) {
                  const children = parent.children || [];
                  children.splice(newIndex, 0, element);
                  updated = updateElementInTree(updated, parentId, { children });
                }
              } else {
                updated.splice(newIndex, 0, element);
              }

              return {
                project: {
                  ...state.project,
                  elements: updated,
                  updatedAt: new Date(),
                },
              };
            },
            false,
            'moveElement'
          );
          get().pushHistory();
        },

        // Styling
        updateElementStyle: (elementId: string, style: Partial<ElementStyle>) => {
          set(
            (state) => {
              const element = get().getElementById(elementId);
              if (!element) return state;

              return {
                project: {
                  ...state.project,
                  elements: updateElementInTree(state.project.elements, elementId, {
                    styles: { ...element.styles, ...style },
                  }),
                  updatedAt: new Date(),
                },
              };
            },
            false,
            'updateElementStyle'
          );
          get().pushHistory();
        },

        updateElementAnimation: (elementId: string, animation: AnimationConfig | undefined) => {
          set(
            (state) => ({
              project: {
                ...state.project,
                elements: updateElementInTree(state.project.elements, elementId, { animation }),
                updatedAt: new Date(),
              },
            }),
            false,
            'updateElementAnimation'
          );
          get().pushHistory();
        },

        updateResponsiveStyle: (
          elementId: string,
          breakpoint: 'mobile' | 'tablet',
          style: Partial<ElementStyle>
        ) => {
          set(
            (state) => {
              const element = get().getElementById(elementId);
              if (!element) return state;

              return {
                project: {
                  ...state.project,
                  elements: updateElementInTree(state.project.elements, elementId, {
                    responsive: {
                      ...element.responsive,
                      [breakpoint]: {
                        ...(element.responsive?.[breakpoint] || {}),
                        ...style,
                      },
                    },
                  }),
                  updatedAt: new Date(),
                },
              };
            },
            false,
            'updateResponsiveStyle'
          );
          get().pushHistory();
        },

        // History
        undo: () => {
          set((state) => {
            if (state.historyIndex === 0) return state;
            const newIndex = state.historyIndex - 1;
            return {
              project: {
                ...state.project,
                elements: state.history[newIndex].elements,
              },
              historyIndex: newIndex,
            };
          }, false, 'undo');
        },

        redo: () => {
          set((state) => {
            if (state.historyIndex >= state.history.length - 1) return state;
            const newIndex = state.historyIndex + 1;
            return {
              project: {
                ...state.project,
                elements: state.history[newIndex].elements,
              },
              historyIndex: newIndex,
            };
          }, false, 'redo');
        },

        clearHistory: () => {
          set((state) => ({
            history: [{ elements: state.project.elements, timestamp: Date.now() }],
            historyIndex: 0,
          }), false, 'clearHistory');
        },

        pushHistory: () => {
          set((state) => {
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push({
              elements: JSON.parse(JSON.stringify(state.project.elements)),
              timestamp: Date.now(),
            });

            // Keep only last 50 history entries
            if (newHistory.length > 50) {
              newHistory.shift();
            }

            return {
              history: newHistory,
              historyIndex: newHistory.length - 1,
            };
          }, false, 'pushHistory');
        },

        // Clipboard
        copyElement: (elementId: string) => {
          const element = get().getElementById(elementId);
          if (element) {
            set({ clipboard: JSON.parse(JSON.stringify(element)) }, false, 'copyElement');
          }
        },

        pasteElement: (parentId?: string) => {
          const { clipboard } = get();
          if (!clipboard) return;

          const newElement: DesignElement = {
            ...clipboard,
            id: generateId(),
            label: `${clipboard.label} (pasted)`,
          };

          get().addElement(newElement, parentId);
        },

        cutElement: (elementId: string) => {
          get().copyElement(elementId);
          get().removeElement(elementId);
        },

        // Canvas Interactions
        setDragging: (isDragging: boolean) => {
          set({ isDragging }, false, 'setDragging');
        },

        setResizing: (isResizing: boolean) => {
          set({ isResizing }, false, 'setResizing');
        },

        setZoomLevel: (zoom: number) => {
          const clamped = Math.max(50, Math.min(200, zoom));
          set({ zoomLevel: clamped }, false, 'setZoomLevel');
        },

        // Persistence
        saveToLocalStorage: () => {
          const state = get();
          localStorage.setItem(
            `web-design-project-${state.project.id}`,
            JSON.stringify({
              project: state.project,
              history: state.history,
            })
          );
        },

        loadFromLocalStorage: (projectId: string) => {
          const saved = localStorage.getItem(`web-design-project-${projectId}`);
          if (!saved) return false;

          try {
            const { project, history } = JSON.parse(saved);
            set(
              {
                project,
                history,
                historyIndex: history.length - 1,
              },
              false,
              'loadFromLocalStorage'
            );
            return true;
          } catch (error) {
            console.error('Failed to load project:', error);
            return false;
          }
        },

        exportAsHTML: () => {
          const { project } = get();
          const elementHTML = (element: DesignElement): string => {
            const tag = element.type === 'heading' ? 'h1' : element.type;
            const content = element.content || '';
            const childrenHTML = element.children?.map(elementHTML).join('') || '';

            return `<${tag}>${content}${childrenHTML}</${tag}>`;
          };

          const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  ${project.elements.map(elementHTML).join('\n  ')}
</body>
</html>`;

          return html;
        },

        exportAsCSS: () => {
          const { project } = get();
          const css = `/* Generated by WISE² Web Design Builder */
:root {
  --color-primary: ${project.colors.primary};
  --color-secondary: ${project.colors.secondary};
  --color-accent: ${project.colors.accent};
  --color-background: ${project.colors.background};
  --color-text: ${project.colors.text};
  --font-heading: ${project.fonts.heading};
  --font-body: ${project.fonts.body};
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  background-color: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}
`;

          return css;
        },

        // Utilities
        getAllElements: () => {
          return flattenElements(get().project.elements);
        },

        getElementById: (elementId: string) => {
          return findElement(get().project.elements, elementId);
        },

        resetProject: () => {
          set(initialState, false, 'resetProject');
        },
      }),
      {
        name: 'web-design-builder',
        version: 1,
      }
    )
  )
);
