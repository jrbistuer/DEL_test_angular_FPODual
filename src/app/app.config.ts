import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp } from "firebase/app";
import { routes } from './app.routes';
import { provideFirebaseApp } from '@angular/fire/app';
import { getAuth } from 'firebase/auth/web-extension';
import { provideAuth } from '@angular/fire/auth';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      })
    }),
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyDbU4OLAwpBqj9od5QIyjp584cyrwjXXbI",
      authDomain: "del-test-fundesplai.firebaseapp.com",
      projectId: "del-test-fundesplai",
      storageBucket: "del-test-fundesplai.firebasestorage.app",
      messagingSenderId: "11717140564",
      appId: "1:11717140564:web:4f6ceae6ce8a20dc5b4dc1",
      measurementId: "G-Y295ZNH0RH"
    })),
    provideAuth(() => getAuth()),
  ]
};
