import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      tenant_id?: string;
      user_id?: string;
    }
  }
}

type JwtClaims = {
  sub?: string;
  user_id?: string;
  tenant_id?: string;
  tenantId?: string;
};

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    try {
      const token = authHeader.slice('Bearer '.length).trim();
      const decoded = this.jwtService.verify<JwtClaims>(token);

      req.user_id = decoded.sub ?? decoded.user_id;
      req.tenant_id = decoded.tenant_id ?? decoded.tenantId;

      if (!req.user_id && decoded.sub) {
        req.user_id = decoded.sub;
      }
    } catch {
      // Leave the request untouched. Auth guards and tenant guards still own
      // rejection for missing or invalid credentials.
    }

    next();
  }
}
