import { Global, Module } from '@nestjs/common';
import { BcryptService } from './bcrypt/bcrypt.service';

@Global()
@Module({
  providers: [BcryptService],
})
export class AuthModule {}
