import { Global, Module } from '@nestjs/common';
import { BcryptService } from './bcrypt/bcrypt.service';
import { AuthController } from './controllers/auth.controller';
import { MatchValidator } from './validator/match.validator';
import { UsersModule } from '../users/users.module';
import { UserAlreadyExistsValidator } from './validator/user-already-exists.validator';
import { AuthService } from './services/auth.service';

@Global()
@Module({
  imports: [UsersModule],
  providers: [
    BcryptService,
    MatchValidator,
    UserAlreadyExistsValidator,
    AuthService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
