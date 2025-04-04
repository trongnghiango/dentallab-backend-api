import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// Table
export const saleOrderSchema = pgTable('sale_order', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});
