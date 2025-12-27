import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'nestjs_realworld',
      autoLoadEntities: true,
      synchronize: true, // 开发环境：自动同步数据库结构（生产环境要设为 false）
      // entities: [User], //手动指定实体 自动更方便
    }), // 数据库配置
    TypeOrmModule.forFeature([User]), // 注册User实体的Repository
  ],
  controllers: [AppController],
  providers: [AppService, UsersService], // 注册 UsersService
})
export class AppModule {}
