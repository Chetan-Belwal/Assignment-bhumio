import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Session } from 'express-session';
import { Observable } from 'rxjs';
import { UsersService } from '../../../users/services/users.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private readonly userService: UsersService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request & { user: any }>();
    const session: Session & { [key: string]: any } = request.session;
    if (session.auth.isAuthenticated) {
      const userId = session.auth.userId as number;

      return this.userService.findById(userId).then((user) => {
        if (user) {
          request.user = user; // Attach user to request object
          return true;
        }
        return false;
      });
    }
    return false;
  }
}
