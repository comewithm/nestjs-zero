import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { finalize, Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();

    const slowMs = this.configService.get<number>('SLOW_REQUEST_MS', 200);

    return next.handle().pipe(
      // finalize 无论成功还是抛错，都会在 Observable 结束时执行一次，适合做「收尾统计」
      finalize(async () => {
        // test slow request
        // await new Promise(r => setTimeout(r, 300))
        const duration = Date.now() - now;

        if (duration > slowMs) {
          console.warn(`
                        [SlowRequest] ${req.method} ${req.originalUrl} - ${duration}ms (>${slowMs}ms)
                    `);
        }
      }),
    );
  }
}
