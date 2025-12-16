import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { users, tenants, tenantMembers } from '../../shared/schema';
import { validate } from '../middleware/validate';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import passport from '../config/passport';
import { generateSlug } from '../lib/utils';
import { eq } from 'drizzle-orm';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  workspaceName: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name, workspaceName } = req.body;

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || email.split('@')[0],
    }).returning();

    // Create default workspace if workspaceName provided
    if (workspaceName) {
      const slug = generateSlug(workspaceName);
      const [tenant] = await db.insert(tenants).values({
        name: workspaceName,
        slug,
      }).returning();

      // Add user as owner
      await db.insert(tenantMembers).values({
        tenantId: tenant.id,
        userId: newUser.id,
        role: 'owner',
      });
    }

    // Auto login after registration
    req.login({ id: newUser.id, email: newUser.email, name: newUser.name }, (err) => {
      if (err) return next(err);
      
      res.json({
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      });
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', validate(loginSchema), (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) return next(err);
    
    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      
      res.json({ user });
    });
  })(req, res, next);
});

// Logout
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/user', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

export default router;
