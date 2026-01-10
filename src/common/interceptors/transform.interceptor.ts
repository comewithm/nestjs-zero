import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果数据已经是统一格式，直接返回
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'data' in data
        ) {
          // 先转换为 unknown，再转换为 Response<T>
          return data as unknown as Response<T>;
        }

        // 否则包装为统一格式
        return {
          success: true,
          data: data,
          message: '操作成功',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
