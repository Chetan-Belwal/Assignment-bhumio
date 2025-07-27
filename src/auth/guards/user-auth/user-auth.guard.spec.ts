import { UserAuthGuard } from './user-auth.guard';
import { AuthService } from '../../services/auth.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('UserAuthGuard', () => {
  let guard: UserAuthGuard;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthGuard,
        {
          provide: AuthService,
          useValue: {
            finUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<UserAuthGuard>(UserAuthGuard);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
