Chúng ta sẽ tạo các module NestJS tương ứng voi Schema cua drizzle để quản lý các thực thể do. Mỗi module thường sẽ bao gồm:

1.  **`[entity].module.ts`**: Khai báo module, import `DrizzleModule`, controller và service.
2.  **`[entity].controller.ts`**: Xử lý các request HTTP, gọi các phương thức từ service.
3.  **`[entity].service.ts`**: Chứa logic nghiệp vụ, tương tác với database thông qua Drizzle.
4.  **`dto/[action]-[entity].dto.ts`**: Data Transfer Objects để validate dữ liệu đầu vào.

Chúng ta sẽ tạo các module cho:
*   `Product`
*   `Store`
*   `Supplier`
*   `Inventory` (cho bảng `inventory`)
*   `InventoryAdjustment` (cho bảng `adjustment_inventory`)
*   `PurchaseOrder` (cho `purchase_order` và `purchase_order_details` sẽ được quản lý riêng hoặc gộp chung tùy logic)
*   `GoodsReceipt` (cho `goodsreceipt` và `goodsreceipt_details`)
*   `SaleOrder` (cho `sale_order` và `sale_order_details`)
*   `Warranty` (cho `warranty`)
*   `WarrantyService` (cho `warranty_service`)
*   Cập nhật `CustomerModule` hiện có để tuân theo chuẩn CRUD.

**Lưu ý quan trọng:**
*   Các schema chi tiết (như `purchaseOrderDetailsSchema`, `goodsReceiptDetailsSchema`, `saleOrderDetailsSchema`) hiện tại chỉ có `id` và `name`. Chúng chưa có foreign key liên kết rõ ràng đến bảng cha trong schema Drizzle. Do đó, ban đầu, tôi sẽ tạo CRUD riêng cho chúng. Nếu bạn muốn quản lý chúng như một phần của thực thể cha (ví dụ: khi tạo Purchase Order thì tạo luôn Details), bạn cần cập nhật schema Drizzle để có quan hệ và sau đó điều chỉnh service.
*   Cần cài đặt `class-validator` và `class-transformer` để sử dụng DTOs:
    ```bash
    npm install class-validator class-transformer
    # hoặc
    yarn add class-validator class-transformer
    ```
*   Kích hoạt `ValidationPipe` global trong `main.ts`.

Bắt đầu nào!

---

**Bước 1: Cập nhật `main.ts` để sử dụng `ValidationPipe`**

```typescript
// /home/ka/onetimes/dentallab-backend-api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Thêm dòng này

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // Thêm dòng này
  await app.listen(process.env.PORT ?? 5555);
}
bootstrap().catch((err) => console.error(err));
```

---

**Bước 2: Tạo các Module, Controller, Service, và DTOs**

Tôi sẽ cung cấp cấu trúc file và nội dung cho từng module.

**I. Module `Product`**

*   Tạo thư mục `src/product`
*   Tạo thư mục `src/product/dto`

