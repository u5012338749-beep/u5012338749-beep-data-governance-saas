import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { tenants, tenantMembers } from '../../shared/schema';
import { validate } from '../middleware/validate';
import { requireAuth, requireTenantAccess, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { generateSlug } from '../lib/utils';
import { eq, and } from 'drizzle-orm';

const router = Router();

const createTenantSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

// List user's tenants
router.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userTenants = await db.query.tenantMembers.findMany({
      where: eq(tenantMembers.userId, req.user!.id),
      with: {
        tenant: true,
      },
    });

    res.json({
      tenants: userTenants.map(tm => ({
        ...tm.tenant,
        role: tm.role,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Create tenant
router.post('/', requireAuth, validate(createTenantSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = generateSlug(name);

    const [tenant] = await db.insert(tenants).values({
      name,
      slug,
      description,
    }).returning();

    // Add user as owner
    await db.insert(tenantMembers).values({
      tenantId: tenant.id,
      userId: req.user!.id,
      role: 'owner',
    });

    res.status(201).json({ tenant });
  } catch (error) {
    next(error);
  }
});

// Get tenant details
router.get('/:tenantId', requireAuth, requireTenantAccess, requireRole('owner', 'admin', 'member'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, req.tenantId!),
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({ tenant });
  } catch (error) {
    next(error);
  }
});

// Update tenant
router.patch('/:tenantId', requireAuth, requireTenantAccess, requireRole('owner', 'admin'), validate(updateTenantSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const updates: any = {};
    
    if (req.body.name) {
      updates.name = req.body.name;
      updates.slug = generateSlug(req.body.name);
    }
    
    if (req.body.description !== undefined) {
      updates.description = req.body.description;
    }

    updates.updatedAt = new Date();

    const [tenant] = await db.update(tenants)
      .set(updates)
      .where(eq(tenants.id, req.tenantId!))
      .returning();

    res.json({ tenant });
  } catch (error) {
    next(error);
  }
});

// Delete tenant
router.delete('/:tenantId', requireAuth, requireTenantAccess, requireRole('owner'), async (req: AuthenticatedRequest, res, next) => {
  try {
    await db.delete(tenants).where(eq(tenants.id, req.tenantId!));
    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
