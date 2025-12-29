import { Injectable } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { CreateUserDto, UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {

    constructor(private readonly userService: UsersService) {}

    // 注册用户(存在问题)
    async register(registerDto: RegisterDto) {
        // 1.密码没有加密
        // 2.没有检查email或username是否存在
        // 3.没有适当的错误处理
        const createUserDto: CreateUserDto = {
            email: registerDto.email,
            username: registerDto.username,
            password: registerDto.password
        }

        return await this.userService.create(createUserDto)
    }
}