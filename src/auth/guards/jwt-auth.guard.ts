import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // 'jwt' 对应JwtStrategy中使用的策略名称
  // Passport 会自动调用 JwtStrategy 来验证Token
}
