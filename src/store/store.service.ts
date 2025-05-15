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
