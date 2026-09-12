/**
 * Request validation middleware
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AIRequest } from '../types/request';

// Zod schemas for validation
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
});

const AIRequestSchema = z.object({
  project_id: z.string().min(1),
  agent_id: z.string().min(1),
  user_id: z.string().min(1),
  task_type: z.string(),
  messages: z.array(MessageSchema).min(1),

  capabilities_required: z.array(z.string()).optional(),
  context_refs: z.object({}).optional(),
  max_tokens: z.number().positive().optional(),
  max_cost: z.number().nonnegative().optional(),

  route_mode: z.enum(['AUTO', 'LOCAL', 'CLOUD']).default('AUTO'),
  privacy_class: z.enum(['public', 'internal', 'confidential']).default('internal'),
  priority: z.enum(['critical', 'high', 'normal', 'low']).default('normal'),

  metadata: z.record(z.any()).optional(),
  request_id: z.string().optional(),
});

/**
 * Validate request body
 */
export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  try {
    const parsed = AIRequestSchema.parse(req.body);
    req.body = parsed as AIRequest;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Request validation failed',
          details: error.errors,
        },
      });
      return;
    }
    next(error);
  }
}

/**
 * Validate API key
 */
export function validateApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];

  if (!apiKey) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing API key',
      },
    });
    return;
  }

  // For MVP, just check it's not empty
  // Real implementation would validate against stored keys
  if (typeof apiKey === 'string' && apiKey.startsWith('sk-')) {
    next();
  } else {
    res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid API key',
      },
    });
  }
}
