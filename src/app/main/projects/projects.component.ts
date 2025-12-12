import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Project } from '../../models/Project';
import { ProjectService } from '../../services/project/project.service';
import { Subscription } from 'rxjs';
import { ModalComponent } from './modal/modal.component';

@Component({
    selector: 'app-projects',
    imports: [CommonModule, LucideAngularModule, ReactiveFormsModule, ModalComponent],
    templateUrl: './projects.component.html',
    styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements OnInit, OnDestroy {
    private projectService = inject(ProjectService);
    private subscription: Subscription | null = null;

    isLoading: boolean = true;
    projects: Project[] = [];
    isModalOpen: boolean = false;
    isSaving: boolean = false;
    editingProjectId: string | null = null;
    projectName: string | null = null;
    projectDescription: string | null = null;

    ngOnInit() {
        this.isLoading = true;
        this.subscription = this.projectService.getAll().subscribe({
            next: (projects) => {
                this.projects = projects;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error fetching projects:', error);
                this.isLoading = false;
            },
        });
    }

    openModal(id: string | null = null, projectName: string | null = null, projectDescription: string | null = null) {
        this.isModalOpen = true;
        this.editingProjectId = id;
        this.projectName = projectName;
        this.projectDescription = projectDescription;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    onProjectDeleted(id: string) {
        this.projectService.delete(id);
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }
}
