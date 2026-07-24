import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

/**
 * In production (Render) TURSO_DATABASE_URL is set, so Prisma talks to
 * Turso over the libSQL adapter. Locally it's unset, so Prisma falls
 * back to the plain SQLite file configured via DATABASE_URL.
 */
export function createTursoAdapter() {
  const url = process.env.TURSO_DATABASE_URL;

  if (!url) {
    return undefined;
  }

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return new PrismaLibSQL(client);
}
