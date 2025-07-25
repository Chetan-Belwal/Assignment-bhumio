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
      if (isPasswordValid) {
        const session: Session & { [key: string]: any } = req.session;

        session.auth = {
          isAuthenticated: true,
          userId: user.id,
        };
        return new Promise((res, rej) => {
          session.save((err) => {
            if (err instanceof Error) {
              rej(err);
              return;
            }
            res(true);
          });
        });
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
  /**
   * Finds a user by ID.
   * @param id
   * @returns
   */

  public finUserById(id: number): Promise<UserModel | null> {
    return this.usersService.findById(id);
  }
}
