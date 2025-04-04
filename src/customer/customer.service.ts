import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/drizzle.module';
import { customerSchema, storeSchema } from 'src/db/schemas';
import { DrizzleDB } from 'src/db/types/drizzle';

@Injectable()
export class CustomerService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async getInfo() {
    return await this.db.select().from(storeSchema);
  }

  async queryRaw() {
    const result = await this.db.execute(sql`select * from ${customerSchema}`);
    return result.rows;
  }
}
