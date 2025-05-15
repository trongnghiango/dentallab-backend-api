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
