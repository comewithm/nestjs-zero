import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/users.entity';
import { UsersService } from './users/users.service';
import { Article } from './articles/articles.entity';
import { UsersController } from './users/users.controller';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { ProfileModule } from './profiles/profiles.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { LearnController } from './learn/learn.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'nestjs_realworld'),
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SYNC', 'true') === 'true', // 开发环境：自动同步数据库结构（生产环境要设为 false）
      }),
    }), // 数据库配置
    TypeOrmModule.forFeature([User, Article]), // 注册User实体的Repository
    AuthModule,
    ArticlesModule,
    ProfileModule,
  ],
  controllers: [AppController, UsersController, LearnController],
  providers: [AppService, UsersService], // 注册 UsersService
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).exclude('api', 'api/(.*)').forRoutes('*');
  }
}