**1. `src/product/dto/create-product.dto.ts`**
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
```

**2. `src/product/dto/update-product.dto.ts`**
```typescript
import { IsString, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

**3. `src/product/product.service.ts`**
```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from 'src/db/drizzle.module';
import { DrizzleDB } from 'src/db/types/drizzle';
import { productSchema } from 'src/db/schemas';
import { eq } from 'drizzle-orm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(createProductDto: CreateProductDto) {
    const [newProduct] = await this.db
      .insert(productSchema)
      .values(createProductDto)
      .returning();
    return newProduct;
  }

  async findAll() {
    return this.db.select().from(productSchema);
  }

  async findOne(id: number) {
    const [product] = await this.db
      .select()
      .from(productSchema)
      .where(eq(productSchema.id, id));
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const [updatedProduct] = await this.db
      .update(productSchema)
      .set(updateProductDto)
      .where(eq(productSchema.id, id))
      .returning();
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found to update`);
    }
    return updatedProduct;
  }

  async remove(id: number) {
    const [deletedProduct] = await this.db
      .delete(productSchema)
      .where(eq(productSchema.id, id))
      .returning();
    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found to delete`);
    }
    return { message: `Product with ID ${id} deleted successfully` };
  }
}
```

**4. `src/product/product.controller.ts`**
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
```

**5. `src/product/product.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/db/drizzle.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [DrizzleModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
```

---

**II. Module `Store`**

*   Tạo thư mục `src/store`
*   Tạo thư mục `src/store/dto`

**1. `src/store/dto/create-store.dto.ts`**
```typescript
import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  // @IsPhoneNumber(null) // Bạn có thể thêm validation cụ thể cho số điện thoại nếu muốn
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

**2. `src/store/dto/update-store.dto.ts`**
```typescript
import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  // @IsPhoneNumber(null)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

**3. `src/store/store.service.ts`**
```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from 'src/db/drizzle.module';
import { DrizzleDB } from 'src/db/types/drizzle';
import { storeSchema } from 'src/db/schemas';
import { eq } from 'drizzle-orm';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(createStoreDto: CreateStoreDto) {
    const [newStore] = await this.db
      .insert(storeSchema)
      .values(createStoreDto)
      .returning();
    return newStore;
  }

  async findAll() {
    return this.db.select().from(storeSchema);
  }

  async findOne(id: number) {
    const [store] = await this.db
      .select()
      .from(storeSchema)
      .where(eq(storeSchema.id, id));
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  async update(id: number, updateStoreDto: UpdateStoreDto) {
    const [updatedStore] = await this.db
      .update(storeSchema)
      .set(updateStoreDto)
      .where(eq(storeSchema.id, id))
      .returning();
    if (!updatedStore) {
      throw new NotFoundException(`Store with ID ${id} not found to update`);
    }
    return updatedStore;
  }

  async remove(id: number) {
    const [deletedStore] = await this.db
      .delete(storeSchema)
      .where(eq(storeSchema.id, id))
      .returning();
    if (!deletedStore) {
      throw new NotFoundException(`Store with ID ${id} not found to delete`);
    }
    return { message: `Store with ID ${id} deleted successfully` };
  }
}
```

**4. `src/store/store.controller.ts`**
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storeService.create(createStoreDto);
  }

  @Get()
  findAll() {
    return this.storeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storeService.update(id, updateStoreDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.remove(id);
  }
}
```

**5. `src/store/store.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/db/drizzle.module';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';

@Module({
  imports: [DrizzleModule],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
```

---

**III. Module `Supplier`**

Tương tự như `StoreModule`, chỉ thay đổi tên và schema.

*   Tạo thư mục `src/supplier`
*   Tạo thư mục `src/supplier/dto`

**1. `src/supplier/dto/create-supplier.dto.ts`**
```typescript
import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  // @IsPhoneNumber(null)
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

**2. `src/supplier/dto/update-supplier.dto.ts`**
```typescript
import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';

export class UpdateSupplierDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  // @IsPhoneNumber(null)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

**3. `src/supplier/supplier.service.ts`**
```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from 'src/db/drizzle.module';
import { DrizzleDB } from 'src/db/types/drizzle';
import { supplierSchema } from 'src/db/schemas';
import { eq } from 'drizzle-orm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(createSupplierDto: CreateSupplierDto) {
    const [newSupplier] = await this.db
      .insert(supplierSchema)
      .values(createSupplierDto)
      .returning();
    return newSupplier;
  }

  async findAll() {
    return this.db.select().from(supplierSchema);
  }

  async findOne(id: number) {
    const [supplier] = await this.db
      .select()
      .from(supplierSchema)
      .where(eq(supplierSchema.id, id));
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    const [updatedSupplier] = await this.db
      .update(supplierSchema)
      .set(updateSupplierDto)
      .where(eq(supplierSchema.id, id))
      .returning();
    if (!updatedSupplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found to update`);
    }
    return updatedSupplier;
  }

  async remove(id: number) {
    const [deletedSupplier] = await this.db
      .delete(supplierSchema)
      .where(eq(supplierSchema.id, id))
      .returning();
    if (!deletedSupplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found to delete`);
    }
    return { message: `Supplier with ID ${id} deleted successfully` };
  }
}
```

**4. `src/supplier/supplier.controller.ts`**
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.remove(id);
  }
}
```

**5. `src/supplier/supplier.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/db/drizzle.module';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';

