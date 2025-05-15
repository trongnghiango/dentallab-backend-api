// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module'; // Giả sử bạn có một UsersModule và UsersService
import { ConfigModule, ConfigService } from '@nestjs/config'; // Để đọc key từ .env

@Module({
  imports: [
    ConfigModule, // Đảm bảo ConfigModule đã được import global trong AppModule hoặc import ở đây
    UserModule, // Để AuthService có thể tương tác với UsersService
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule để inject ConfigService
      useFactory: async (configService: ConfigService) => {
        // Đọc nội dung khóa từ biến môi trường
        // Quan trọng: Đảm bảo các biến này được thiết lập đúng trong file .env
        // và nội dung của key được format đúng (ví dụ, nếu có \n thì phải xử lý)
        const privateKey = configService.get<string>('JWT_PRIVATE_KEY');
        const publicKey = configService.get<string>('JWT_PUBLIC_KEY');

        if (!privateKey || !publicKey) {
          throw new Error('JWT_PRIVATE_KEY or JWT_PUBLIC_KEY is not defined in environment variables.');
        }

        // Nếu key trong .env có ký tự `\\n` thay cho `\n`
        const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
        const formattedPublicKey = publicKey.replace(/\\n/g, '\n');

        return {
          privateKey: formattedPrivateKey,
          publicKey: formattedPublicKey,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '3600s', // Ví dụ: 1 giờ
            algorithm: 'RS256', // Thuật toán RSA
          },
        };
      },
      inject: [ConfigService], // Inject ConfigService
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule], // Export JwtModule nếu cần dùng ở nơi khác
})
export class AuthModule {}