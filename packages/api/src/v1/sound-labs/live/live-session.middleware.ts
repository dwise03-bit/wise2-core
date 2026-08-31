import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LiveSessionService } from './live-session.service';

/**
 * Live Session Middleware
 * Intercepts /api/v1/sound-labs/live/* requests
 * Validates JWT, attaches session context to request
 * Rejects if auth fails
 */

@Injectable()
export class LiveSessionMiddleware implements NestMiddleware {
  constructor(private liveSessionService: LiveSessionService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract and validate JWT from Authorization header
      const authHeader = req.headers.authorization;
      const sessionContext = await this.liveSessionService.validateToken(authHeader);

      // Attach session context to request for use in controllers
      (req as any).liveSession = sessionContext;

      next();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unauthorized. Live sessions require valid JWT authentication.';
      res.status(401).json({
        statusCode: 401,
        message,
        error: 'Unauthorized',
      });
    }
  }
}