@Module({
  imports: [DrizzleModule],
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule {}
```

---

**IV. Module `Inventory` (cho bảng `inventory`)**

*   Tạo thư mục `src/inventory`
*   Tạo thư mục `src/inventory/dto`

**1. `src/inventory/dto/create-inventory.dto.ts`**
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

**2. `src/inventory/dto/update-inventory.dto.ts`**
```typescript
import { IsString, IsOptional } from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  name?: string;
}
```

**3. `src/inventory/inventory.service.ts`**
```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from 'src/db/drizzle.module';
import { DrizzleDB } from 'src/db/types/drizzle';
import { inventorySchema } from 'src/db/schemas';
import { eq } from 'drizzle-orm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(createInventoryDto: CreateInventoryDto) {
    const [newInventory] = await this.db
      .insert(inventorySchema)
      .values(createInventoryDto)
      .returning();
    return newInventory;
  }

  async findAll() {
    return this.db.select().from(inventorySchema);
  }

  async findOne(id: number) {
    const [inventory] = await this.db
      .select()
      .from(inventorySchema)
      .where(eq(inventorySchema.id, id));
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }
    return inventory;
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    const [updatedInventory] = await this.db
      .update(inventorySchema)
      .set(updateInventoryDto)
      .where(eq(inventorySchema.id, id))
      .returning();
    if (!updatedInventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found to update`);
    }
    return updatedInventory;
  }

  async remove(id: number) {
    const [deletedInventory] = await this.db
      .delete(inventorySchema)
      .where(eq(inventorySchema.id, id))
      .returning();
    if (!deletedInventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found to delete`);
    }
    return { message: `Inventory with ID ${id} deleted successfully` };
  }
}
```

**4. `src/inventory/inventory.controller.ts`**
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventories')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }
}
```

**5. `src/inventory/inventory.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/db/drizzle.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [DrizzleModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
```

---

**V. Module `InventoryAdjustment` (cho bảng `adjustment_inventory`)**

*   Tạo thư mục `src/inventory-adjustment`
*   Tạo thư mục `src/inventory-adjustment/dto`

**1. `src/inventory-adjustment/dto/create-inventory-adjustment.dto.ts`**
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateInventoryAdjustmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

**2. `src/inventory-adjustment/dto/update-inventory-adjustment.dto.ts`**
```typescript
import { IsString, IsOptional } from 'class-validator';

export class UpdateInventoryAdjustmentDto {
  @IsOptional()
  @IsString()
  name?: string;
}
```

**3. `src/inventory-adjustment/inventory-adjustment.service.ts`**
```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from 'src/db/drizzle.module';
import { DrizzleDB } from 'src/db/types/drizzle';
import { adjustmentSchema } from 'src/db/schemas'; // Đổi tên schema cho phù hợp
import { eq } from 'drizzle-orm';
import { CreateInventoryAdjustmentDto } from './dto/create-inventory-adjustment.dto';
import { UpdateInventoryAdjustmentDto } from './dto/update-inventory-adjustment.dto';

@Injectable()
export class InventoryAdjustmentService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(createDto: CreateInventoryAdjustmentDto) {
    const [newAdjustment] = await this.db
      .insert(adjustmentSchema)
      .values(createDto)
      .returning();
    return newAdjustment;
  }

  async findAll() {
    return this.db.select().from(adjustmentSchema);
  }

  async findOne(id: number) {
    const [adjustment] = await this.db
      .select()
      .from(adjustmentSchema)
      .where(eq(adjustmentSchema.id, id));
    if (!adjustment) {
      throw new NotFoundException(`Inventory Adjustment with ID ${id} not found`);
    }
    return adjustment;
  }

  async update(id: number, updateDto: UpdateInventoryAdjustmentDto) {
    const [updatedAdjustment] = await this.db
      .update(adjustmentSchema)
      .set(updateDto)
      .where(eq(adjustmentSchema.id, id))
      .returning();
    if (!updatedAdjustment) {
      throw new NotFoundException(`Inventory Adjustment with ID ${id} not found to update`);
    }
    return updatedAdjustment;
  }

  async remove(id: number) {
    const [deletedAdjustment] = await this.db
      .delete(adjustmentSchema)
      .where(eq(adjustmentSchema.id, id))
      .returning();
    if (!deletedAdjustment) {
      throw new NotFoundException(`Inventory Adjustment with ID ${id} not found to delete`);
    }
    return { message: `Inventory Adjustment with ID ${id} deleted successfully` };
  }
}
```

