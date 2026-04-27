import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { InvitationService } from '../../services/invitation/invitation.service';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { DrawerModule } from 'primeng/drawer';
import { PopoverModule } from 'primeng/popover';
import { LogoComponent } from '../logo/logo.component';
import { InvitationInboxComponent } from '../invitation-inbox/invitation-inbox.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { PrimeIcons } from 'primeng/api';
import { switchMap, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type MenuItem = {
    label: string;
    icon: string;
    route: string | string[];
    show: boolean;
    showBreak?: boolean;
};
@Component({
    selector: 'app-navbar',
    imports: [
        RouterLink,
        RouterLinkActive,
        CommonModule,
        LucideAngularModule,
        ButtonModule,
        AvatarModule,
        BadgeModule,
        DrawerModule,
        PopoverModule,
        LogoComponent,
        InvitationInboxComponent,
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
    authService = inject(AuthService);
    private readonly invitationService = inject(InvitationService);
    private readonly destroyRef = inject(DestroyRef);
    router = inject(Router);
    userSignal = toSignal(this.authService.user$);
    user = computed(() => this.userSignal());
    isMobileMenuOpen = false;
    isInboxOpen = signal(false);

    pendingInviteCount = signal(0);

    constructor() {
        // Subscribe to pending invitation count whenever the user changes
        this.authService.user$
            .pipe(
                switchMap((user) => {
                    if (!user?.email) return of([]);
                    return this.invitationService.getByEmail(user.email);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((invites) => this.pendingInviteCount.set(invites.length));
    }

    menuItems = computed<MenuItem[]>(() => {
        const user = this.user();
        return [
            {
                label: 'Login',
                icon: PrimeIcons.SIGN_IN,
                route: '/auth/login',
                show: !user,
            },
            {
                label: 'Sign Up',
                icon: PrimeIcons.USER_PLUS,
                route: '/auth/signup',
                show: !user,
                showBreak: true,
            },
            {
                label: 'Projects',
                icon: PrimeIcons.FOLDER,
                route: '/projects',
                show: !!user,
            },
        ];
    });

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
    }

    logout() {
        this.authService
            .logout()
            .then(() => {
                this.closeMobileMenu();
                this.router.navigate(['/auth/login']);
            })
            .catch((error) => {
                console.error('Logout failed:', error);
            });
    }
}
