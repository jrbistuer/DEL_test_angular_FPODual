import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as admin from 'firebase-admin';
import { IS_PUBLIC_KEY } from './public.decorator';

/** Guard that verifies Firebase Bearer tokens on every non-public route. */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject('FIREBASE_APP') private readonly firebaseApp: admin.app.App,
    private readonly reflector: Reflector,
  ) {}

  /** Returns true when the token is valid or the route is marked @Public(). */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: admin.auth.DecodedIdToken;
    }>();

    const authHeader = request.headers.authorization ?? '';
    if (!authHeader.startsWith('Bearer ')) throw new UnauthorizedException();

    const token = authHeader.split(' ')[1];
    try {
      // Verify the token with Firebase and attach the decoded claims to the request
      request.user = await this.firebaseApp.auth().verifyIdToken(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