**4. `src/inventory-adjustment/inventory-adjustment.controller.ts`**
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { InventoryAdjustmentService } from './inventory-adjustment.service';
import { CreateInventoryAdjustmentDto } from './dto/create-inventory-adjustment.dto';
import { UpdateInventoryAdjustmentDto } from './dto/update-inventory-adjustment.dto';

@Controller('inventory-adjustments')
export class InventoryAdjustmentController {
  constructor(private readonly service: InventoryAdjustmentService) {}

  @Post()
  create(@Body() createDto: CreateInventoryAdjustmentDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateInventoryAdjustmentDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

**5. `src/inventory-adjustment/inventory-adjustment.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/db/drizzle.module';
import { InventoryAdjustmentController } from './inventory-adjustment.controller';
import { InventoryAdjustmentService } from './inventory-adjustment.service';

@Module({
  imports: [DrizzleModule],
  controllers: [InventoryAdjustmentController],
  providers: [InventoryAdjustmentService],
})
export class InventoryAdjustmentModule {}
```

---
**VI. Modules cho `PurchaseOrder` và `PurchaseOrderDetails`**

Do `purchaseOrderDetailsSchema` hiện tại không có liên kết foreign key, chúng ta sẽ tạo CRUD riêng cho từng bảng.

**A. Module `PurchaseOrder`**

*   Tạo thư mục `src/purchase-order`
*   Tạo thư mục `src/purchase-order/dto`

**1. `src/purchase-order/dto/create-purchase-order.dto.ts`**
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePurchaseOrderDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

**2. `src/purchase-order/dto/update-purchase-order.dto.ts`**
```typescript
import { IsString, IsOptional } from 'class-validator';

export class UpdatePurchaseOrderDto {
  @IsOptional()
  @IsString()
  name?: string;
}
```

**3. `src/purchase-order/purchase-order.service.ts`** (Tương tự các service khác, sử dụng `purchaseOrderSchema`)
```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from 'src/db/drizzle.module';
import { DrizzleDB } from 'src/db/types/drizzle';
import { purchaseOrderSchema } from 'src/db/schemas';
import { eq } from 'drizzle-orm';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Injectable()
export class PurchaseOrderService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(createDto: CreatePurchaseOrderDto) {
    const [newOrder] = await this.db
      .insert(purchaseOrderSchema)
      .values(createDto)
      .returning();
    return newOrder;
  }

  async findAll() {
    return this.db.select().from(purchaseOrderSchema);
  }

  async findOne(id: number) {
    const [order] = await this.db
      .select()
      .from(purchaseOrderSchema)
      .where(eq(purchaseOrderSchema.id, id));
    if (!order) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: number, updateDto: UpdatePurchaseOrderDto) {
    const [updatedOrder] = await this.db
      .update(purchaseOrderSchema)
      .set(updateDto)
      .where(eq(purchaseOrderSchema.id, id))
      .returning();
    if (!updatedOrder) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found to update`);
    }
    return updatedOrder;
  }

  async remove(id: number) {
    const [deletedOrder] = await this.db
      .delete(purchaseOrderSchema)
      .where(eq(purchaseOrderSchema.id, id))
      .returning();
    if (!deletedOrder) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found to delete`);
    }
    return { message: `Purchase Order with ID ${id} deleted successfully` };
  }
}
```

**4. `src/purchase-order/purchase-order.controller.ts`** (Tương tự các controller khác)
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly service: PurchaseOrderService) {}

  @Post()
  create(@Body() createDto: CreatePurchaseOrderDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePurchaseOrderDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

**5. `src/purchase-order/purchase-order.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/db/drizzle.module';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from './purchase-order.service';

@Module({
  imports: [DrizzleModule],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
})
export class PurchaseOrderModule {}
```

**B. Module `PurchaseOrderDetail`**

*   Tạo thư mục `src/purchase-order-detail`
*   Tạo thư mục `src/purchase-order-detail/dto`

**1. `src/purchase-order-detail/dto/create-purchase-order-detail.dto.ts`**
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePurchaseOrderDetailDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  // Trong tương lai, bạn sẽ thêm các trường như purchaseOrderId, productId, quantity, price...
}
```

**2. `src/purchase-order-detail/dto/update-purchase-order-detail.dto.ts`**
```typescript
import { IsString, IsOptional } from 'class-validator';

