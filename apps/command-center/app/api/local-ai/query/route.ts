/**
 * WISE² Local AI Command Router
 *
 * Routes AI workloads between:
 * - Mac local AI (Ollama)
 * - GPU-NMLS remote server
 * - AUTO routing based on query complexity
 */

import { NextRequest, NextResponse } from 'next/server';

type RouteMode = 'auto' | 'mac' | 'vps';

interface RouterRequest {
  query: string;
  route: RouteMode;
}

interface RouterResponse {
  response: string;
  routeUsed: RouteMode;
  endpoint: string;
  model: string;
  tokensUsed?: number;
}

// Configuration from environment or defaults
const MAC_ENDPOINT = process.env.LOCAL_AI_MAC_ENDPOINT || 'http://localhost:11434';
const VPS_ENDPOINT = process.env.LOCAL_AI_VPS_ENDPOINT || 'http://173.208.147.165:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'wise2-fast-m4';
const QUERY_TIMEOUT_MS = parseInt(process.env.QUERY_TIMEOUT_MS || '60000', 10);
const MAC_HEALTH_TIMEOUT_MS = 1500;

// Cache Mac health status with TTL
let macHealthCache: { healthy: boolean; timestamp: number } | null = null;
const MAC_HEALTH_CACHE_TTL = 5000; // 5 seconds

// Compiled regex patterns (compile once, reuse many times)
const COMPLEXITY_PATTERNS = {
  code: /```|function|class|import|def |const |let |var /i,
  gpu: /\b(3d|mesh|render|gpu|tensor|cuda|opengl|voxel|model|ml|neural|llm|llama)\b/i,
};

// Detect query complexity using optimized patterns
function getQueryComplexity(query: string): 'simple' | 'complex' {
  const wordCount = query.split(/\s+/).length;
  const length = query.length;

  // Quick checks for obviously complex queries
  if (length > 500 || wordCount > 100) return 'complex';
  if (COMPLEXITY_PATTERNS.code.test(query)) return 'complex';
  if (COMPLEXITY_PATTERNS.gpu.test(query)) return 'complex';

  return 'simple';
}

// Check if Mac is responsive with caching
async function isMacResponsive(): Promise<boolean> {
  const now = Date.now();

  // Return cached result if still valid
  if (macHealthCache && now - macHealthCache.timestamp < MAC_HEALTH_CACHE_TTL) {
    return macHealthCache.healthy;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAC_HEALTH_TIMEOUT_MS);

    const response = await fetch(`${MAC_ENDPOINT}/api/tags`, {
      signal: controller.signal,
      method: 'GET',
    });

    clearTimeout(timeoutId);
    const healthy = response.ok;

    // Cache the result
    macHealthCache = { healthy, timestamp: now };
    return healthy;
  } catch {
    // Cache negative result
    macHealthCache = { healthy: false, timestamp: now };
    return false;
  }
}

// Route the query to the appropriate endpoint
async function routeQuery(query: string, preferredRoute: RouteMode): Promise<{
  endpoint: string;
  route: RouteMode;
  model: string;
}> {
  if (preferredRoute !== 'auto') {
    // Use explicit route
    if (preferredRoute === 'mac') {
      return {
        endpoint: MAC_ENDPOINT,
        route: 'mac',
        model: OLLAMA_MODEL,
      };
    } else {
      return {
        endpoint: VPS_ENDPOINT,
        route: 'vps',
        model: OLLAMA_MODEL,
      };
    }
  }

  // AUTO routing: decide based on complexity and Mac health
  const complexity = getQueryComplexity(query);
  const macHealthy = await isMacResponsive();

  if (complexity === 'simple' && macHealthy) {
    // Route simple queries to Mac when healthy
    return {
      endpoint: MAC_ENDPOINT,
      route: 'mac',
      model: OLLAMA_MODEL,
    };
  }

  // Default to VPS for complex queries or when Mac is unresponsive
  return {
    endpoint: VPS_ENDPOINT,
    route: 'vps',
    model: OLLAMA_MODEL,
  };
}

// Call the Ollama API
async function callOllama(endpoint: string, query: string): Promise<{
  response: string;
  tokensUsed?: number;
}> {
  try {
    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: query,
        stream: false,
      }),
      signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
    });

    if (!response.ok) {
      // Provide better error messages for common HTTP status codes
      let errorMsg = `HTTP ${response.status}`;
      if (response.status === 404) {
        errorMsg = `Model "${OLLAMA_MODEL}" not found on Ollama. Please install it first.`;
      } else if (response.status === 503) {
        errorMsg = 'Ollama service is unavailable. Please check if it\'s running.';
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();

    // Validate response structure
    if (typeof data.response !== 'string') {
      throw new Error('Invalid response format from Ollama');
    }

    return {
      response: data.response,
      tokensUsed: typeof data.eval_count === 'number' ? data.eval_count : undefined,
    };
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Network error connecting to ${endpoint}. Is Ollama running?`);
    }
    throw err;
  }
}

// Main route handler
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { query, route: preferredRoute } = body as RouterRequest;

    // Validate query
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query must be a string' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    if (trimmedQuery.length > 10000) {
      return NextResponse.json(
        { error: 'Query exceeds maximum length of 10000 characters' },
        { status: 413 }
      );
    }

    // Validate route mode
    if (preferredRoute && !['auto', 'mac', 'vps'].includes(preferredRoute as string)) {
      return NextResponse.json(
        { error: 'Invalid route mode. Must be: auto, mac, or vps' },
        { status: 400 }
      );
    }

    // Determine routing
    const { endpoint, route, model } = await routeQuery(
      trimmedQuery,
      preferredRoute || 'auto'
    );

    // Call the AI endpoint
    const { response, tokensUsed } = await callOllama(endpoint, trimmedQuery);

    const duration = Date.now() - startTime;

    const result: RouterResponse = {
      response,
      routeUsed: route,
      endpoint,
      model,
      tokensUsed,
    };

    // Log successful query
    console.info(`[LocalAI] Query routed to ${route} (${duration}ms)`, {
      routeUsed: route,
      endpoint,
      model,
      tokensUsed,
      duration,
      queryLength: trimmedQuery.length,
    });

    return NextResponse.json(result);
  } catch (err) {
    const duration = Date.now() - startTime;
    const message = err instanceof Error ? err.message : 'Unknown error';

    console.error(`[LocalAI] Error (${duration}ms): ${message}`, {
      error: message,
      duration,
      stack: err instanceof Error ? err.stack : undefined,
    });

    // Determine appropriate HTTP status code
    if (message.includes('Network error')) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    if (message.includes('Ollama')) {
      return NextResponse.json({ error: message }, { status: 502 });
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
