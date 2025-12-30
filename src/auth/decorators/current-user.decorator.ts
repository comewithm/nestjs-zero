import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "src/users/users.entity";


export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): User => {
        // 从请求对象中获取用户信息
        const request = ctx.switchToHttp().getRequest()

        return request.user; // JwtStrategy 会将用户附加到 request.user
    }
)