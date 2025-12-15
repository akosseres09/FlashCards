import { Routes } from '@angular/router';
import { unauthenticatedGuard } from './guards/unauthenticated/unauthenticated.guard';
import { unverifiedGuard } from './guards/unverified/unverified.guard';
import { authenticatedGuard } from './guards/authenticated/authenticated.guard';

export const routes: Routes = [
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
                canActivate: [unauthenticatedGuard],
            },
            {
                path: 'signup',
                loadComponent: () =>
                    import('./auth/signup/signup.component').then((m) => m.SignupComponent),
                canActivate: [unauthenticatedGuard],
            },
            {
                path: 'verify-email',
                loadComponent: () =>
                    import('./auth/verify-email/verify-email.component').then(
                        (m) => m.VerifyEmailComponent
                    ),
                canActivate: [unverifiedGuard],
            },
            {
                path: 'not-found',
                loadComponent: () =>
                    import('./auth/not-found/not-found.component').then((m) => m.NotFoundComponent),
                canActivate: [unauthenticatedGuard],
            },
            {
                path: '**',
                redirectTo: 'not-found',
            },
        ],
    },
    {
        path: '',
        loadComponent: () => import('./layouts/main/main.component').then((m) => m.MainComponent),
        canActivate: [authenticatedGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'projects',
            },
            {
                path: 'projects',
                loadComponent: () =>
                    import('./main/projects/projects.component').then((m) => m.ProjectsComponent),
            },
            {
                path: 'projects/:id',
                loadComponent: () =>
                    import('./main/projects/view/view.component').then((m) => m.ViewComponent),
            },
        ],
    },
];