export class UpdatePurchaseOrderDetailDto {
  @IsOptional()
  @IsString()
  name?: string;
}
```

**3. `src/purchase-order-detail/purchase-order-detail.service.ts`** (Sử dụng `purchaseOrderDetailsSchema`)
```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from 'src/db/drizzle.module';
import { DrizzleDB } from 'src/db/types/drizzle';
import { purchaseOrderDetailsSchema } from 'src/db/schemas';
import { eq } from 'drizzle-orm';
import { CreatePurchaseOrderDetailDto } from './dto/create-purchase-order-detail.dto';
import { UpdatePurchaseOrderDetailDto } from './dto/update-purchase-order-detail.dto';

@Injectable()
export class PurchaseOrderDetailService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(createDto: CreatePurchaseOrderDetailDto) {
    const [newDetail] = await this.db
      .insert(purchaseOrderDetailsSchema)
      .values(createDto)
      .returning();
    return newDetail;
  }

  async findAll() {
    return this.db.select().from(purchaseOrderDetailsSchema);
  }

  async findOne(id: number) {
    const [detail] = await this.db
      .select()
      .from(purchaseOrderDetailsSchema)
      .where(eq(purchaseOrderDetailsSchema.id, id));
    if (!detail) {
      throw new NotFoundException(`Purchase Order Detail with ID ${id} not found`);
    }
    return detail;
  }

  async update(id: number, updateDto: UpdatePurchaseOrderDetailDto) {
    const [updatedDetail] = await this.db
      .update(purchaseOrderDetailsSchema)
      .set(updateDto)
      .where(eq(purchaseOrderDetailsSchema.id, id))
      .returning();
    if (!updatedDetail) {
      throw new NotFoundException(`Purchase Order Detail with ID ${id} not found to update`);
    }
    return updatedDetail;
  }

  async remove(id: number) {
    const [deletedDetail] = await this.db
      .delete(purchaseOrderDetailsSchema)
      .where(eq(purchaseOrderDetailsSchema.id, id))
      .returning();
    if (!deletedDetail) {
      throw new NotFoundException(`Purchase Order Detail with ID ${id} not found to delete`);
    }
    return { message: `Purchase Order Detail with ID ${id} deleted successfully` };
  }
}
```

**4. `src/purchase-order-detail/purchase-order-detail.controller.ts`**
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PurchaseOrderDetailService } from './purchase-order-detail.service';
import { CreatePurchaseOrderDetailDto } from './dto/create-purchase-order-detail.dto';
import { UpdatePurchaseOrderDetailDto } from './dto/update-purchase-order-detail.dto';

@Controller('purchase-order-details')
export class PurchaseOrderDetailController {
  constructor(private readonly service: PurchaseOrderDetailService) {}

  @Post()
  create(@Body() createDto: CreatePurchaseOrderDetailDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePurchaseOrderDetailDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

**5. `src/purchase-order-detail/purchase-order-detail.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/db/drizzle.module';
import { PurchaseOrderDetailController } from './purchase-order-detail.controller';
import { PurchaseOrderDetailService } from './purchase-order-detail.service';

