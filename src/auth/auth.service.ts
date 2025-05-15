// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service'; // Giả sử có UsersService
// Giả sử bạn có User entity/interface
// import { User } from '../users/entities/user.entity';

// Để đơn giản, ta dùng một user giả định. Trong thực tế, bạn sẽ query DB.
const mockUsers = [
  { id: 1, username: 'testuser', password: 'password123', roles: ['user'] }, // Trong thực tế, password nên được hash
];

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService, // Inject UsersService
    private jwtService: JwtService,
  ) {}

  // Hàm này thường dùng cho LocalStrategy (username/password)
  // Chúng ta sẽ gọi nó trực tiếp trong login cho ví dụ này
  validateUser(username: string, pass: string) {
    // const user = await this.userService.findOneByUsername(username); // Tìm user trong DB
    const user = mockUsers.find((u) => u.username === username); // Dùng mock user

    // Trong thực tế, bạn sẽ so sánh hash của password
    // if (user && await bcrypt.compare(pass, user.password)) {
    if (user && user.password === pass) {
      // So sánh trực tiếp cho mock
      const { password, ...result } = user;
      console.log({ password });
      return result; // Trả về user object không bao gồm password
    }
    return null;
  }

  login(userPayload: any) {
    // userPayload có thể là { username: string, userId: number, roles: string[] }
    // Trong thực tế, userPayload sẽ là kết quả từ validateUser hoặc trực tiếp từ DB sau khi xác thực
    // Ở đây, chúng ta giả định userPayload đã được xác thực và chứa thông tin cần thiết
    const payload: any = {
      username: userPayload.username,
      sub: userPayload.id, // 'sub' (subject) thường là ID của user
      roles: userPayload.roles, // Thêm roles nếu bạn muốn dùng RBAC
    };
    return {
      access_token: this.jwtService.sign(payload), // Tạo JWT bằng privateKey
    };
  }
}
