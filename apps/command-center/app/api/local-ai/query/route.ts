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

// Heuristic to detect query complexity
function getQueryComplexity(query: string): 'simple' | 'complex' {
  // Simple heuristics for now
  const wordCount = query.split(/\s+/).length;
  const hasCode = /```|function|class|import|def |const |let |var |class /i.test(query);
  const has3D = /3d|mesh|rendering|gpu|tensor|cuda|opengl|model|voxel/i.test(query);
  const hasLongContext = query.length > 500;

  // Mark as complex if: code request, 3D request, very long context, or many words
  if (hasCode || has3D || hasLongContext || wordCount > 100) {
    return 'complex';
  }

  return 'simple';
}

// Check if Mac is responsive (simple health check)
async function isMacResponsive(): Promise<boolean> {
  try {
    // Try to reach a local Ollama instance on Mac
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch('http://localhost:11434/api/tags', {
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);
    return response?.ok ?? false;
  } catch {
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
        endpoint: 'http://localhost:11434',
        route: 'mac',
        model: 'ollama-local',
      };
    } else {
      return {
        endpoint: 'http://173.208.147.165:11434',
        route: 'vps',
        model: 'ollama-vps',
      };
    }
  }

  // AUTO routing: decide based on complexity and Mac health
  const complexity = getQueryComplexity(query);
  const macHealthy = await isMacResponsive();

  if (complexity === 'simple' && macHealthy) {
    // Route simple queries to Mac when healthy
    return {
      endpoint: 'http://localhost:11434',
      route: 'mac',
      model: 'ollama-local',
    };
  }

  // Default to VPS for complex queries or when Mac is unresponsive
  return {
    endpoint: 'http://173.208.147.165:11434',
    route: 'vps',
    model: 'ollama-vps',
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
        model: 'neural-chat',
        prompt: query,
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data = await response.json();

    return {
      response: data.response || 'No response generated',
      tokensUsed: data.eval_count,
    };
  } catch (err) {
    throw new Error(
      `Failed to call Ollama at ${endpoint}: ${
        err instanceof Error ? err.message : 'unknown error'
      }`
    );
  }
}

// Main route handler
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RouterRequest;
    const { query, route: preferredRoute } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid query' },
        { status: 400 }
      );
    }

    if (preferredRoute && !['auto', 'mac', 'vps'].includes(preferredRoute)) {
      return NextResponse.json(
        { error: 'Invalid route mode. Must be: auto, mac, or vps' },
        { status: 400 }
      );
    }

    // Determine routing
    const { endpoint, route, model } = await routeQuery(
      query,
      preferredRoute || 'auto'
    );

    // Call the AI endpoint
    const { response, tokensUsed } = await callOllama(endpoint, query);

    const result: RouterResponse = {
      response,
      routeUsed: route,
      endpoint,
      model,
      tokensUsed,
    };

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Local AI Router error:', message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
