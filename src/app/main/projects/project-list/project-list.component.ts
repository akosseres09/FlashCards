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
    projects = input.required<Project[]>();
    isLoading = input<boolean>(false);

    /** Show Edit / Delete action buttons on each card */
    showActions = input<boolean>(false);

    /** projectId → role string, for displaying a role badge */
    roleMap = input<Record<string, string>>({});

    /** Empty state configuration */
    emptyIcon = input<string>('pi pi-folder-open');
    emptyTitle = input<string>('No Projects');
    emptyText = input<string>('');
    emptyActionLabel = input<string | null>(null);

    emptyActionClick = output<void>();
    editClick = output<Project>();
    deleteClick = output<Project>();
}
