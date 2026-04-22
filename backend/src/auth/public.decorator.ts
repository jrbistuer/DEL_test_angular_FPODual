import { SetMetadata } from '@nestjs/common';

/** Metadata key used by FirebaseAuthGuard to skip token verification. */
export const IS_PUBLIC_KEY = 'isPublic';

/** Marks a route or controller as publicly accessible (no Firebase token required). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
