import { Inject, Injectable, Logger } from '@nestjs/common';
import { DRIZZLE } from 'src/db/drizzle.module';
import { DrizzleDB } from 'src/db/types/drizzle';
import { productSchema, usersSchema } from 'src/db/schemas';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseCrudService } from '../common/services/base-crud.service';

@Injectable()
export class UserService extends BaseCrudService<
  typeof usersSchema, // TTable
  InferSelectModel<typeof usersSchema>, // TSelectModel
  InferInsertModel<typeof usersSchema>, // TInsertModel
  CreateUserDto, // CreateDto
  UpdateUserDto // UpdateDto
> {
  private readonly logger = new Logger(ProductService.name);

  constructor(@Inject(DRIZZLE) protected readonly db: DrizzleDB) {
    super(db, usersSchema, 'Product');
  }

  //implement cac service rieng cho tung resource

}
