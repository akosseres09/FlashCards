import { Component, computed, inject, input, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, fromEvent } from 'rxjs';
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
                if (url.match(/^\/projects(\/shared)?$/)) {
                    this.context.set('projects');
                } else {
                    this.context.set('view');
                }
            });

        fromEvent(window, 'resize')
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
                if (window.innerWidth >= 768) {
                    this.sidebarService.close();
                }
            });
    }

    readonly items = computed<NavItem[]>(() => {
        const pid = this.projectId();

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
                        route: ['/projects/shared'],
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
                        route: ['/project', pid],
                        exact: true,
                    },
                    {
                        label: 'Members',
                        icon: 'pi pi-users',
                        route: ['/project', pid, 'members'],
                    },
                    {
                        label: 'Invite',
                        icon: 'pi pi-user-plus',
                        route: ['/project', pid, 'invite'],
                    },
                ];
            default:
                return [];
        }
    });
}
