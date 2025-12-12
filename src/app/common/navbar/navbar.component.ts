import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, RouterLinkActive, CommonModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
    authService = inject(AuthService);
    user$ = this.authService.user$;

    logout() {
        this.authService.logout();
    }
}
