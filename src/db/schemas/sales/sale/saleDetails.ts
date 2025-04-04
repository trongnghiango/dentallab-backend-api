import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// Table
export const saleOrderDetailsSchema = pgTable('sale_order_details', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});
