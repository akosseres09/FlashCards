import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'auth/login',
    },
    {
        path: 'auth',
        loadComponent: () => import('./layouts/auth/auth.component').then((m) => m.AuthComponent),
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'login',
            },
            {
                path: 'login',
                loadComponent: () =>
                    import('./auth/login/login.component').then((m) => m.LoginComponent),
            },
            {
                path: 'signup',
                loadComponent: () =>
                    import('./auth/signup/signup.component').then((m) => m.SignupComponent),
            },
            {
                path: 'not-found',
                loadComponent: () =>
                    import('./auth/not-found/not-found.component').then((m) => m.NotFoundComponent),
            },
            {
                path: '**',
                redirectTo: 'not-found',
            },
        ],
    },
];
