import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exveption.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 配置全局管道
  app.useGlobalPipes(new ValidationPipe());

  // 配置全局拦截器(统一响应格式)
  app.useGlobalInterceptors(new TransformInterceptor());

  // 配置全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
