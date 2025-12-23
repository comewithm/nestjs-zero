import { Body, Controller, Get, HttpStatus, Param, Post, Query, Redirect, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';

import type {Response} from 'express'


interface User {
  id: number
  username: string
  email: string
}

interface CreateUserDto {
  username: string
  email: string
}

/**
 * 使用CLI创建控制器，执行 nest g controller [name] 命令生成
 * 
 * 测试post请求：
 * curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@example.com"}'
 */

@Controller("")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): {status: string; timestamp: string} {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  }

  // 添加用户列表端点
  @Get('users')
  // @Redirect('https://nest.nodejs.cn/controllers', 301)
  getUsers(@Query('name') name: string, @Query('age') age: number): User[] {
    // 完整路径应该是 /users
    console.log('request name:', name, 'age:', age)
    return [
      {id: 1, username: 'alice', email: 'alice@example.com'},
      {id: 2, username: 'bob', email: 'bob@example.com'},
    ]
  }

  @Get('users/:id')
  findOne(@Param('id') id: string) {
    return `获取用户 ${id}`
  }

  @Post("users")
  createUser(@Body() userData: CreateUserDto): User {
    return {
      id: Date.now(),
      ...userData
    }
  }

  @Post("post")
  create(@Res() res: Response) {
    res.status(HttpStatus.CREATED).send("create successful")
  }
}
