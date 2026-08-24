import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { SidebarComponent } from '../../common/sidebar/sidebar.component';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-main',
    imports: [RouterOutlet, NavbarComponent, SidebarComponent],
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss',
})
export class MainComponent {
    private readonly router = inject(Router);
    private readonly activeRoute = inject(ActivatedRoute);
    protected readonly projectId = signal<string>('');

    constructor() {
        this.router.events
            .pipe(
                filter((event): event is NavigationEnd => event instanceof NavigationEnd),
                takeUntilDestroyed(),
            )
            .subscribe((event) => {
                let current = this.activeRoute.root;

                while (current.firstChild) {
                    current = current.firstChild;
                }

                this.projectId.set(current.snapshot.paramMap.get('projectId') ?? '');
            });
    }
}
