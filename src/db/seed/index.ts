import { db } from '../drizzle';

(async function run() {
  //
  // const result = await db.select().from(storeSchema);

  const [result] = await db.query.storeSchema.findMany({});
  console.info({ result });
})().catch((err) => console.error(err));
