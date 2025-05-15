import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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
