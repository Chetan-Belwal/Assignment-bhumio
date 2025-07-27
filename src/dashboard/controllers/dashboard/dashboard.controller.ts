import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { UserAuthGuard } from '../../../auth/guards/user-auth/user-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor() {}

  @UseGuards(UserAuthGuard)
  @Render('dashboard')
  @Get()
  public getDashboard() {
    return { message: 'Welcome to the dashboard!' };
  }
}
