import { Test, TestingModule } from '@nestjs/testing';
import { SessionErrorInterceptor } from './session-error.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { VALIDATION_ERROR } from '../../filters/validation-error.filter';

describe('SessionErrorInterceptor', () => {
  let interceptor: SessionErrorInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionErrorInterceptor],
    }).compile();

    interceptor = module.get<SessionErrorInterceptor>(SessionErrorInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should add formatted errors to template context if flash has VALIDATION_ERROR', (done) => {
    const mockRequest = {
      flash: jest.fn((key: string) => {
        if (key === VALIDATION_ERROR) {
          return [
            JSON.stringify({
              email: ['Invalid email'],
              password: ['Password too short'],
            }),
          ];
        }
        return [];
      }),
    };
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
    const mockCallHandler = {
      handle: () => of({ initialContext: 'value' }),
    } as CallHandler;

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((data) => {
        expect(mockRequest.flash).toHaveBeenCalledWith(VALIDATION_ERROR);
        expect(data).toEqual({
          initialContext: 'value',
          errors: ['Invalid email', 'Password too short'],
        });
        done();
      });
  });

  it('should not modify template context if flash does not have VALIDATION_ERROR', (done) => {
    const mockRequest = {
      flash: jest.fn((key: string) => {
        if (key === VALIDATION_ERROR) {
          return [];
        }
        return [];
      }),
    };
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
    const mockCallHandler = {
      handle: () => of({ initialContext: 'value' }),
    } as CallHandler;

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((data) => {
        expect(mockRequest.flash).toHaveBeenCalledWith(VALIDATION_ERROR);
        expect(data).toEqual({ initialContext: 'value' });
        done();
      });
  });
});
