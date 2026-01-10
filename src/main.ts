import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exveption.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 配置全局管道
  app.useGlobalPipes(new ValidationPipe());

  // 配置全局拦截器(统一响应格式)
  app.useGlobalInterceptors(new TransformInterceptor());

  // 配置全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 配置swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS RealWorld API')
    .setDescription('NestJS RealWorld 示例项目 API 文档')
    .setVersion('1.0.0')
    .addBearerAuth() // 添加Bearer Token认证
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // 文档路径：http://localhost:3000/api

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `Swagger API 文档: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}
bootstrap();
