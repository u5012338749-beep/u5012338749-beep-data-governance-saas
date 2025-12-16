import { randomBytes } from 'crypto';

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateApiKey(): string {
  return `dgk_${randomBytes(32).toString('hex')}`;
}

export function pagination(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  return { limit, offset };
}
