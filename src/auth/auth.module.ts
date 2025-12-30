import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/users.entity";
import { UsersService } from "src/users/users.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]), // 注册User实体的Repository
        JwtModule.register({
            secret: 'your-secret-key-here', // 暂时硬编码，后续会优化为环境变量
            signOptions: {expiresIn: '7d'}, // Token 7天后过期
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, UsersService],
})
export class AuthModule {}