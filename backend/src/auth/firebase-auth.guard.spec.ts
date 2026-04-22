import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { IS_PUBLIC_KEY } from './public.decorator';

/** Builds a minimal ExecutionContext mock with configurable request headers. */
function buildContext(
  headers: Record<string, string> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestExtra: Record<string, any> = {},
): ExecutionContext {
  const request = { headers, ...requestExtra };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let verifyIdToken: jest.Mock;

  beforeEach(async () => {
    verifyIdToken = jest.fn();

    const mockFirebaseApp = {
      auth: () => ({ verifyIdToken }),
    };

    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        { provide: 'FIREBASE_APP', useValue: mockFirebaseApp },
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
  });

  afterEach(() => jest.clearAllMocks());

  // A request without an Authorization header must be rejected immediately
  it('missing Authorization header throws UnauthorizedException', async () => {
    const ctx = buildContext({});

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  // Any header that is not a Bearer token must be rejected without calling Firebase
  it('header not starting with "Bearer " throws UnauthorizedException', async () => {
    const ctx = buildContext({ authorization: 'Basic sometoken' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  // Firebase rejection (expired / revoked token) must surface as 401, not 500
  it('verifyIdToken rejects throws UnauthorizedException', async () => {
    verifyIdToken.mockRejectedValueOnce(new Error('token expired'));
    const ctx = buildContext({ authorization: 'Bearer badtoken' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  // A valid token must allow the request through and attach the decoded claims
  it('valid token returns true and attaches decoded user to request.user', async () => {
    const decoded = { uid: 'user1', email: 'u@example.com' };
    verifyIdToken.mockResolvedValueOnce(decoded);
    const requestObj = { headers: { authorization: 'Bearer goodtoken' } };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => requestObj }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(verifyIdToken).toHaveBeenCalledWith('goodtoken');
    expect((requestObj as { user?: unknown }).user).toBe(decoded);
  });

  // Public routes must bypass Firebase entirely — no token should be required
  it('route decorated with @Public() returns true without calling verifyIdToken', async () => {
    reflector.getAllAndOverride.mockImplementation((key: string) =>
      key === IS_PUBLIC_KEY ? true : false,
    );
    const ctx = buildContext({});

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });
});
