import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { LogoComponent } from '../logo/logo.component';

@Component({
    selector: 'app-footer',
    imports: [RouterLink, ButtonModule, DividerModule, LogoComponent],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
})
export class FooterComponent {
    currentYear = new Date().getFullYear();
}
