import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { SignupDto } from '../dtos/signup.dto';
import { LoginDto } from '../dtos/login.dto';
import { UserModel } from '../../database/models/user.model';
import { getMockReq, getMockRes } from '@jest-mock/express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            createUser: jest.fn(),
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signupPage', () => {
    it('should render the signup page', () => {
      // This is a simple render method, no complex logic to test beyond ensuring it exists.
      expect(controller.signupPage()).toBeUndefined(); // Render methods typically return void or undefined
    });
  });

  describe('loginPage', () => {
    it('should render the login page', () => {
      // Similar to signupPage, just ensuring it exists.
      expect(controller.loginPage()).toBeUndefined();
    });
  });

  describe('signup', () => {
    it('should create a new user and return the user model', async () => {
      const signupDto: SignupDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password',
      };
      const expectedUser: UserModel = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserModel;

      jest.spyOn(authService, 'createUser').mockResolvedValue(expectedUser);

      const result = await controller.signup(signupDto);
      expect(result).toEqual(expectedUser);
      expect(authService.createUser).toHaveBeenCalledWith(signupDto);
    });
  });

  describe('login', () => {
    it('should validate user and redirect to dashboard on success', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const req = getMockReq();
      const { res } = getMockRes();

      jest.spyOn(authService, 'validateUser').mockResolvedValue(true);

      await controller.login(loginDto, req, res);

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
        req,
      );
      expect(res.redirect).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle validation failure and not redirect', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const req = getMockReq();
      const { res } = getMockRes();

      jest
        .spyOn(authService, 'validateUser')
        .mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(loginDto, req, res)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
        req,
      );
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });
});
