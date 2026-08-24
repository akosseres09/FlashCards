import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Project } from '../../../models/Project';

@Component({
    selector: 'app-project-list',
    imports: [CommonModule, RouterLink, ButtonModule],
    templateUrl: './project-list.component.html',
    styleUrl: './project-list.component.scss',
})
export class ProjectListComponent {
    readonly projects = input.required<Project[]>();
    readonly isLoading = input<boolean>(false);

    /** Show Edit / Delete action buttons on each card */
    readonly showActions = input<boolean>(false);

    /** projectId → role string, for displaying a role badge */
    readonly roleMap = input<Record<string, string>>({});

    /** Empty state configuration */
    readonly emptyIcon = input<string>('pi pi-folder-open');
    readonly emptyTitle = input<string>('No Projects');
    readonly emptyText = input<string>('');
    readonly emptyActionLabel = input<string | null>(null);

    readonly emptyActionClick = output<void>();
    readonly editClick = output<Project>();
    readonly deleteClick = output<Project>();
}
