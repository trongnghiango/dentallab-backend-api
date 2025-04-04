import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// Table
export const goodsReceiptSchema = pgTable('goodsreceipt', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});
