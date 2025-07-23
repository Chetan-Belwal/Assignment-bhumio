import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { UserAuthGuard } from '../../../auth/guards/user-auth/user-auth.guard';
import { User } from '../../../auth/decorators/auth-user.decorator';
import { UserModel } from '../../../database/models/user.model';

@Controller('dashboard')
export class DashboardController {
  constructor() {}

  @UseGuards(UserAuthGuard)
  @Render('dashboard')
  @Get()
  public getDashboard(@User() user: UserModel) {
    console.log('User:', user);
    return { message: 'Welcome to the dashboard!' };
  }
}
