import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/users.entity";
import { UsersService } from "src/users/users.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]), // 注册User实体的Repository
    ],
    controllers: [AuthController],
    providers: [AuthService, UsersService],
})
export class AuthModule {}