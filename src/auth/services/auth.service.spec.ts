import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { BcryptService } from '../bcrypt/bcrypt.service';
import { UsersService } from '../../users/services/users.service';
import { UserModel } from '../../database/models/user.model';
import { getMockReq } from '@jest-mock/express';
import { UnprocessableEntityException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let bcryptService: BcryptService;
  let usersService: UsersService;

  const mockUser: UserModel = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: BcryptService,
          useValue: {
            createHash: jest.fn(),
            compare: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    bcryptService = module.get<BcryptService>(BcryptService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should hash the password and create a user', async () => {
      const userInfo = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
      };
      const hashedPassword = 'hashedpassword';
      const createdUser: UserModel = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserModel;

      jest.spyOn(bcryptService, 'createHash').mockResolvedValue(hashedPassword);
      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

      const result = await service.createUser(userInfo);

      expect(bcryptService.createHash).toHaveBeenCalledWith(userInfo.password);
      expect(usersService.create).toHaveBeenCalledWith({
        ...userInfo,
        password: hashedPassword,
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('validateUser', () => {
    it('should throw UnprocessableEntityException for invalid email', async () => {
      const req = getMockReq();
      (req.session as any) = {
        auth: {},
        save: (cb: (err: Error | null) => void) => cb(null),
      }; // Initialize session and mock save
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.validateUser('nonexistent@example.com', 'password', req),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
      expect(bcryptService.compare).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException for invalid password', async () => {
      const req = getMockReq();
      (req.session as any) = {
        save: (cb: (err: Error | null) => void) => cb(null),
      }; // Initialize session and mock save
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcryptService, 'compare').mockResolvedValue(false);

      await expect(
        service.validateUser(mockUser.email, 'wrongpassword', req),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(usersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(bcryptService.compare).toHaveBeenCalledWith(
        'wrongpassword',
        mockUser.password,
      );
      expect((req.session as any).auth).toBeUndefined(); // Session should not be set
    });

    it('should handle session save error', async () => {
      const req = getMockReq();
      (req.session as any) = {
        auth: {},
        save: (cb: (err: Error | null) => void) =>
          cb(new Error('Session save error')),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcryptService, 'compare').mockResolvedValue(true);

      await expect(
        service.validateUser(mockUser.email, 'password', req),
      ).rejects.toThrow('Session save error');
    });
  });

  describe('finUserById', () => {
    it('should find a user by ID', async () => {
      const userId = 1;
      const mockUser: UserModel = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserModel;

      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      const result = await service.finUserById(userId);

      expect(usersService.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found by ID', async () => {
      const userId = 999;
      jest.spyOn(usersService, 'findById').mockResolvedValue(null);

      const result = await service.finUserById(userId);

      expect(usersService.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });
});
