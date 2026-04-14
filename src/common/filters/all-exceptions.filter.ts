import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()

        const isHttpException = exception instanceof HttpException

        const statusCode = isHttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR

        const message = isHttpException
            ? exception.message
            : '服务器内部错误'

        response.status(statusCode).json({
            success: false,
            data: null,
            message,
            statusCode,
            timestamp: new Date().toISOString(),
            path: request.url
        })
    }
}