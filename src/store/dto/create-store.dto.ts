import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  // @IsPhoneNumber(null) // Bạn có thể thêm validation cụ thể cho số điện thoại nếu muốn
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
