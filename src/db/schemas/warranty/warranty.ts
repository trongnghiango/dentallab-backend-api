import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// Table
export const warrantySchema = pgTable('warranty', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});
