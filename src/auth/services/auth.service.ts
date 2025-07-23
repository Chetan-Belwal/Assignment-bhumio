import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { BcryptService } from '../bcrypt/bcrypt.service';
import { UsersService } from '../../users/services/users.service';
import { Request } from 'express';
import { Session } from 'express-session';
import { UserModel } from '../../database/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashService: BcryptService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Creates a new user.
   * @param userInfo
   * @returns
   */
  public async createUser(userInfo: Partial<UserModel>): Promise<UserModel> {
    const hashedPassword = await this.hashService.createHash(userInfo.password);
    return this.usersService.create({
      ...userInfo,
      password: hashedPassword,
    });
  }

  /**
   * Validates a user's credentials.
   * @param email
   * @param password
   * @param req
   * @returns
   */
  public async validateUser(email: string, password: string, req: Request) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      const isPasswordValid = await this.hashService.compare(
        password,
        user.password,
      );
      console.log('User validation:', isPasswordValid);
      if (isPasswordValid) {
        const session: Session & { [key: string]: any } = req.session;

        session.auth = {
          isAuthenticated: true,
          userId: user.id,
        };

        session.save();
        return;
      }
    }
    throw new UnprocessableEntityException([
      {
        constraints: {
          email: 'Invalid email or password',
        },
      },
    ]);
  }
}
