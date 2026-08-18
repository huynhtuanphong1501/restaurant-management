
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const req = context.switchToHttp().getRequest();
      const method = req.method;
      const url = req.url;
      const ip = req.ip;

      const message = `${new Date().toISOString()} - Method: ${method} - url: ${url} - ip: ${ip}`

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`${message} - ${Date.now() - now}ms`)),
      );
  }
}
