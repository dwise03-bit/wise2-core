/**
 * Scene Manager
 * Handles scene CRUD operations, source management, and scene transitions
 *
 * Manages multiple scenes, sources per scene, and transition effects
 */

import { EventEmitter } from 'events';

export interface SceneConfig {
  name: string;
  description?: string;
  order?: number;
}

export interface TransitionEffect {
  type: 'fade' | 'slide' | 'wipe' | 'cut' | 'stingers';
  duration?: number; // milliseconds
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  direction?: 'left' | 'right' | 'up' | 'down';
}

export interface SceneSource {
  id: string;
  sceneId: string;
  name: string;
  type: 'camera' | 'screen' | 'window' | 'image' | 'text' | 'browser' | 'media' | 'custom';
  enabled: boolean;
  visible: boolean;
  locked?: boolean;
  order: number;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  rotation?: number;
  opacity?: number;
  properties?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  name: string;
  description?: string;
  order: number;
  sources: SceneSource[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  transition?: TransitionEffect;
}

/**
 * Scene Manager
 * Manages all scenes and scene operations
 */
export class SceneManager extends EventEmitter {
  private scenes = new Map<string, Scene>();
  private activeSceneId: string | null = null;
  private sourceIdCounter = 0;
  private defaultTransition: TransitionEffect = {
    type: 'fade',
    duration: 300,
    easing: 'easeInOut',
  };

  constructor() {
    super();
  }

