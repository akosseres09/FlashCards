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
import { MenuItem, PrimeIcons } from 'primeng/api';
import { LogoComponent } from '../logo/logo.component';
import { InvitationInboxComponent } from '../invitation-inbox/invitation-inbox.component';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, of, fromEvent } from 'rxjs';

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
    host: {
        class: 'block h-[70px]',
    },
})
export class NavbarComponent {
    private readonly authService = inject(AuthService);
    private readonly invitationService = inject(InvitationService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly router = inject(Router);

    readonly userSignal = toSignal(this.authService.user$);
    readonly user = computed(() => this.userSignal());
    readonly isMobileMenuOpen = signal(false);
    readonly isInboxOpen = signal(false);
    readonly pendingInviteCount = signal(0);

    readonly menuItems = computed<MenuItem[]>(() => {
        const user = this.user();
        return [
            {
                label: 'Login',
                icon: PrimeIcons.SIGN_IN,
                routerLink: '/auth/login',
                visible: !user,
            },
            {
                label: 'Sign Up',
                icon: PrimeIcons.USER_PLUS,
                routerLink: '/auth/signup',
                visible: !user,
            },
            {
                label: 'Projects',
                icon: PrimeIcons.FOLDER,
                routerLink: '/projects',
                visible: !!user,
            },
        ];
    });

    readonly mobileMenuItems = computed<MenuItem[]>(() => {
        const user = this.user();
        return [
            {
                label: 'Login',
                icon: PrimeIcons.SIGN_IN,
                routerLink: '/auth/login',
                visible: !user,
                command: () => this.closeMobileMenu(),
            },
            {
                label: 'Sign Up',
                icon: PrimeIcons.USER_PLUS,
                routerLink: '/auth/signup',
                visible: !user,
                command: () => this.closeMobileMenu(),
            },
            {
                label: 'Projects',
                icon: PrimeIcons.FOLDER,
                routerLink: '/projects',
                visible: !!user,
                command: () => this.closeMobileMenu(),
            },
            {
                label: 'Settings',
                icon: PrimeIcons.COG,
                routerLink: '/settings',
                visible: !!user,
                command: () => this.closeMobileMenu(),
            },
            { separator: true, visible: !!user },
            {
                label: 'Logout',
                icon: PrimeIcons.SIGN_OUT,
                visible: !!user,
                command: () => this.logout(),
            },
        ];
    });

    constructor() {
        // Subscribe to pending invitation count whenever the user changes
        this.authService.user$
            .pipe(
                switchMap((user) => {
                    if (!user || !user.email) return of([]);
                    return this.invitationService.getByEmail(user.email);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((invites) => this.pendingInviteCount.set(invites.length));

        fromEvent(window, 'resize')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                if (window.innerWidth >= 768) {
                    this.isMobileMenuOpen.set(false);
                }
            });
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
    }

    closeMobileMenu() {
        this.isMobileMenuOpen.set(false);
    }

    runCommand(item: MenuItem, event: Event) {
        item.command?.({ originalEvent: event, item });
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
