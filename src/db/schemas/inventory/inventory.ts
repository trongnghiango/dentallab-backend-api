import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// Table
export const inventorySchema = pgTable('inventory', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});
