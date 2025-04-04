import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// Table
export const goodsReceiptDetailsSchema = pgTable('goodsreceipt_details', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});
