import {
    ApplicationConfig,
    importProvidersFrom,
    provideBrowserGlobalErrorListeners,
    provideZoneChangeDetection,
} from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { connectAuthEmulator } from '@angular/fire/auth';
import { connectFirestoreEmulator } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import {
    LucideAngularModule,
    AtSign,
    Lock,
    LockKeyhole,
    CircleCheck,
    Eye,
    EyeOff,
    LoaderCircle,
    LogIn,
    UserPlus,
    House,
    CircleX,
    MailCheck,
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
    providers: [
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideFirestore(() => {
            const firestore = getFirestore();
            if (environment.useEmulators) {
                connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
            }
            return firestore;
        }),
        provideAuth(() => {
            const auth = getAuth();
            if (environment.useEmulators) {
                connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
            }
            return auth;
        }),
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        importProvidersFrom(
            LucideAngularModule.pick({
                AtSign,
                Lock,
                LockKeyhole,
                CircleCheck,
                Eye,
                EyeOff,
                LoaderCircle,
                LogIn,
                UserPlus,
                House,
                CircleX,
                MailCheck,
            })
        ),
    ],
};
