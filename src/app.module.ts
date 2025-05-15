import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomerModule } from './customer/customer.module';
import { DrizzleModule } from './db/drizzle.module';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import { SupplierModule } from './supplier/supplier.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    CustomerModule,
    DrizzleModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ProductModule,
    StoreModule,
    SupplierModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
