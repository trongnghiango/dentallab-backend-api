# Tạo cấu trúc thư mục gốc
mkdir -p src/db/{schemas,relations,types}

# Tạo core schemas
mkdir -p src/db/schemas/core
touch src/db/schemas/core/{store.ts,supplier.ts,product.ts,index.ts}

# Tạo inventory schemas
mkdir -p src/db/schemas/inventory/{purchase,receipt}
touch src/db/schemas/inventory/{inventory.ts,adjustment.ts,index.ts}
touch src/db/schemas/inventory/purchase/{order.ts,orderDetails.ts,index.ts}
touch src/db/schemas/inventory/receipt/{goodsReceipt.ts,goodsReceiptDetails.ts,index.ts}

# Tạo sales schemas
mkdir -p src/db/schemas/sales/sale
touch src/db/schemas/sales/{customer.ts,index.ts}
touch src/db/schemas/sales/sale/{sale.ts,saleDetails.ts,index.ts}

# Tạo warranty schemas
mkdir -p src/db/schemas/warranty
touch src/db/schemas/warranty/{warranty.ts,service.ts,index.ts}

# Tạo relations
touch src/db/relations/{inventoryRelations.ts,salesRelations.ts,index.ts}

# Tạo types
touch src/db/types/{inventoryTypes.ts,salesTypes.ts,index.ts}

# Tạo file tổng
touch src/db/schemas/index.ts
touch src/db/index.ts

# Thêm nội dung mẫu vào các file core (ví dụ)
cat > src/db/schemas/core/store.ts << 'EOL'
import { pgTable, serial, varchar, text } from 'drizzle-orm/pg-core';

export const store = pgTable('store', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
});
EOL

# Tạo file index.ts cho core
cat > src/db/schemas/core/index.ts << 'EOL'
export * from './store';
export * from './supplier';
export * from './product';
EOL

# Tạo file db index
cat > src/db/index.ts << 'EOL'
export * from './schemas';
export * from './relations';
export * from './types';
EOL