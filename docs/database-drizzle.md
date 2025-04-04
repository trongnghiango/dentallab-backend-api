# Tài Liệu Hướng Dẫn Cấu Hình Database với Drizzle ORM

## 1. Cấu Hình Cơ Bản

### 1.1. Yêu Cầu Tối Thiểu

- Cài đặt **drizzle-kit**:
  ```bash
  npm install drizzle-kit --save-dev
  ```
- File cấu hình bắt buộc: `drizzle.config.ts`

### 1.2. Cấu Trúc File `drizzle.config.ts`

```typescript
import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  schema: './src/db/schema.ts', // Đường dẫn đến file schema
  out: './db/migrations', // Thư mục xuất migration files
  dialect: 'postgresql', // Loại database (postgresql/mysql/sqlite)
  dbCredentials: {
    url: process.env.DATABASE_URL, // Lấy từ biến môi trường
  },
});
```

---

## 2. Thành Phần Chính

### 2.1. Database Dialect

- **Mục đích**: Chỉ định loại database
- **Ví dụ**:
  ```ts
  dialect: 'postgresql'; // postgresql | mysql | sqlite
  ```

### 2.2. Biến Môi Trường `DATABASE_URL`

- **Định dạng**:
  ```env
  DATABASE_URL="postgres://user:password@host:port/database_name"
  ```

### 2.3. Schema File

- **Vị trí**: Được chỉ định trong `schema`
- **Chức năng**: Định nghĩa cấu trúc bảng và quan hệ

---

## 3. Định Nghĩa Schema

### 3.1. Ví dụ Mẫu

```typescript
// src/db/schema.ts
import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const supplier = pgTable('supplier', {
  id: serial('id').primaryKey(), // Auto-increment PK
  name: varchar('name', { length: 255 }) // String max 255 ký tự
    .notNull(),
  address: text('address').notNull(), // Text không giới hạn
  phone: varchar('phone', { length: 20 }) // Số ĐT có max 20 số
    .notNull(),
  email: varchar('email', { length: 255 }) // Email duy nhất
    .notNull()
    .unique(),
});
```

### 3.2. Giải Thích Trường

| Trường    | Kiểu Dữ Liệu   | Ràng Buộc         |
| --------- | -------------- | ----------------- |
| `id`      | `serial`       | Primary Key       |
| `name`    | `varchar(255)` | Bắt buộc          |
| `address` | `text`         | Bắt buộc          |
| `phone`   | `varchar(20)`  | Bắt buộc          |
| `email`   | `varchar(255)` | Unique + Bắt buộc |

---

## 4. Thực Hiện Migration

### 4.1. Tạo Migration Files

```bash
npx drizzle-kit generate --config=./drizzle.config.ts
```

### 4.2. Áp dụng Migration

```bash
npx drizzle-kit migrate
```

### 4.3. Kiểm Tra Migration

```bash
npx drizzle-kit check
```

---

## 5. Workflow Tổng Quan

1. **Cấu hình**  
   → Tạo `drizzle.config.ts`  
   → Khai báo database credentials

2. **Định nghĩa Schema**  
   → Tạo các bảng trong `schema.ts`

3. **Tạo Migration**  
   → Sinh SQL từ schema

4. **Áp dụng Database**  
   → Chạy migration để cập nhật cấu trúc

---

## 6. Lưu Ý Quan Trọng

- Luôn kiểm tra `.env` có chứa `DATABASE_URL`
- Đảm bảo dialect khớp với database thực tế
- Schema file phải export tất cả các bảng cần migration
