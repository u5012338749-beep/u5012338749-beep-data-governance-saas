import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { jobs, jobRuns } from '../../shared/schema';
import { validate } from '../middleware/validate';
import { requireAuth, requireTenantAccess, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

const createJobSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
  config: z.any().optional(),
  schedule: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateJobSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.string().min(1).optional(),
  config: z.any().optional(),
  schedule: z.string().optional(),
  isActive: z.boolean().optional(),
});

// List jobs for a tenant
router.get('/:tenantId/jobs', requireAuth, requireTenantAccess, requireRole('owner', 'admin', 'member'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const jobsList = await db.query.jobs.findMany({
      where: eq(jobs.tenantId, req.tenantId!),
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

    res.json({ jobs: jobsList });
  } catch (error) {
    next(error);
  }
});

// Create job
router.post('/:tenantId/jobs', requireAuth, requireTenantAccess, requireRole('owner', 'admin'), validate(createJobSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, description, type, config, schedule, isActive } = req.body;

    const [job] = await db.insert(jobs).values({
      tenantId: req.tenantId!,
      name,
      description,
      type,
      config,
      schedule,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user!.id,
    }).returning();

    res.status(201).json({ job });
  } catch (error) {
    next(error);
  }
});

// Get job details
router.get('/:tenantId/jobs/:id', requireAuth, requireTenantAccess, requireRole('owner', 'admin', 'member'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const job = await db.query.jobs.findFirst({
      where: and(
        eq(jobs.id, req.params.id),
        eq(jobs.tenantId, req.tenantId!)
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

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    next(error);
  }
});

// Update job
router.patch('/:tenantId/jobs/:id', requireAuth, requireTenantAccess, requireRole('owner', 'admin'), validate(updateJobSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const updates: any = { ...req.body, updatedAt: new Date() };

    const [job] = await db.update(jobs)
      .set(updates)
      .where(and(
        eq(jobs.id, req.params.id),
        eq(jobs.tenantId, req.tenantId!)
      ))
      .returning();

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    next(error);
  }
});

// Delete job
router.delete('/:tenantId/jobs/:id', requireAuth, requireTenantAccess, requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await db.delete(jobs)
      .where(and(
        eq(jobs.id, req.params.id),
        eq(jobs.tenantId, req.tenantId!)
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Run job
router.post('/:tenantId/jobs/:id/run', requireAuth, requireTenantAccess, requireRole('owner', 'admin', 'member'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const job = await db.query.jobs.findFirst({
      where: and(
        eq(jobs.id, req.params.id),
        eq(jobs.tenantId, req.tenantId!)
      ),
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Create a job run
    const [run] = await db.insert(jobRuns).values({
      jobId: job.id,
      status: 'running',
      startedAt: new Date(),
    }).returning();

    // Simulate job execution (in a real app, this would be async)
    setTimeout(async () => {
      try {
        await db.update(jobRuns)
          .set({
            status: 'completed',
            completedAt: new Date(),
            result: { message: 'Job completed successfully' },
          })
          .where(eq(jobRuns.id, run.id));
      } catch (error) {
        console.error('Error updating job run:', error);
      }
    }, 1000);

    res.json({ run });
  } catch (error) {
    next(error);
  }
});

// Get job runs
router.get('/:tenantId/jobs/:id/runs', requireAuth, requireTenantAccess, requireRole('owner', 'admin', 'member'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const job = await db.query.jobs.findFirst({
      where: and(
        eq(jobs.id, req.params.id),
        eq(jobs.tenantId, req.tenantId!)
      ),
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const runs = await db.query.jobRuns.findMany({
      where: eq(jobRuns.jobId, job.id),
      orderBy: [desc(jobRuns.createdAt)],
    });

    res.json({ runs });
  } catch (error) {
    next(error);
  }
});

export default router;
