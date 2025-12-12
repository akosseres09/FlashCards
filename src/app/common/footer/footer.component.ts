import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from "lucide-angular";

@Component({
    selector: 'app-footer',
    imports: [RouterLink, LucideAngularModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
})
export class FooterComponent {
    currentYear = new Date().getFullYear();
}
