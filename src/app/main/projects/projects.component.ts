import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Project } from '../../models/Project';
import { ProjectService } from '../../services/project/project.service';
import { filter, Subscription, switchMap } from 'rxjs';
import { ModalComponent } from './modal/modal.component';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';

@Component({
    selector: 'app-projects',
    imports: [CommonModule, LucideAngularModule, ReactiveFormsModule, ModalComponent],
    templateUrl: './projects.component.html',
    styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements OnInit, OnDestroy {
    private projectService = inject(ProjectService);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);

    private subscription: Subscription | null = null;

    isLoading: boolean = true;
    projects: Project[] = [];
    isModalOpen: boolean = false;
    isSaving: boolean = false;
    editingProjectId: string | null = null;
    projectName: string | null = null;
    projectDescription: string | null = null;
    user: User | null = null;

    ngOnInit() {
        this.isLoading = true;
        this.subscription = this.authService.user$
            .pipe(
                filter((user): user is User => !!user),
                switchMap((user) => {
                    this.user = user;
                    return this.projectService.getOwnProjects(user.uid);
                })
            )
            .subscribe({
                next: (projects) => {
                    this.projects = projects;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.isLoading = false;
                },
            });
    }

    openModal(
        id: string | null = null,
        projectName: string | null = null,
        projectDescription: string | null = null
    ) {
        this.isModalOpen = true;
        this.editingProjectId = id;
        this.projectName = projectName;
        this.projectDescription = projectDescription;
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

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }
}
