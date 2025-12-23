import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
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
  getUsers() {
    // 完整路径应该是 /users
    return [
      {id: 1, username: 'alice', email: 'alice@example.com'},
      {id: 2, username: 'bob', email: 'bob@example.com'},
    ]
  }
}
