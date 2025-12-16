import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { datasets } from '../../shared/schema';
import { validate } from '../middleware/validate';
import { requireAuth, requireTenantAccess, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { eq, and } from 'drizzle-orm';

const router = Router();

const createDatasetSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  schema: z.any().optional(),
  metadata: z.any().optional(),
});

const updateDatasetSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  schema: z.any().optional(),
  metadata: z.any().optional(),
});

// List datasets for a tenant
router.get('/:tenantId/datasets', requireAuth, requireTenantAccess, requireRole('owner', 'admin', 'member'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const datasetsList = await db.query.datasets.findMany({
      where: eq(datasets.tenantId, req.tenantId!),
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

    res.json({ datasets: datasetsList });
  } catch (error) {
    next(error);
  }
});

// Create dataset
router.post('/:tenantId/datasets', requireAuth, requireTenantAccess, requireRole('owner', 'admin', 'member'), validate(createDatasetSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, description, status, schema, metadata } = req.body;

    const [dataset] = await db.insert(datasets).values({
      tenantId: req.tenantId!,
      name,
      description,
      status: status || 'draft',
      schema,
      metadata,
      createdBy: req.user!.id,
    }).returning();

    res.status(201).json({ dataset });
  } catch (error) {
    next(error);
  }
});

// Get dataset details
router.get('/:tenantId/datasets/:id', requireAuth, requireTenantAccess, requireRole('owner', 'admin', 'member'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const dataset = await db.query.datasets.findFirst({
      where: and(
        eq(datasets.id, req.params.id),
        eq(datasets.tenantId, req.tenantId!)
      ),
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

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    res.json({ dataset });
  } catch (error) {
    next(error);
  }
});

// Update dataset
router.patch('/:tenantId/datasets/:id', requireAuth, requireTenantAccess, requireRole('owner', 'admin', 'member'), validate(updateDatasetSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const updates: any = { ...req.body, updatedAt: new Date() };

    const [dataset] = await db.update(datasets)
      .set(updates)
      .where(and(
        eq(datasets.id, req.params.id),
        eq(datasets.tenantId, req.tenantId!)
      ))
      .returning();

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    res.json({ dataset });
  } catch (error) {
    next(error);
  }
});

// Delete dataset
router.delete('/:tenantId/datasets/:id', requireAuth, requireTenantAccess, requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await db.delete(datasets)
      .where(and(
        eq(datasets.id, req.params.id),
        eq(datasets.tenantId, req.tenantId!)
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    res.json({ message: 'Dataset deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
