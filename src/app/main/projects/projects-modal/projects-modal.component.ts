import {
    Component,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../../services/project/project.service';
import { Project } from '../../../models/Project';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../services/toast/toast.service';
import { ModalComponent } from '../../../common/modal/modal.component';

@Component({
    selector: 'app-projects-modal',
    imports: [LucideAngularModule, ReactiveFormsModule, ModalComponent],
    templateUrl: './projects-modal.component.html',
    styleUrl: './projects-modal.component.scss',
})
export class ProjectsModalComponent implements OnChanges {
    @Output() modalClosed: EventEmitter<void> = new EventEmitter<void>();
    @Input() projectId: string | null = null;
    @Input() projectName: string | null = null;
    @Input() projectDescription: string | null = null;
    @Input() userId: string | null = null;
    @Input() mode: 'edit' | 'create' | 'delete' = 'create';

    private fb = inject(FormBuilder);
    private projectService = inject(ProjectService);
    private toastService = inject(ToastService);

    createProjectForm: FormGroup;
    isSaving: boolean = false;

    constructor() {
        this.createProjectForm = this.fb.group({
            name: [this.projectName, [Validators.required, Validators.minLength(3)]],
            description: [this.projectDescription, [Validators.required, Validators.minLength(10)]],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['projectId']) {
            this.projectId = changes['projectId'].currentValue;
        }

        if (changes['mode']) {
            this.mode = changes['mode'].currentValue;
        }

        if (changes['projectName']) {
            this.projectName = changes['projectName'].currentValue;
            this.createProjectForm.get('name')?.setValue(this.projectName);
        }

        if (changes['projectDescription']) {
            this.projectDescription = changes['projectDescription'].currentValue;
            this.createProjectForm.get('description')?.setValue(this.projectDescription);
        }

        if (changes['userId']) {
            this.userId = changes['userId'].currentValue;
        }
    }

    onClose() {
        this.modalClosed.emit();
        this.createProjectForm.reset();
    }

    onSubmit() {
        if (this.editMode) {
            this.onUpdate();
        } else if (this.createMode) {
            this.onCreate();
        } else if (this.deleteMode) {
            this.onDelete();
        }
    }

    async onUpdate() {
        if (this.createProjectForm.valid && this.projectId) {
            this.isSaving = true;

            const updatedProject: Partial<Project> = {
                name: this.createProjectForm.value.name,
                description: this.createProjectForm.value.description,
            };

            try {
                await this.projectService.update(this.projectId, updatedProject);
                this.toastService.show('Project updated successfully', 'success');
                this.onClose();
            } catch (error) {
                console.error('Error updating project:', error);
                this.toastService.show('Error updating project', 'error');
            } finally {
                this.isSaving = false;
            }
        }
    }

    async onCreate() {
        if (this.createProjectForm.valid) {
            this.isSaving = true;

            const newProject: Project = {
                id: '',
                createdBy: this.userId as string,
                name: this.createProjectForm.value.name,
                description: this.createProjectForm.value.description,
                cardCount: 0,
                lastStudied: null,
                createdAt: new Date(),
            };

            try {
                await this.projectService.addOne(newProject);
                this.toastService.show('Project created successfully', 'success');
                this.onClose();
            } catch (error) {
                console.error('Error creating project:', error);
                this.toastService.show('Error creating project', 'error');
            } finally {
                this.isSaving = false;
            }
        } else {
            this.markFormGroupTouched(this.createProjectForm);
        }
    }

    async onDelete() {
        if (!this.projectId) {
            return;
        }

        this.isSaving = true;

        try {
            await this.projectService.delete(this.projectId);
            this.toastService.show('Project deleted successfully', 'success');
            this.onClose();
        } catch (error) {
            console.error('Error deleting project:', error);
            this.toastService.show('Error deleting project', 'error');
        } finally {
            this.isSaving = false;
        }
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach((key) => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    get title() {
        switch (this.mode) {
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
        return this.createProjectForm.get('name');
    }

    get description() {
        return this.createProjectForm.get('description');
    }

    get editMode() {
        return this.mode === 'edit';
    }

    get createMode() {
        return this.mode === 'create';
    }

    get deleteMode() {
        return this.mode === 'delete';
    }
}
