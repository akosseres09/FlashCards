import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, RouterLinkActive, CommonModule, LucideAngularModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
    authService = inject(AuthService);
    router = inject(Router);
    user$ = this.authService.user$;
    isDropdownOpen = false;

    toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    closeDropdown() {
        this.isDropdownOpen = false;
    }

    logout() {
        this.authService
            .logout()
            .then(() => {
                this.closeDropdown();
                this.router.navigate(['/auth/login']);
            })
            .catch((error) => {
                console.error('Logout failed:', error);
            });
    }
}
