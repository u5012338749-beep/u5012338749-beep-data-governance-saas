import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { tenantMembers } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  tenantId?: string;
  userRole?: 'owner' | 'admin' | 'member';
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export function requireTenantAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const tenantId = req.params.tenantId;
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  // Store tenantId in request for later use
  req.tenantId = tenantId;
  next();
}

export function requireRole(...roles: ('owner' | 'admin' | 'member')[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const membership = await db.query.tenantMembers.findFirst({
        where: and(
          eq(tenantMembers.tenantId, req.tenantId),
          eq(tenantMembers.userId, req.user.id)
        ),
      });

      if (!membership) {
        return res.status(403).json({ error: 'Access denied to this workspace' });
      }

      if (!roles.includes(membership.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Store user role in request
      req.userRole = membership.role;
      next();
    } catch (error) {
      next(error);
    }
  };
}
