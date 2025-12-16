import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { tenantMembers, users, invitations } from '../../shared/schema';
import { validate } from '../middleware/validate';
import { requireAuth, requireTenantAccess, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';

const router = Router();

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member']),
});

// List tenant members
router.get('/:tenantId/members', requireAuth, requireTenantAccess, requireRole('owner', 'admin', 'member'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const members = await db.query.tenantMembers.findMany({
      where: eq(tenantMembers.tenantId, req.tenantId!),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    res.json({
      members: members.map(m => ({
        id: m.id,
        role: m.role,
        user: m.user,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Invite member
router.post('/:tenantId/members/invite', requireAuth, requireTenantAccess, requireRole('owner', 'admin'), validate(inviteMemberSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { email, role } = req.body;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      // Check if already a member
      const existingMember = await db.query.tenantMembers.findFirst({
        where: and(
          eq(tenantMembers.tenantId, req.tenantId!),
          eq(tenantMembers.userId, existingUser.id)
        ),
      });

      if (existingMember) {
        return res.status(409).json({ error: 'User is already a member' });
      }

      // Add user as member
      await db.insert(tenantMembers).values({
        tenantId: req.tenantId!,
        userId: existingUser.id,
        role,
      });

      return res.json({ message: 'User added to workspace' });
    }

    // Create invitation
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await db.insert(invitations).values({
      tenantId: req.tenantId!,
      email: email.toLowerCase(),
      role,
      token,
      expiresAt,
      invitedBy: req.user!.id,
    });

    res.json({ message: 'Invitation sent', token });
  } catch (error) {
    next(error);
  }
});

// Remove member
router.delete('/:tenantId/members/:userId', requireAuth, requireTenantAccess, requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { userId } = req.params;

    // Don't allow removing owner
    const member = await db.query.tenantMembers.findFirst({
      where: and(
        eq(tenantMembers.tenantId, req.tenantId!),
        eq(tenantMembers.userId, userId)
      ),
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (member.role === 'owner') {
      return res.status(403).json({ error: 'Cannot remove owner' });
    }

    await db.delete(tenantMembers)
      .where(and(
        eq(tenantMembers.tenantId, req.tenantId!),
        eq(tenantMembers.userId, userId)
      ));

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
});

// Update member role
router.patch('/:tenantId/members/:userId/role', requireAuth, requireTenantAccess, requireRole('owner'), validate(updateRoleSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const [member] = await db.update(tenantMembers)
      .set({ role, updatedAt: new Date() })
      .where(and(
        eq(tenantMembers.tenantId, req.tenantId!),
        eq(tenantMembers.userId, userId)
      ))
      .returning();

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ member });
  } catch (error) {
    next(error);
  }
});

export default router;
