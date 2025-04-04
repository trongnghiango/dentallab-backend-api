import { Controller, Get } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  getInfo() {
    return this.customerService.getInfo();
  }

  @Get('raw')
  query() {
    return this.customerService.queryRaw();
  }
}