@Module({
  imports: [DrizzleModule],
  controllers: [PurchaseOrderDetailController],
  providers: [PurchaseOrderDetailService],
})
export class PurchaseOrderDetailModule {}
```

---

**VII. Modules cho `GoodsReceipt` và `GoodsReceiptDetails`**

Tương tự như `PurchaseOrder` và `PurchaseOrderDetail`.

**A. Module `GoodsReceipt`** (sử dụng `goodsReceiptSchema`)
*   Tạo thư mục `src/goods-receipt` và `src/goods-receipt/dto`
*   `create-goods-receipt.dto.ts`, `update-goods-receipt.dto.ts`
*   `goods-receipt.service.ts`, `goods-receipt.controller.ts`, `goods-receipt.module.ts`

**B. Module `GoodsReceiptDetail`** (sử dụng `goodsReceiptDetailsSchema`)
*   Tạo thư mục `src/goods-receipt-detail` và `src/goods-receipt-detail/dto`
*   `create-goods-receipt-detail.dto.ts`, `update-goods-receipt-detail.dto.ts`
*   `goods-receipt-detail.service.ts`, `goods-receipt-detail.controller.ts`, `goods-receipt-detail.module.ts`

(Code cho các module này sẽ rất giống với `PurchaseOrder` và `PurchaseOrderDetail`, chỉ thay tên schema và tên class.)

---

**VIII. Modules cho `SaleOrder` và `SaleOrderDetails`**

Tương tự như `PurchaseOrder` và `PurchaseOrderDetail`.

**A. Module `SaleOrder`** (sử dụng `saleOrderSchema`)
*   Tạo thư mục `src/sale-order` và `src/sale-order/dto`
*   `create-sale-order.dto.ts`, `update-sale-order.dto.ts`
*   `sale-order.service.ts`, `sale-order.controller.ts`, `sale-order.module.ts`

**B. Module `SaleOrderDetail`** (sử dụng `saleOrderDetailsSchema`)
*   Tạo thư mục `src/sale-order-detail` và `src/sale-order-detail/dto`
*   `create-sale-order-detail.dto.ts`, `update-sale-order-detail.dto.ts`
*   `sale-order-detail.service.ts`, `sale-order-detail.controller.ts`, `sale-order-detail.module.ts`

---

**IX. Cập nhật Module `Customer`**

Module này đã có, chúng ta sẽ chuẩn hóa nó.
*   Tạo thư mục `src/customer/dto` (nếu chưa có)

**1. `src/customer/dto/create-customer.dto.ts`**
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

**2. `src/customer/dto/update-customer.dto.ts`**
```typescript
import { IsString, IsOptional } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;
}
```

**3. `src/customer/customer.service.ts` (Cập nhật)**
```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from 'src/db/drizzle.module';
import { customerSchema } from 'src/db/schemas';
import { DrizzleDB } from 'src/db/types/drizzle';
import { eq } from 'drizzle-orm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const [newCustomer] = await this.db
      .insert(customerSchema)
      .values(createCustomerDto)
      .returning();
    return newCustomer;
  }

  async findAll() {
    return this.db.select().from(customerSchema);
  }

  async findOne(id: number) {
    const [customer] = await this.db
      .select()
      .from(customerSchema)
      .where(eq(customerSchema.id, id));
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const [updatedCustomer] = await this.db
      .update(customerSchema)
      .set(updateCustomerDto)
      .where(eq(customerSchema.id, id))
      .returning();
    if (!updatedCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found to update`);
    }
    return updatedCustomer;
  }

  async remove(id: number) {
    const [deletedCustomer] = await this.db
      .delete(customerSchema)
      .where(eq(customerSchema.id, id))
      .returning();
    if (!deletedCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found to delete`);
    }
    return { message: `Customer with ID ${id} deleted successfully` };
  }
}
```

**4. `src/customer/customer.controller.ts` (Cập nhật)**
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers') // Thay đổi route thành 'customers'
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  findAll() { // Thay đổi tên phương thức cho rõ ràng
    return this.customerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { // Thêm endpoint lấy theo ID
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  update( // Thêm endpoint cập nhật
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { // Thêm endpoint xóa
    return this.customerService.remove(id);
  }

  // Bỏ phương thức queryRaw() hoặc giữ lại nếu bạn có mục đích cụ thể
  // @Get('raw')
  // query() {
  //   return this.customerService.queryRaw();
  // }
}
```
(Module `customer.module.ts` giữ nguyên)

