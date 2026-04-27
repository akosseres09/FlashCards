import { Component, computed, inject, input, signal } from '@angular/core';
import {
    ActivatedRoute,
    NavigationEnd,
    Router,
    RouterLink,
    RouterLinkActive,
} from '@angular/router';
import { filter, map } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { SidebarService } from './sidebar.service';

interface NavItem {
    label: string;
    icon: string;
    route: string[];
    exact?: boolean;
}

@Component({
    selector: 'app-sidebar',
    imports: [CommonModule, RouterLink, TooltipModule, RouterLinkActive],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
    readonly sidebarService = inject(SidebarService);
    private readonly router = inject(Router);
    private readonly activeRoute = inject(ActivatedRoute);

    readonly projectId = input.required<string>();
    readonly context = signal<'projects' | 'view' | null>(null);

    constructor() {
        this.router.events
            .pipe(
                filter((event): event is NavigationEnd => event instanceof NavigationEnd),
                takeUntilDestroyed(),
            )
            .subscribe((event) => {
                const url = event.urlAfterRedirects;
                if (url.match(/^\/projects$/)) {
                    this.context.set('projects');
                } else {
                    this.context.set('view');
                }
            });
    }

    readonly items = computed<NavItem[]>(() => {
        const pid = this.projectId();
        console.log(pid, this.context());

        switch (this.context()) {
            case 'projects':
                return [
                    {
                        label: 'My Projects',
                        icon: 'pi pi-folder',
                        route: ['/projects'],
                        exact: true,
                    },
                    {
                        label: 'Shared with Me',
                        icon: 'pi pi-share-alt',
                        route: ['/projects'],
                        exact: true,
                        noActive: true,
                    },
                ];
            case 'view':
                if (!pid) return [];
                return [
                    {
                        label: 'Cards',
                        icon: 'pi pi-clone',
                        route: ['/projects', pid],
                        exact: true,
                    },
                    {
                        label: 'Members',
                        icon: 'pi pi-users',
                        route: ['/projects', pid, 'members'],
                    },
                    {
                        label: 'Invite',
                        icon: 'pi pi-user-plus',
                        route: ['/projects', pid, 'invite'],
                    },
                ];
            default:
                return [];
        }
    });
}
