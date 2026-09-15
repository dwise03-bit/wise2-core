/**
 * WISE² Intelligent Router
 * Analyzes queries and routes to optimal GPU/model
 */

interface RouteDecision {
  gpu: 'local' | 'vps';
  model: string;
  reason: string;
  estimatedTime: number; // seconds
  context?: number; // tokens
}

export class WISERouter {
  private readonly THRESHOLD_SHORT = 100; // chars
  private readonly THRESHOLD_LONG = 1000;

  route(prompt: string, priority?: 'speed' | 'quality' | 'cost'): RouteDecision {
    const len = prompt.length;
    const hasCode = /def |function |const |let |var |=>|{|}|\[|\]/.test(prompt);
    const has3D = /design|model|shape|geometry|render|cube|sphere|dimension/.test(prompt.toLowerCase());
    const hasImage = /image|photo|screenshot|visual|diagram|chart/.test(prompt.toLowerCase());
    const isComplex = /explain|analyze|reason|theory|philosophy|architecture|algorithm/.test(prompt.toLowerCase());

    // Image → Force M4 (multimodal)
    if (hasImage) {
      return {
        gpu: 'local',
        model: 'wise2-vision-m4',
        reason: 'Image analysis requires M4 multimodal',
        estimatedTime: 120,
        context: 16000,
      };
    }

    // 3D → Force M4
    if (has3D) {
      return {
        gpu: 'local',
        model: 'wise2-3d-ultra',
        reason: '3D/CAD requires specialized model',
        estimatedTime: 90,
        context: 8000,
      };
    }

    // Code → M4 (24K context)
    if (hasCode) {
      return {
        gpu: 'local',
        model: 'wise2-coder-m4',
        reason: 'Code generation uses 24K context model',
        estimatedTime: 60,
        context: 24000,
      };
    }

    // Priority: speed
    if (priority === 'speed') {
      if (len < this.THRESHOLD_SHORT) {
        return {
          gpu: 'vps',
          model: 'qwen3.5:4b',
          reason: 'Ultra-fast model for speed priority',
          estimatedTime: 5,
          context: 8000,
        };
      }
      return {
        gpu: 'vps',
        model: 'mistral:latest',
        reason: 'VPS GPU for speed',
        estimatedTime: 15,
        context: 16000,
      };
    }

    // Priority: quality
    if (priority === 'quality') {
      if (isComplex && len > this.THRESHOLD_LONG) {
        return {
          gpu: 'local',
          model: 'gemma4:12b-mlx',
          reason: 'Heavy reasoning model for complex queries',
          estimatedTime: 120,
          context: 12000,
        };
      }
      return {
        gpu: 'local',
        model: 'wise2-m4',
        reason: 'M4 for best quality',
        estimatedTime: 90,
        context: 16000,
      };
    }

    // Auto-routing (balanced)
    if (len < this.THRESHOLD_SHORT) {
      return {
        gpu: 'vps',
        model: 'mistral:latest',
        reason: `Short query (${len} chars) → VPS speed`,
        estimatedTime: 10,
        context: 16000,
      };
    }

    if (len < this.THRESHOLD_LONG) {
      if (isComplex) {
        return {
          gpu: 'local',
          model: 'wise2-m4',
          reason: `Medium + complex → M4 quality`,
          estimatedTime: 90,
          context: 16000,
        };
      }
      return {
        gpu: 'vps',
        model: 'mistral:latest',
        reason: `Medium query → VPS (good balance)`,
        estimatedTime: 20,
        context: 16000,
      };
    }

    // Long query
    return {
      gpu: 'local',
      model: 'wise2-m4',
      reason: `Long query (${len} chars) → M4 quality`,
      estimatedTime: 120,
      context: 16000,
    };
  }

  estimateCost(decision: RouteDecision): { api: number; hardware: number; total: number } {
    // All hardware is local/VPS — zero API cost
    // Hardware cost is already paid (electricity included in VPS fee)
    return {
      api: 0,
      hardware: 0,
      total: 0,
    };
  }
}
