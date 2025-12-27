import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { Repository } from "typeorm";

export interface CreateUserDto {
    email: string;
    password: string;
    username: string;
    bio?: string;
    image?: string;
}

export interface UpdateUserDto {
    email?: string;
    password?: string;
    username?: string;
    bio?: string;
    image?: string;
}


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) // 注入User实体
        private readonly userRepository: Repository<User>
    ) {}

    // 创建用户
    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto)

        return await this.userRepository.save(user)
    }

    // 查询所有用户
    async findAll(): Promise<User[]> {
        return await this.userRepository.find()
    }

    // 根据ID查询用户
    async findOne(id: number): Promise<User | null> {
        return await this.userRepository.findOne({where: {id}})
    }

    // 更新用户
    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        // 二次查询返回
        await this.userRepository.update(id, updateUserDto)
        
        const updatedUser = await this.userRepository.findOne({where: {id}})

        if(!updatedUser) {
            throw new Error('User not found')
        }

        return updatedUser
    }

    // find + save
    async update2(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.userRepository.findOne({where: {id}})

        if(!user) {
            throw new Error('User not found')
        }

        Object.assign(user, updateUserDto) // 合并更新数据
        return await this.userRepository.save(user) // 保存并返回
    }

    // 删除用户
    async remove(id: number): Promise<void> {
        await this.userRepository.delete(id)
    }
}