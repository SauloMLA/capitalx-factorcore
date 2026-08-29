import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  function createMockContext(user?: any): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  }

  it('should allow access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext({ role: UserRole.OPERATOR });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has the required ADMINISTRATOR role', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMINISTRATOR]);
    const context = createMockContext({ role: UserRole.ADMINISTRATOR });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException when user has OPERATOR role instead of ADMINISTRATOR', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMINISTRATOR]);
    const context = createMockContext({ role: UserRole.OPERATOR });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user role is missing', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMINISTRATOR]);
    const context = createMockContext({});
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user object is missing', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMINISTRATOR]);
    const context = createMockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
