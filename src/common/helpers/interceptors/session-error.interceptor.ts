import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';
import { VALIDATION_ERROR } from '../../filters/validation-error.filter';

@Injectable()
export class SessionErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const errorBagFromFlash: string[] = request.flash(VALIDATION_ERROR);
    if (errorBagFromFlash.length > 0) {
      const err: object = JSON.parse(errorBagFromFlash[0]) as object;

      const formattedError = Object.values(err).flat();

      return next.handle().pipe(
        map((templateContext: { [key: string]: any } = {}) => {
          templateContext['errors'] = formattedError;
          return templateContext;
        }),
      );
    }

    return next.handle();
  }
}
