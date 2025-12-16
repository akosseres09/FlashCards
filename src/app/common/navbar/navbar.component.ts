import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, RouterLinkActive, CommonModule, LucideAngularModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
    animations: [
        trigger('slideInLeft', [
            transition(':enter', [
                style({
                    transform: 'translateX(100px)',
                    opacity: 0,
                }),
                animate(
                    '200ms ease-out',
                    style({
                        transform: 'translateX(0)',
                        opacity: 1,
                    })
                ),
            ]),
            transition(':leave', [
                animate(
                    '200ms ease-in',
                    style({
                        transform: 'translateX(100px)',
                        opacity: 0,
                    })
                ),
            ]),
        ]),
        trigger('backdropFade', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('200ms ease-out', style({ opacity: 1 })),
            ]),
            transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
        ]),
    ],
})
export class NavbarComponent {
    authService = inject(AuthService);
    router = inject(Router);
    user$ = this.authService.user$;
    isDropdownOpen = false;
    isMobileMenuOpen = false;

    toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    closeDropdown() {
        this.isDropdownOpen = false;
    }

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
                this.closeDropdown();
                this.closeMobileMenu();
                this.router.navigate(['/auth/login']);
            })
            .catch((error) => {
                console.error('Logout failed:', error);
            });
    }
}
