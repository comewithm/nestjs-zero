import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";


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

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        // 1.密码未验证
        // 2.没有返回jwt token
        // 3.无法用于后续的认证
        return await this.authService.login(loginDto)
    }
}