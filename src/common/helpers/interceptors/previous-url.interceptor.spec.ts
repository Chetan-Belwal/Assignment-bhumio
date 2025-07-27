import { Test, TestingModule } from '@nestjs/testing';
import { PreviousUrlInterceptor } from './previous-url.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('PreviousUrlInterceptor', () => {
  let interceptor: PreviousUrlInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreviousUrlInterceptor],
    }).compile();

    interceptor = module.get<PreviousUrlInterceptor>(PreviousUrlInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should save the previous URL for GET requests that accept html/text', () => {
    const mockRequest = {
      method: 'GET',
      accepts: jest.fn((types) => (types.includes('html') ? 'html' : false)),
      url: '/test-url',
      session: {},
    };
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
    const mockCallHandler = {
      handle: () => of({}),
    } as CallHandler;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

    expect(mockRequest.session).toHaveProperty('_previousUrl', '/test-url');
  });

  it('should not save the previous URL for non-GET requests', () => {
    const mockRequest = {
      method: 'POST',
      accepts: jest.fn((types) => (types.includes('html') ? 'html' : false)),
      url: '/test-url',
      session: {},
    };
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
    const mockCallHandler = {
      handle: () => of({}),
    } as CallHandler;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

    expect(mockRequest.session).not.toHaveProperty('_previousUrl');
  });

  it('should not save the previous URL for GET requests that accept json', () => {
    const mockRequest = {
      method: 'GET',
      accepts: jest.fn((types) => (types.includes('json') ? 'json' : false)),
      url: '/test-url',
      session: {},
    };
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
    const mockCallHandler = {
      handle: () => of({}),
    } as CallHandler;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe();

    expect(mockRequest.session).not.toHaveProperty('_previousUrl');
  });
});
