import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';

/** Provider that initialises a single firebase-admin App instance. */
const firebaseAppProvider = {
  provide: 'FIREBASE_APP',
  useFactory: (): admin.app.App => {
    // Reuse existing app if already initialised (e.g. in tests)
    if (admin.apps.length) return admin.apps[0] as admin.app.App;

    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (json) {
      const serviceAccount = JSON.parse(json) as admin.ServiceAccount;
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    // Fallback to ADC when running on GCP / Railway with workload identity
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  },
};

/** Global module that exposes the FIREBASE_APP token to the whole app. */
@Global()
@Module({
  providers: [firebaseAppProvider],
  exports: [firebaseAppProvider],
})
export class FirebaseAdminModule {}
