import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { apiKeys } from '../../shared/schema';
import { validate } from '../middleware/validate';
import { requireAuth, requireTenantAccess, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { generateApiKey } from '../lib/utils';
import { eq, and } from 'drizzle-orm';

const router = Router();

const createApiKeySchema = z.object({
  name: z.string().min(1),
  expiresAt: z.string().datetime().optional(),
});

// List API keys for a tenant
router.get('/:tenantId/api-keys', requireAuth, requireTenantAccess, requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const keys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.tenantId, req.tenantId!),
      with: {
        creator: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Don't expose full API keys, only last 4 characters
    const sanitizedKeys = keys.map(k => ({
      ...k,
      key: `${k.key.substring(0, 8)}...${k.key.slice(-4)}`,
    }));

    res.json({ apiKeys: sanitizedKeys });
  } catch (error) {
    next(error);
  }
});

// Create API key
router.post('/:tenantId/api-keys', requireAuth, requireTenantAccess, requireRole('owner', 'admin'), validate(createApiKeySchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, expiresAt } = req.body;
    const key = generateApiKey();

    const [apiKey] = await db.insert(apiKeys).values({
      tenantId: req.tenantId!,
      name,
      key,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user!.id,
    }).returning();

    // Return full key only on creation
    res.status(201).json({
      apiKey: {
        ...apiKey,
        warning: 'Save this key securely. You will not be able to see it again.',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Revoke API key
router.delete('/:tenantId/api-keys/:id', requireAuth, requireTenantAccess, requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await db.delete(apiKeys)
      .where(and(
        eq(apiKeys.id, req.params.id),
        eq(apiKeys.tenantId, req.tenantId!)
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
