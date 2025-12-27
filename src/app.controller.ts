import {
  ArgumentMetadata,
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  PipeTransform,
  Post,
  Put,
  Query,
  Redirect,
  Req,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';

import type { Response } from 'express';

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEmpty,
  IsOptional,
} from 'class-validator';
import type {CreateUserDto} from './users/users.service'
import { UsersService } from './users/users.service';
import { User } from './users/users.entity';

class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: '用户名格式不正确: 只能包含字母、数字和下划线，且不能以数字开头',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

// 自定义管道：验证用户名格式
class UsernameValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // valid 是要验证的值（用户名）
    // metadata 包含参数的元数据信息

    if (!value) {
      return value;
    }

    const usernameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

    if (!usernameRegex.test(value)) {
      throw new BadRequestException('用户名格式不正确');
    }
    return value; // 如果验证通过，则返回原始值
  }
}

// 更新用户的Dto
class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  password: string;
}

class RangeValidationPipe implements PipeTransform {
  constructor(
    private readonly min: number,
    private readonly max: number,
  ) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (value === undefined || value === null || value === '') {
      return value;
    }

    const num = parseInt(value);

    if (isNaN(num)) {
      throw new BadRequestException('页码必须是数字');
    }

    if (num < this.min || num > this.max) {
      throw new BadRequestException(
        `页码范围必须在 ${this.min} 到 ${this.max} 之间`,
      );
    }

    return num;
  }
}

/**
 * 使用CLI创建控制器，执行 nest g controller [name] 命令生成
 * 
 * 测试post请求：
 * curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@example.com"}'

  使用 @Matches() 装饰器的场景
  适合：
  简单的正则表达式验证
  DTO 字段验证（请求体数据）
  验证逻辑固定，不需要参数
  可以和其他装饰器组合使用
  优点：
  简洁，代码可读性好
  可以和 @IsOptional()、@MinLength() 等组合
  自动集成到 ValidationPipe 中
  错误信息可以自定义
  缺点：
  只适用于 DTO 字段
  不能用于路由参数、查询参数（需要管道）
  逻辑固定，不够灵活

  使用自定义管道的场景
  适合：
  参数类型转换（如 ParseIntPipe）
  路由参数、查询参数的验证
  需要可配置参数（如范围验证）
  需要复杂的业务逻辑验证
  需要访问元数据（metadata）
  优点：
  灵活性高，可以写复杂逻辑
  可以接收参数（构造函数参数）
  适用于所有类型的参数（路由、查询、请求体）
  可以访问 metadata 获取更多信息
  缺点：
  代码相对复杂
  不能直接用于 DTO 字段（需要通过参数装饰器）
 */

@Controller('')
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

}
