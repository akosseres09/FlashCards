import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';

export const authenticatedGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.user$.pipe(
        take(1),
        map((user) => {
            if (!user) {
                router.navigate(['/auth/login']);
                return false;
            }

            if (!user.emailVerified) {
                router.navigate(['/auth/verify-email']);
                return false;
            }

            return true;
        })
    );
};
