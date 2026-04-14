import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;

      console.log(`
                [LoggerMiddleware] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms                
            `);
    });

    next();
  }
}
