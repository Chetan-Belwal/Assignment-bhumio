import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { UserAuthGuard } from '../../../auth/guards/user-auth/user-auth.guard';
import { UserModel } from '../../../database/models/user.model';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return a welcome message', () => {
      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      } as UserModel;

      const result = controller.getDashboard(user);

      expect(result).toEqual({ message: 'Welcome to the dashboard!' });
    });
  });
});
