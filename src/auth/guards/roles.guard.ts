import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // 优先使用认证后用户信息
    const role = request.user?.role;
    if (!role) {
      throw new ForbiddenException('当前用户缺少角色信息');
    }

    const allowed = requiredRoles.includes(role);
    if (!allowed) {
      throw new ForbiddenException(`角色权限不足`);
    }

    return true;
  }
}
