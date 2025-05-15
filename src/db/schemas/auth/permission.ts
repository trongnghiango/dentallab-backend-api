import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  // integer,
} from 'drizzle-orm/pg-core';
// import { resourcesSchema } from './resource'; // Nếu permission gắn với resource cụ thể

export const permissionsSchema = pgTable(
  'permissions',
  {
    id: serial('id').primaryKey(),
    // Ví dụ: action: 'create', 'read', 'update', 'delete'
    //        possession: 'own', 'any' (nếu muốn tách ra)
    //        Hoặc gộp lại: 'create:own_article', 'read:any_user'
    // Cách tiếp cận đơn giản hơn là chỉ lưu action (ví dụ: 'read', 'write', 'delete')
    // và resourceId sẽ chỉ định tài nguyên.
    action: varchar('action', { length: 50 }).notNull(), // 'read', 'create', 'update', 'delete', 'manage'
    // resourceId: integer('resource_id').references(() => resourcesSchema.id, { onDelete: 'set null' }), // Có thể null nếu quyền không gắn với resource cụ thể
    // Hoặc bạn có thể có một trường 'resourceName' kiểu text nếu không dùng bảng resources
    resourceName: varchar('resource_name', { length: 100 }).notNull(), // 'article', 'userProfile'
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      // Đảm bảo action + resourceName là duy nhất
      uniqueActionResource: uniqueIndex('unique_action_resource_idx').on(
        table.action,
        table.resourceName,
      ),
    };
  },
);

// import { relations } from 'drizzle-orm';
// import { rolePermissionsSchema } from './role-permissions';
// export const permissionsRelations = relations(permissionsSchema, ({ many, one }) => ({
//   rolePermissions: many(rolePermissionsSchema),
//   resource: one(resourcesSchema, { // Nếu có resourceId
//      fields: [permissionsSchema.resourceId],
//      references: [resourcesSchema.id],
//   }),
// }));
