import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';
import { PopoverModule } from 'primeng/popover';
import { LogoComponent } from '../logo/logo.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { PrimeIcons } from 'primeng/api';

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
        DrawerModule,
        PopoverModule,
        LogoComponent,
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
    authService = inject(AuthService);
    router = inject(Router);
    userSignal = toSignal(this.authService.user$);
    user = computed(() => this.userSignal());
    isMobileMenuOpen = false;

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
