import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/users.entity';
import { UsersService } from './users/users.service';
import { Article } from './articles/articles.entity';
import { UsersController } from './users/users.controller';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';

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
    TypeOrmModule.forFeature([User, Article]), // 注册User实体的Repository
    AuthModule,
    ArticlesModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService], // 注册 UsersService
})
export class AppModule {}
