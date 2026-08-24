import { Component, inject, input, linkedSignal, model, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../../services/project/project.service';
import { Project } from '../../../models/Project';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../services/toast/toast.service';
import { ModalComponent } from '../../../common/modal/modal.component';
import { ButtonModule } from 'primeng/button';
import { ProjectData } from '../../../models/schema/db';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
    selector: 'app-projects-modal',
    imports: [
        LucideAngularModule,
        ReactiveFormsModule,
        ModalComponent,
        ButtonModule,
        InputText,
        Textarea,
    ],
    templateUrl: './projects-modal.component.html',
    styleUrl: './projects-modal.component.scss',
})
export class ProjectsModalComponent {
    modalClosed = output<void>();
    projectId = input<string | null>(null);
    projectName = input<string | null>(null);
    projectDescription = input<string | null>(null);
    userId = input<string | null>(null);
    mode = input<'edit' | 'create' | 'delete'>('create');
    visible = model<boolean>(true);

    private readonly fb = inject(FormBuilder);
    private readonly projectService = inject(ProjectService);
    private readonly toastService = inject(ToastService);
    private readonly authService = inject(AuthService);

    createProjectForm = linkedSignal<FormGroup>(() =>
        this.fb.group({
            name: [this.projectName(), [Validators.required, Validators.minLength(3)]],
            description: [
                this.projectDescription(),
                [Validators.required, Validators.minLength(10)],
            ],
        }),
    );
    isSaving = signal<boolean>(false);

    close() {
        this.visible.set(false);
    }

    onClose() {
        this.modalClosed.emit();
        this.createProjectForm().reset();
    }

    async onSubmit() {
        if (this.editMode) {
            await this.onUpdate();
        } else if (this.createMode) {
            await this.onCreate();
        } else if (this.deleteMode) {
            await this.onDelete();
        }
    }

    async onUpdate() {
        const projectId = this.projectId();
        const userId = this.userId();

        if (this.createProjectForm().invalid || !projectId || !userId) {
            this.createProjectForm().markAllAsTouched();
            return;
        }

        this.isSaving.set(true);

        const updatedProject: Partial<Project> = {
            name: this.createProjectForm().value.name,
            description: this.createProjectForm().value.description,
            updatedBy: userId,
            updatedAt: new Date(),
            updatedByName:
                this.authService.getUser()?.displayName ||
                this.authService.getUser()?.email ||
                'Unknown',
        };

        try {
            await this.projectService.update(projectId, updatedProject);
            this.toastService.show('Project updated successfully');
            this.close();
        } catch (error) {
            console.error('Error updating project:', error);
            this.toastService.show('Error updating project', 'error');
        } finally {
            this.isSaving.set(false);
        }
    }

    async onCreate() {
        const userId = this.userId();
        if (this.createProjectForm().invalid || !userId) {
            this.createProjectForm().markAllAsTouched();
            return;
        }
        this.isSaving.set(true);

        const newProject: ProjectData = {
            createdBy: userId,
            createdByName:
                this.authService.getUser()?.displayName ||
                this.authService.getUser()?.email ||
                'Unknown',
            name: this.createProjectForm().value.name,
            description: this.createProjectForm().value.description,
            cardCount: 0,
            lastStudied: null,
            createdAt: new Date(),
        };

        try {
            await this.projectService.addOne(newProject);
            this.toastService.show('Project created successfully');
            this.close();
        } catch (error) {
            console.error('Error creating project:', error);
            this.toastService.show('Error creating project', 'error');
        } finally {
            this.isSaving.set(false);
        }
    }

    async onDelete() {
        const projectId = this.projectId();
        if (!projectId) {
            return;
        }

        this.isSaving.set(true);

        try {
            await this.projectService.delete(projectId);
            this.toastService.show('Project deleted successfully');
            this.close();
        } catch (error) {
            console.error('Error deleting project:', error);
            this.toastService.show('Error deleting project', 'error');
        } finally {
            this.isSaving.set(false);
        }
    }

    get title() {
        switch (this.mode()) {
            case 'create':
                return 'Create New Project';
            case 'edit':
                return 'Edit Project';
            case 'delete':
                return 'Delete Project';
            default:
                return '';
        }
    }

    get name() {
        return this.createProjectForm().get('name');
    }

    get description() {
        return this.createProjectForm().get('description');
    }

    get editMode() {
        return this.mode() === 'edit';
    }

    get createMode() {
        return this.mode() === 'create';
    }

    get deleteMode() {
        return this.mode() === 'delete';
    }

    get submitButtonIcon() {
        switch (this.mode()) {
            case 'create':
                return this.isSaving() ? 'loader-circle' : 'plus';
            case 'edit':
                return this.isSaving() ? 'loader-circle' : 'pencil';
            case 'delete':
                return this.isSaving() ? 'loader-circle' : 'trash-2';
            default:
                return '';
        }
    }

    get submitButtonText() {
        switch (this.mode()) {
            case 'create':
                return this.isSaving() ? 'Creating...' : 'Create';
            case 'edit':
                return this.isSaving() ? 'Saving...' : 'Save';
            case 'delete':
                return this.isSaving() ? 'Deleting...' : 'Delete';
            default:
                return '';
        }
    }
}
