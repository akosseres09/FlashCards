import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, isDevMode, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Project } from '../../models/Project';
import { ProjectService } from '../../services/project/project.service';
import { filter, switchMap } from 'rxjs';
import { ProjectsModalComponent } from './projects-modal/projects-modal.component';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';
import { RouterLink, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SplitButtonModule } from 'primeng/splitbutton';

@Component({
    selector: 'app-projects',
    imports: [
        CommonModule,
        LucideAngularModule,
        ReactiveFormsModule,
        ProjectsModalComponent,
        RouterLink,
        SplitButtonModule,
    ],
    templateUrl: './projects.component.html',
    styleUrl: './projects.component.scss',
    host: {
        class: 'flex-1 flex flex-col',
    },
})
export class ProjectsComponent implements OnInit {
    private readonly projectService = inject(ProjectService);
    private readonly authService = inject(AuthService);
    private readonly toastService = inject(ToastService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    isLoading: boolean = true;
    isModalOpen: boolean = false;
    isSaving: boolean = false;
    devMode: boolean = isDevMode();

    projects: Project[] = [];
    modalMode: 'edit' | 'create' | 'delete' = 'create';
    editingProjectId: string | null = null;
    projectName: string | null = null;
    projectDescription: string | null = null;
    user: User | null = null;

    toastItems = [
        {
            label: 'Success',
            command: () => this.toastService.show('This is a success message', 'success'),
        },
        {
            label: 'Info',
            command: () => this.toastService.show('This is an info message', 'info'),
        },
        {
            label: 'Warning',
            command: () => this.toastService.show('This is a warning message', 'warning'),
        },
        {
            label: 'Error',
            command: () => this.toastService.show('This is an error message', 'error'),
        },
    ];

    ngOnInit() {
        this.isLoading = true;
        this.authService.user$
            .pipe(
                filter((user): user is User => !!user),
                switchMap((user) => {
                    this.user = user;
                    return this.projectService.getOwnProjects(user.uid);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (projects) => {
                    this.projects = projects;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.toastService.show('Failed to load projects', 'error');
                    this.isLoading = false;
                },
            });
    }

    openModal(
        mode: 'edit' | 'create' | 'delete' = 'create',
        data: { id: string | null; name: string | null; description: string | null } = {
            id: null,
            name: null,
            description: null,
        },
    ) {
        this.isModalOpen = true;
        this.modalMode = mode;
        this.projectName = data.name;
        this.editingProjectId = data.id;
        this.projectDescription = data.description;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    onProjectDeleted(id: string) {
        this.projectService
            .delete(id)
            .then(() => {
                this.toastService.show('Project deleted successfully');
            })
            .catch((err) => {
                console.error(err);
                this.toastService.show('Failed to delete project', 'error');
            });
    }
}
