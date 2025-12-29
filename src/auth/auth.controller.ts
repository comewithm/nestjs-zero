import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        // 存在问题
        // 1.密码以明文方式存储到数据库
        // 2.如果email或username已存在，会报错但提示不友好
        // 3.没有使用ValidationPipe验证输入
        return await this.authService.register(registerDto)
    }
}