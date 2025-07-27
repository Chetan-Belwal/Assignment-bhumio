import { Body, Controller, Get, Post, Render, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SignupDto } from '../dtos/signup.dto';
import { LoginDto } from '../dtos/login.dto';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller({ path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Render('signup')
  @Get('signup')
  public signupPage() {}

  @Render('login')
  @Get('login')
  public loginPage() {}

  @Post('signup')
  public async signup(
    @Body() userInfo: SignupDto,
    @Res() response: Response,
  ): Promise<any> {
    await this.authService.createUser(userInfo);
    return response.redirect('/auth/login');
  }

  @Post('login')
  public async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    return this.authService
      .validateUser(loginDto.email, loginDto.password, request)
      .then(() => {
        response.redirect('/dashboard');
      });
  }
}