---

**X. Module `Warranty`** (sử dụng `warrantySchema`)

*   Tạo thư mục `src/warranty` và `src/warranty/dto`
*   `create-warranty.dto.ts`, `update-warranty.dto.ts`
*   `warranty.service.ts`, `warranty.controller.ts`, `warranty.module.ts`
    (Cấu trúc tương tự các module CRUD đơn giản khác)

---

**XI. Module `WarrantyServiceEntity` (để tránh trùng tên với `WarrantyService`)** (sử dụng `warrantyServiceSchema`)

*   Tạo thư mục `src/warranty-service` và `src/warranty-service/dto`
*   `create-warranty-service.dto.ts`, `update-warranty-service.dto.ts`
*   `warranty-service.service.ts`, `warranty-service.controller.ts`, `warranty-service.module.ts`
    (Cấu trúc tương tự các module CRUD đơn giản khác, lưu ý đổi tên service class thành ví dụ `WarrantyServiceEntityService` để không bị trùng với tên thư mục)

---

**Bước 3: Cập nhật `AppModule`**

```typescript
// /home/ka/onetimes/dentallab-backend-api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomerModule } from './customer/customer.module';
import { DrizzleModule } from './db/drizzle.module';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import { SupplierModule } from './supplier/supplier.module';
import { InventoryModule } from './inventory/inventory.module';
import { InventoryAdjustmentModule } from './inventory-adjustment/inventory-adjustment.module';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { PurchaseOrderDetailModule } from './purchase-order-detail/purchase-order-detail.module';
// Import các module còn lại cho GoodsReceipt, SaleOrder, Warranty...
// Ví dụ:
// import { GoodsReceiptModule } from './goods-receipt/goods-receipt.module';
// import { GoodsReceiptDetailModule } from './goods-receipt-detail/goods-receipt-detail.module';
// import { SaleOrderModule } from './sale-order/sale-order.module';
// import { SaleOrderDetailModule } from './sale-order-detail/sale-order-detail.module';
// import { WarrantyModule } from './warranty/warranty.module';
// import { WarrantyServiceModule } from './warranty-service/warranty-service.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DrizzleModule,
    CustomerModule,
    ProductModule,
    StoreModule,
    SupplierModule,
    InventoryModule,
    InventoryAdjustmentModule,
    PurchaseOrderModule,
    PurchaseOrderDetailModule,
    // Thêm các module đã tạo ở đây:
    // GoodsReceiptModule,
    // GoodsReceiptDetailModule,
    // SaleOrderModule,
    // SaleOrderDetailModule,
    // WarrantyModule,
    // WarrantyServiceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```
Bạn cần tự hoàn thiện code cho các module `GoodsReceipt`, `GoodsReceiptDetail`, `SaleOrder`, `SaleOrderDetail`, `Warranty`, và `WarrantyServiceEntity` theo mẫu đã cung cấp, sau đó import chúng vào `AppModule`.

Đây là một bộ khung khá đầy đủ cho các nghiệp vụ cơ bản CRUD dựa trên schema của bạn. Bạn có thể bắt đầu từ đây và phát triển thêm logic phức tạp hơn khi cần.