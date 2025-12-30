import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/users/users.entity";
import { UsersService } from "src/users/users.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从请求头中提取Token
            ignoreExpiration: false, // 是否忽略过期时间
            secretOrKey: 'your-secret-key-here'
        })
    }

    // 该方法会在Token验证成功后调用
    // payload是在login方法中设置的 payload（包含 sub 和 email）
    async validate(payload: any): Promise<User> {
        const user = await this.usersService.findOne(payload?.sub)

        if(!user) {
            throw new UnauthorizedException('User not found')
        }

        // 返回的用户会被附加到 request.user 上
        return user
    }
}