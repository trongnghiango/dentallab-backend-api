// src/common/services/base-crud.service.ts
import { NotFoundException } from '@nestjs/common';
// XÓA QueryResult KHỎI DÒNG IMPORT NÀY:
// import { NodePgDatabase, QueryResult } from 'drizzle-orm/node-postgres';
import { NodePgDatabase } from 'drizzle-orm/node-postgres'; // Giữ lại NodePgDatabase
import {
  eq,
  InferInsertModel,
  InferSelectModel,
  TableConfig,
} from 'drizzle-orm';
import * as pgCore from 'drizzle-orm/pg-core';

export type DrizzleTableWithId<
  TIdName extends string = 'id',
  TIdColumn extends pgCore.AnyPgColumn = pgCore.AnyPgColumn,
> = pgCore.PgTable<TableConfig<pgCore.AnyPgColumn>> & {
  _: {
    name: string;
    columns: Record<string, pgCore.AnyPgColumn>;
  };
} & Record<TIdName, TIdColumn>;

type EntityId = number | string;

export abstract class BaseCrudService<
  TTable extends DrizzleTableWithId<'id', pgCore.AnyPgColumn>,
  TSelectModel extends InferSelectModel<TTable> = InferSelectModel<TTable>,
  TInsertModel extends InferInsertModel<TTable> = InferInsertModel<TTable>,
  CreateDto extends TInsertModel = TInsertModel,
  UpdateDto extends Partial<TInsertModel> = Partial<TInsertModel>,
> {
  constructor(
    protected readonly db: NodePgDatabase<any>,
    protected readonly table: TTable,
    private readonly entityName: string,
  ) {}

  async create(createDto: CreateDto): Promise<TSelectModel> {
    const queryResult = await this.db
      .insert(this.table as any)
      .values(createDto as any)
      .returning();

    // Ép kiểu queryResult thành mảng các TSelectModel (hoặc TInsertModel nếu returning() trả về kiểu insert)
    // Drizzle thường trả về kiểu của record được chọn/chèn khi có returning()
    const result = queryResult as TSelectModel[];

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error(`Failed to create ${this.entityName}: No item returned.`);
    }
    const [newItem] = result; // Giờ thì an toàn hơn
    return newItem; // Không cần `as TSelectModel` nữa nếu newItem đã đúng kiểu
  }

  async findAll(): Promise<TSelectModel[]> {
    const results = await this.db.select().from(this.table as any);
    return results as TSelectModel[]; // Ép kiểu kết quả cuối cùng
  }

  async findOne(id: EntityId): Promise<TSelectModel> {
    const queryResult = await this.db
      .select()
      .from(this.table as any)
      .where(eq(this.table.id, id as any));

    const result = queryResult as TSelectModel[];

    if (!Array.isArray(result) || result.length === 0) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }
    const [item] = result;
    return item;
  }

  async update(id: EntityId, updateDto: UpdateDto): Promise<TSelectModel> {
    const queryResult = await this.db
      .update(this.table as any)
      .set(updateDto)
      .where(eq(this.table.id, id as any))
      .returning();

    const result = queryResult as TSelectModel[];

    if (!Array.isArray(result) || result.length === 0) {
      throw new NotFoundException(
        `${this.entityName} with ID ${id} not found to update`,
      );
    }
    const [updatedItem] = result;
    return updatedItem;
  }

  async remove(id: EntityId): Promise<{ message: string }> {
    // Đối với .returning({ id: this.table.id }), kiểu trả về sẽ là mảng các object { id: T }
    // Nên chúng ta cần một kiểu cụ thể hơn ở đây nếu muốn type safety
    type ReturnedIdType = { id: TSelectModel['id'] }; // Giả sử TSelectModel có thuộc tính 'id'

    const queryResult = await this.db
      .delete(this.table as any)
      .where(eq(this.table.id, id as any))
      .returning({ id: this.table.id });

    const result = queryResult as ReturnedIdType[];

    if (!Array.isArray(result) || result.length === 0) {
      throw new NotFoundException(
        `${this.entityName} with ID ${id} not found to delete`,
      );
    }
    return { message: `${this.entityName} with ID ${id} deleted successfully` };
  }
}
