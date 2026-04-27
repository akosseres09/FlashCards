import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, isDevMode, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Project } from '../../../models/Project';
import { ProjectService } from '../../../services/project/project.service';
import { ProjectsModalComponent } from '../projects-modal/projects-modal.component';
import { ProjectListComponent } from '../project-list/project-list.component';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
import { filter, switchMap } from 'rxjs';

@Component({
    selector: 'app-projects',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ProjectsModalComponent,
        ProjectListComponent,
        SplitButtonModule,
        ButtonModule,
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
    private readonly destroyRef = inject(DestroyRef);

    isLoading = signal<boolean>(false);
    isModalOpen = signal<boolean>(false);
    isSaving = signal<boolean>(false);
    devMode = signal<boolean>(isDevMode());

    projects = signal<Project[]>([]);

    modalMode = signal<'edit' | 'create' | 'delete'>('create');
    editingProjectId = signal<string | null>(null);
    projectName = signal<string | null>(null);
    projectDescription = signal<string | null>(null);
    user = signal<User | null>(null);

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
        this.isLoading.set(true);
        this.authService.user$
            .pipe(
                filter((user): user is User => !!user),
                switchMap((user) => {
                    this.user.set(user);
                    return this.projectService.getOwnProjects(user.uid);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (ownProjects) => {
                    this.projects.set(ownProjects);
                    this.isLoading.set(false);
                },
                error: (err) => {
                    console.error(err);
                    this.toastService.show('Failed to load projects', 'error');
                    this.isLoading.set(false);
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
        this.isModalOpen.set(true);
        this.modalMode.set(mode);
        this.projectName.set(data.name);
        this.editingProjectId.set(data.id);
        this.projectDescription.set(data.description);
    }

    closeModal() {
        this.isModalOpen.set(false);
    }

    onProjectDeleted(id: string) {
        this.projectService
            .delete(id)
            .then(() => {
                this.toastService.show('Project deleted successfully');
                this.projects.update((projects) => projects.filter((project) => project.id !== id));
            })
            .catch((err) => {
                console.error(err);
                this.toastService.show('Failed to delete project', 'error');
            });
    }
}
