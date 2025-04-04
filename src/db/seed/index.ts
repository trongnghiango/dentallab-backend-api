import 'dotenv/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schemas';

const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
  maxUses: 10,
  max: 15,
  connectionString: databaseUrl,
  ssl: true,
});

export const db = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
