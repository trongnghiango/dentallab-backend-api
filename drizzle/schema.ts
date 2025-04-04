import { pgTable, serial, text, unique, varchar } from 'drizzle-orm/pg-core';

export const product = pgTable('product', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
});

export const store = pgTable(
  'store',
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    address: text().notNull(),
    phone: varchar({ length: 20 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique('store_email_unique').on(table.email)],
);

export const supplier = pgTable(
  'supplier',
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    address: text().notNull(),
    phone: varchar({ length: 20 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique('supplier_email_unique').on(table.email)],
);

export const inventory = pgTable('inventory', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
});

export const adjustmentInventory = pgTable('adjustment_inventory', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
});

export const purchaseOrder = pgTable('purchase_order', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
});

export const purchaseOrderDetails = pgTable('purchase_order_details', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
});

export const goodsreceipt = pgTable('goodsreceipt', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
});

export const goodsreceiptDetails = pgTable('goodsreceipt_details', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
});

export const saleOrder = pgTable('sale_order', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
});

export const saleOrderDetails = pgTable('sale_order_details', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
});

export const customer = pgTable('customer', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
});

export const warranty = pgTable('warranty', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
});

export const warrantyService = pgTable('warranty_service', {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
});
