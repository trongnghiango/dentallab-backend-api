import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// Table
export const purchaseOrderDetailsSchema = pgTable('purchase_order_details', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});
