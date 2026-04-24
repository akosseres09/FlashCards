import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';
import { PopoverModule } from 'primeng/popover';
import { LogoComponent } from '../logo/logo.component';

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
    user$ = this.authService.user$;
    isMobileMenuOpen = false;

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
