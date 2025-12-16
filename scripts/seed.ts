import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { db } from '../server/db';
import { users, tenants, tenantMembers } from '../shared/schema';
import { generateSlug } from '../server/lib/utils';
import { eq } from 'drizzle-orm';

dotenv.config();

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Check if test user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, 'test@example.com'),
    });

    if (existingUser) {
      console.log('Test user already exists. Skipping seed.');
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [user] = await db.insert(users).values({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    }).returning();

    console.log('Created test user:', user.email);

    // Create test workspace
    const [tenant] = await db.insert(tenants).values({
      name: 'My Workspace',
      slug: generateSlug('My Workspace'),
      description: 'Test workspace for development',
    }).returning();

    console.log('Created test workspace:', tenant.name);

    // Add user as owner
    await db.insert(tenantMembers).values({
      tenantId: tenant.id,
      userId: user.id,
      role: 'owner',
    });

    console.log('Added user as owner of workspace');
    console.log('\n✅ Seeding completed successfully!');
    console.log('\nTest credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('Workspace: my-workspace\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
