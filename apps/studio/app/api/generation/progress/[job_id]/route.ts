/**
 * GET /api/generation/progress/[job_id]
 * Server-Sent Events (SSE) stream for generation progress updates
 *
 * Returns streaming updates with:
 * - event: 'progress' | 'completed' | 'failed' | 'error'
 * - data: JSON with progress%, ETA, status updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { TextEncoder } from 'util';
import {
  requireAuth,
  extractUserFromToken,
  ApiException,
  corsHeaders,
} from '@/lib/api-middleware';
import { generationDb } from '@/lib/generation-db';

/**
 * Stream generation progress via SSE
 * Requires authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params?: Record<string, string> }
): Promise<NextResponse> {
  try {
    // Extract and validate user
    const user = extractUserFromToken(request);
    if (!user) {
      return new NextResponse(
        JSON.stringify({
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        }),
        { status: 401, headers: corsHeaders() }
      );
    }

    const jobId = params?.job_id;
    if (!jobId) {
      return new NextResponse(
        JSON.stringify({
          error: 'INVALID_REQUEST',
          message: 'Missing job_id parameter',
        }),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Verify generation exists and belongs to user
    const generation = generationDb.getById(jobId);
    if (!generation) {
      return new NextResponse(
        JSON.stringify({
          error: 'NOT_FOUND',
          message: 'Generation not found',
        }),
        { status: 404, headers: corsHeaders() }
      );
    }

    if (generation.userId !== user.id) {
      return new NextResponse(
        JSON.stringify({
          error: 'FORBIDDEN',
          message: 'Access denied',
        }),
        { status: 403, headers: corsHeaders() }
      );
    }

    // Return SSE stream
    return new NextResponse(createProgressStream(jobId, request), {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error('Error in progress endpoint:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      }),
      { status: 500, headers: corsHeaders() }
    );
  }
}

/**
 * Create SSE stream for progress updates
 */
function createProgressStream(jobId: string, request: NextRequest): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      // Send initial status
      const initial = generationDb.getById(jobId);
      if (initial) {
        sendEvent(controller, encoder, 'progress', {
          jobId,
          status: initial.status,
          progress: initial.progress || 0,
          estimatedTime: getEstimatedTime(initial),
        });
      }

      // Poll for updates
      const intervalId = setInterval(() => {
        if (closed) {
          clearInterval(intervalId);
          controller.close();
          return;
        }

        const generation = generationDb.getById(jobId);
        if (!generation) {
          sendEvent(controller, encoder, 'error', {
            error: 'Generation not found',
          });
          closed = true;
          clearInterval(intervalId);
          controller.close();
          return;
        }

        if (generation.status === 'completed') {
          sendEvent(controller, encoder, 'completed', {
            jobId,
            status: 'completed',
            audioUrl: generation.audioUrl,
            metadata: generation.metadata,
          });
          closed = true;
          clearInterval(intervalId);
          controller.close();
        } else if (generation.status === 'failed') {
          sendEvent(controller, encoder, 'failed', {
            jobId,
            status: 'failed',
            error: generation.error,
          });
          closed = true;
          clearInterval(intervalId);
          controller.close();
        } else {
          // Send progress update
          sendEvent(controller, encoder, 'progress', {
            jobId,
            status: generation.status,
            progress: generation.progress || 0,
            estimatedTime: getEstimatedTime(generation),
          });
        }
      }, 1000); // Poll every second

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(intervalId);
      });
    },
  });
}

/**
 * Send SSE event
 */
function sendEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  eventType: string,
  data: any
) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(encoder.encode(message));
}

/**
 * Get estimated time remaining
 */
function getEstimatedTime(generation: any): number {
  if (generation.status === 'completed' || generation.status === 'failed') {
    return 0;
  }

  if (generation.status === 'queued') {
    // Estimate based on queue and average time
    return Math.ceil((generation.duration || 30) * 0.3 + 5);
  }

  if (generation.status === 'generating') {
    // Estimate based on progress
    const avgTime = Math.ceil((generation.duration || 30) * 0.3);
    const progress = generation.progress || 0;
    if (progress === 0) return avgTime;
    return Math.ceil((avgTime * (100 - progress)) / progress);
  }

  return 0;
}

/**
 * Handle preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