  /**
   * Create a new scene
   */
  createScene(config: SceneConfig): Scene {
    const sceneId = `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const scene: Scene = {
      id: sceneId,
      name: config.name,
      description: config.description,
      order: config.order ?? this.scenes.size,
      sources: [],
      isActive: false,
      createdAt: now,
      updatedAt: now,
      transition: this.defaultTransition,
    };

    this.scenes.set(sceneId, scene);
    this.emit('scene:created', scene);

    console.log(`[Scene] Created: ${config.name} (${sceneId})`);
    return scene;
  }

  /**
   * Get scene by ID
   */
  getScene(sceneId: string): Scene | undefined {
    return this.scenes.get(sceneId);
  }

  /**
   * Get scene by name
   */
  getSceneByName(name: string): Scene | undefined {
    for (const scene of this.scenes.values()) {
      if (scene.name === name) {
        return scene;
      }
    }
    return undefined;
  }

  /**
   * Get all scenes
   */
  getScenes(): Scene[] {
    return Array.from(this.scenes.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Update scene
   */
  updateScene(sceneId: string, updates: Partial<SceneConfig>): Scene {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new SceneManagerError('Scene not found', 'SCENE_NOT_FOUND');
    }

    if (updates.name !== undefined) scene.name = updates.name;
    if (updates.description !== undefined) scene.description = updates.description;
    if (updates.order !== undefined) scene.order = updates.order;

    scene.updatedAt = new Date().toISOString();

    this.emit('scene:updated', scene);
    return scene;
  }

  /**
   * Delete scene
   */
  deleteScene(sceneId: string): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new SceneManagerError('Scene not found', 'SCENE_NOT_FOUND');
    }

    // Cannot delete active scene
    if (scene.isActive) {
      throw new SceneManagerError('Cannot delete active scene', 'ACTIVE_SCENE');
    }

    this.scenes.delete(sceneId);
    this.emit('scene:deleted', { id: sceneId, name: scene.name });

    console.log(`[Scene] Deleted: ${scene.name}`);
  }

  /**
   * Switch to a scene
   */
  async switchScene(
    sceneId: string,
    transition?: TransitionEffect
  ): Promise<{ previousScene?: string; currentScene: string }> {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new SceneManagerError('Scene not found', 'SCENE_NOT_FOUND');
    }

    // Validate all sources exist
    for (const source of scene.sources) {
      if (!source.enabled && source.visible) {
        console.warn(`[Scene] Source disabled: ${source.name}`);
      }
    }

    const previousSceneId = this.activeSceneId;

    // Update old scene
    if (previousSceneId) {
      const previousScene = this.scenes.get(previousSceneId);
      if (previousScene) {
        previousScene.isActive = false;
      }
    }

    // Update new scene
    scene.isActive = true;
    this.activeSceneId = sceneId;

    const transitionEffect = transition || scene.transition || this.defaultTransition;

    this.emit('scene:switched', {
      previousSceneId,
      currentSceneId: sceneId,
      transition: transitionEffect,
    });

    // Simulate transition
    if (transitionEffect.duration && transitionEffect.duration > 0) {
      await new Promise(resolve => setTimeout(resolve, transitionEffect.duration));
    }

    console.log(`[Scene] Switched to: ${scene.name}`);

    return {
      previousScene: previousSceneId,
      currentScene: sceneId,
    };
  }

  /**
   * Get active scene
   */
  getActiveScene(): Scene | undefined {
    return this.activeSceneId ? this.scenes.get(this.activeSceneId) : undefined;
  }

  /**
   * Add source to scene
   */
  addSource(
    sceneId: string,
    // sceneId is also omitted here: it comes from the first parameter and is
    // set on the new source below, so callers must not supply it.
    source: Omit<SceneSource, 'id' | 'sceneId' | 'createdAt' | 'updatedAt'>,
  ): SceneSource {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new SceneManagerError('Scene not found', 'SCENE_NOT_FOUND');
    }

    const sourceId = `source_${++this.sourceIdCounter}_${Date.now()}`;
    const now = new Date().toISOString();

    const newSource: SceneSource = {
      ...source,
      id: sourceId,
      sceneId,
      createdAt: now,
      updatedAt: now,
    };

    scene.sources.push(newSource);
    scene.updatedAt = now;

    this.emit('source:added', newSource);
    console.log(`[Source] Added: ${source.name} to scene ${sceneId}`);

    return newSource;
  }

  /**
   * Get source by ID
   */
  getSource(sceneId: string, sourceId: string): SceneSource | undefined {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      return undefined;
    }

    return scene.sources.find(s => s.id === sourceId);
  }

  /**
   * Update source
   */
  updateSource(
    sceneId: string,
    sourceId: string,
    updates: Partial<Omit<SceneSource, 'id' | 'sceneId' | 'createdAt'>>
  ): SceneSource {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new SceneManagerError('Scene not found', 'SCENE_NOT_FOUND');
    }

    const source = scene.sources.find(s => s.id === sourceId);
    if (!source) {
      throw new SceneManagerError('Source not found', 'SOURCE_NOT_FOUND');
    }

    Object.assign(source, updates);
    source.updatedAt = new Date().toISOString();
    scene.updatedAt = source.updatedAt;

    this.emit('source:updated', source);
    return source;
  }

  /**
   * Remove source from scene
   */
  removeSource(sceneId: string, sourceId: string): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new SceneManagerError('Scene not found', 'SCENE_NOT_FOUND');
    }

    const index = scene.sources.findIndex(s => s.id === sourceId);
    if (index === -1) {
      throw new SceneManagerError('Source not found', 'SOURCE_NOT_FOUND');
    }

    const removed = scene.sources.splice(index, 1)[0];
    scene.updatedAt = new Date().toISOString();

    this.emit('source:removed', removed);
  }

  /**
   * Reorder sources in scene
   */
  reorderSources(sceneId: string, sourceIds: string[]): SceneSource[] {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new SceneManagerError('Scene not found', 'SCENE_NOT_FOUND');
    }

    // Validate all source IDs exist
    const sourceMap = new Map(scene.sources.map(s => [s.id, s]));
    for (const sourceId of sourceIds) {
      if (!sourceMap.has(sourceId)) {
        throw new SceneManagerError(`Source not found: ${sourceId}`, 'SOURCE_NOT_FOUND');
      }
    }

    // Reorder
    scene.sources = sourceIds.map(id => sourceMap.get(id)!);

    // Update order property
    scene.sources.forEach((source, index) => {
      source.order = index;
    });

    scene.updatedAt = new Date().toISOString();

    this.emit('sources:reordered', scene.sources);
    return scene.sources;
  }

  /**
   * Set scene transition
   */
  setTransition(sceneId: string, transition: TransitionEffect): Scene {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new SceneManagerError('Scene not found', 'SCENE_NOT_FOUND');
    }

    scene.transition = {
      ...this.defaultTransition,
      ...transition,
    };

    scene.updatedAt = new Date().toISOString();

    this.emit('transition:updated', { sceneId, transition: scene.transition });
    return scene;
  }

  /**
   * Set default transition for all scenes
   */
  setDefaultTransition(transition: TransitionEffect): void {
    this.defaultTransition = {
      ...this.defaultTransition,
      ...transition,
    };

    this.emit('defaultTransition:updated', this.defaultTransition);
  }

  /**
   * Duplicate scene
   */
  duplicateScene(sceneId: string, newName?: string): Scene {
    const source = this.scenes.get(sceneId);
    if (!source) {
      throw new SceneManagerError('Scene not found', 'SCENE_NOT_FOUND');
    }

    const newScene = this.createScene({
      name: newName || `${source.name} (Copy)`,
      description: source.description,
    });

    // Duplicate sources
    for (const sourceItem of source.sources) {
      this.addSource(newScene.id, {
        name: sourceItem.name,
        type: sourceItem.type,
        enabled: sourceItem.enabled,
        visible: sourceItem.visible,
        locked: sourceItem.locked,
        order: sourceItem.order,
        position: sourceItem.position,
        size: sourceItem.size,
        rotation: sourceItem.rotation,
        opacity: sourceItem.opacity,
        properties: sourceItem.properties ? { ...sourceItem.properties } : undefined,
      });
    }

    return newScene;
  }

  /**
   * Export scene data
   */
  exportScene(sceneId: string): string {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new SceneManagerError('Scene not found', 'SCENE_NOT_FOUND');
    }

    return JSON.stringify(scene, null, 2);
  }

  /**
   * Import scene data
   */
  importScene(data: string): Scene {
    try {
      const sceneData = JSON.parse(data);

      // Create new scene with imported data
      const scene = this.createScene({
        name: sceneData.name,
        description: sceneData.description,
      });

      // Import sources
      for (const source of sceneData.sources || []) {
        this.addSource(scene.id, {
          name: source.name,
          type: source.type,
          enabled: source.enabled,
          visible: source.visible,
          locked: source.locked,
          order: source.order,
          position: source.position,
          size: source.size,
          rotation: source.rotation,
          opacity: source.opacity,
          properties: source.properties,
        });
      }

      return scene;
    } catch (error) {
      throw new SceneManagerError(
        `Failed to import scene: ${String(error)}`,
        'IMPORT_FAILED'
      );
    }
  }

  /**
   * Get scene statistics
   */
  getStats() {
    return {
      totalScenes: this.scenes.size,
      activeSceneId: this.activeSceneId,
      totalSources: Array.from(this.scenes.values()).reduce(
        (sum, scene) => sum + scene.sources.length,
        0
      ),
      scenes: this.getScenes().map(scene => ({
        id: scene.id,
        name: scene.name,
        sources: scene.sources.length,
        isActive: scene.isActive,
      })),
    };
  }
}

/**
 * Custom error class for scene manager errors
 */
export class SceneManagerError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'SceneManagerError';
  }
}

/**
 * Scene Manager singleton
 */
let sceneManager: SceneManager | null = null;

/**
 * Initialize scene manager
 */
export function initSceneManager(): SceneManager {
  if (!sceneManager) {
    sceneManager = new SceneManager();
  }
  return sceneManager;
}

/**
 * Get scene manager instance
 */
export function getSceneManager(): SceneManager {
  if (!sceneManager) {
    return initSceneManager();
  }
  return sceneManager;
}
