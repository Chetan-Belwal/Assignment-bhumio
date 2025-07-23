import { Get, Controller, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Redirect('auth/login')
  @Get()
  root() {
    return { message: 'Hello world!' };
  }
}
