import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// Table
export const adjustmentSchema = pgTable('adjustment_inventory', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});
