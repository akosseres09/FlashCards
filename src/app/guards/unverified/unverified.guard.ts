import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { map, take } from 'rxjs/operators';

export const unverifiedGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.user$.pipe(
        take(1),
        map((user) => {
            if (!user) {
                router.navigate(['/auth/login']);
                return false;
            }

            if (user.emailVerified) {
                router.navigate(['/projects']);
                return false;
            }

            return true;
        })
    );
};
