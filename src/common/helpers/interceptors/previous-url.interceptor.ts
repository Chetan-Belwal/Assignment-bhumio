import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Session } from 'express-session';
import { Observable } from 'rxjs';

@Injectable()
export class PreviousUrlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    if (
      request.method.toUpperCase() === 'GET' &&
      request.accepts(['html', 'text', 'json']) !== 'json'
    ) {
      const session: Session & { [key: string]: any } = request.session;
      session._previousUrl = request.url;
      return next.handle();
    }

    return next.handle();
  }
}
