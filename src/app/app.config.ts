import {
    ApplicationConfig,
    importProvidersFrom,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, getApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { getFunctions, connectFunctionsEmulator, provideFunctions } from '@angular/fire/functions';

import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { AppTheme } from './primeng-theme';
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
    Settings,
    LogOut,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Github,
    Linkedin,
    Twitter,
    FolderOpen,
    Plus,
    FileText,
    Clock,
    Play,
    Pencil,
    Trash2,
    X,
    Upload,
    HelpCircle,
    CheckCircle,
    RotateCw,
    Info,
    TriangleAlert,
    Menu,
} from 'lucide-angular';

const app = initializeApp(environment.firebaseConfig);

export const appConfig: ApplicationConfig = {
    providers: [
        provideFirebaseApp(() => getApp(app.name)),
        provideAppInitializer(() => {
            const firestore = getFirestore();
            const auth = getAuth();
            const functions = getFunctions();
            if (environment.useEmulators) {
                connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
                connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
                connectFunctionsEmulator(functions, '127.0.0.1', 5001);
            }
        }),
        provideAuth(() => getAuth()),
        provideFunctions(() => getFunctions()),
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideAnimations(),
        provideRouter(
            routes,
            withComponentInputBinding(),
            withRouterConfig({ paramsInheritanceStrategy: 'always' }),
        ),
        providePrimeNG({
            theme: {
                preset: AppTheme,
                options: {
                    darkModeSelector: '.dark',
                    cssLayer: {
                        name: 'primeng',
                        order: 'base, primeng, utilities',
                    },
                },
            },
        }),
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
                LogOut,
                Settings,
                ChevronDown,
                ChevronUp,
                ChevronLeft,
                ChevronRight,
                Menu,
                Github,
                Linkedin,
                Twitter,
                FolderOpen,
                Plus,
                FileText,
                Clock,
                Play,
                Pencil,
                Trash2,
                X,
                Upload,
                HelpCircle,
                CheckCircle,
                RotateCw,
                Info,
                TriangleAlert,
            }),
        ),
    ],
};
