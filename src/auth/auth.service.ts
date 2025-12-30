import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { CreateUserDto, UsersService } from "src/users/users.service";
import * as bcrypt from 'bcrypt'
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService, // 注入JwtService
    ) {}

    // 注册用户
    async register(registerDto: RegisterDto) {
        // 1.检查email是否已存在

        const existingUserByEmail = await this.userService.findByEmail(registerDto.email)
        if(existingUserByEmail) {
            throw new ConflictException('Email already exists')
        }

        // 2.检查username是否已存在
        const existingUserByUsername = await this.userService.findByUsername(registerDto.username)
        if(existingUserByUsername) {
            throw new ConflictException('Username already exists')
        }

        // 3.加密密码 (使用bcrypt, salt rounds = 10)
        const hashedPassword = await bcrypt.hash(registerDto.password, 10)

        const createUserDto: CreateUserDto = {
            email: registerDto.email,
            username: registerDto.username,
            password: hashedPassword, // 使用加密后的密码
        }

        return await this.userService.create(createUserDto)
    }

    // 登录(有问题)
    async login(loginDto: LoginDto) {
        // 1.根据email查找用户
        const user = await this.userService.findByEmail(loginDto.email)

        if(!user) {
            throw new UnauthorizedException('Invalid credentials')
        }

        // 2.验证密码(使用bcrypt.compare)
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)

        if(!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials')
        }

        // 3.生成JWT Token
        const payload = {
            sub: user.id,
            email: user.email
        }; // sub是jwt标准中的 subject（用户ID）

        const token = await this.jwtService.signAsync(payload)

        // 返回用户信息和Token
        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                bio: user.bio,
                image: user.image
            },
            token, // 返回JWT Token
        }
    }
}