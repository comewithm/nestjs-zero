import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from './error-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isProd = process.env.NODE_ENV === 'production';

    const isHttpException = exception instanceof HttpException;

    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;

    if (isHttpException) {
      message = exception.message;
    } else {
      message = isProd ? '服务器内部错误' : (exception as Error).message;
    }

    response.status(statusCode).json(<ErrorResponse>{
      success: false,
      data: null,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      errorCode: exception.code,
    });
  }
}
