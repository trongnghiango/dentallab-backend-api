import 'dotenv/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
// import { Pool } from 'pg';
import * as schema from './schemas';
const databaseUrl = process.env.DATABASE_URL;

// client
// const pool = new Pool({
//   maxUses: 10,
//   max: 15,
//   connectionString: databaseUrl,
//   ssl: true,
// });

// export const db = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;

// export const db = drizzle({ client }) as NodePgDatabase<typeof schema>;

export const db = drizzle({
  connection: databaseUrl ?? 'postgresql://user:uyuyuy@locahost:5432/mydb',
}) as NodePgDatabase<typeof schema>;

// Luu y la khi khai bao 1 db = drizzle({...}) bang du an Typescript thi ta luon cho no bang
// `as NodePgDatabase<typeof schema>` voi generic la schema duoc import tu schemas tong hop
//  tu tat ca cac schema
// => de khi query no se gen ra autocomple cac schema dai dien cho cac bang trong db.
