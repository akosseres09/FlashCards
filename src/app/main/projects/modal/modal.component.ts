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

@Component({
    selector: 'app-projects-modal',
    imports: [LucideAngularModule, ReactiveFormsModule],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
})
export class ModalComponent implements OnChanges {
    @Output() modalClosed: EventEmitter<void> = new EventEmitter<void>();
    @Input() projectId: string | null = null;
    @Input() projectName: string | null = null;
    @Input() projectDescription: string | null = null;
    @Input() userId: string | null = null;

    private fb = inject(FormBuilder);
    private projectService = inject(ProjectService);
    createProjectForm: FormGroup;
    isSaving: boolean = false;
    isEditMode: boolean = this.projectId !== null;

    constructor() {
        this.createProjectForm = this.fb.group({
            name: [this.projectName, [Validators.required, Validators.minLength(3)]],
            description: [this.projectDescription, [Validators.required, Validators.minLength(10)]],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);

        if (changes['projectId']) {
            this.projectId = changes['projectId'].currentValue;
            this.isEditMode = this.projectId !== null;
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
        if (this.isEditMode) {
            this.onUpdate();
        } else {
            this.onCreate();
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
                this.onClose();
            } catch (error) {
                console.error('Error updating project:', error);
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
                this.onClose();
            } catch (error) {
                console.error('Error creating project:', error);
            } finally {
                this.isSaving = false;
            }
        } else {
            this.markFormGroupTouched(this.createProjectForm);
        }
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach((key) => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    get name() {
        return this.createProjectForm.get('name');
    }

    get description() {
        return this.createProjectForm.get('description');
    }
}
