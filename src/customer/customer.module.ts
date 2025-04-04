import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/db/drizzle.module';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [DrizzleModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
