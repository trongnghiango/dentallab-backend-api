import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// Table
export const warrantyServiceSchema = pgTable('warranty_service', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});
