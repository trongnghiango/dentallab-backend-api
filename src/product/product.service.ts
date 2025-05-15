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
