import { Component, inject, input, model, output, signal } from '@angular/core';
import { ModalComponent } from '../../../common/modal/modal.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuestionService } from '../../../services/question/question.service';
import { ToastService } from '../../../services/toast/toast.service';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import {
    Question,
    QUESTION_TYPES,
    QuestionWithoutId,
    ViewQuestion,
} from '../../../models/Question';

@Component({
    selector: 'app-questions-modal',
    imports: [ModalComponent, ReactiveFormsModule, LucideAngularModule, ButtonModule],
    templateUrl: './questions-modal.component.html',
    styleUrl: './questions-modal.component.scss',
})
export class QuestionsModalComponent {
    modalClosed = output<void>();
    projectId = input<string | null>(null);
    questionId = input<string | null>(null);
    mode = input<'edit' | 'create' | 'delete' | 'json'>('create');
    questionData = input<ViewQuestion | null>(null);
    visible = model<boolean>(true);

    protected questions: Question[] = [];
    private fb = inject(FormBuilder);
    private questionService = inject(QuestionService);
    private toastService = inject(ToastService);
    protected questionForm = this.fb.group({
        question: ['', Validators.required],
        answer: ['', Validators.required],
        type: ['Multiple Choice', Validators.required],
        options: this.fb.array([this.fb.control('')]),
    });
    protected jsonForm = this.fb.group({
        questions: ['', Validators.required],
    });
    isSaving = signal<boolean>(false);
    protected selectedType: Question['type'] = 'Multiple Choice';
    protected selectionOptions = [...QUESTION_TYPES];

    addOption() {
        this.optionsArray.push(this.fb.control(''));
    }

    removeOption(index: number) {
        if (this.optionsArray.length > 1) {
            this.optionsArray.removeAt(index);
        }
    }

    get optionsArray() {
        return this.questionForm.get('options') as any;
    }

    get showOptions() {
        return this.type?.value === 'Multiple Choice';
    }

    async onSubmit() {
        if (this.jsonMode) {
            await this.onJson();
        } else if (this.createMode) {
            await this.onCreate();
        } else if (this.editMode) {
            await this.onEdit();
        } else if (this.deleteMode) {
            await this.onDelete();
        }
    }

    async onCreate() {
        const projectId = this.projectId();
        if (!this.questionForm.valid || !projectId) {
            this.questionForm.markAllAsTouched();
            return;
        }

        this.isSaving.set(true);
        const optionsValue = this.showOptions
            ? (this.optionsArray.value as string[]).filter((opt: string) => opt.trim() !== '')
            : [];

        const newQuestion: QuestionWithoutId = {
            question: this.question?.value as string,
            answer: this.answer?.value as string,
            type: this.type?.value as Question['type'],
            options: optionsValue,
            projectId: projectId,
            createdAt: new Date(),
        };

        try {
            await this.questionService.addOne(newQuestion, projectId);
            this.toastService.show('Question created successfully.');
            this.close();
        } catch (error: any) {
            const message = error.message || 'Error creating question.';
            this.toastService.show(message, 'error');
        } finally {
            this.isSaving.set(false);
        }
    }

    async onEdit() {
        const projectId = this.projectId();
        const questionId = this.questionId();
        if (!this.questionForm.valid || !projectId || !questionId) {
            this.questionForm.markAllAsTouched();
            return;
        }

        this.isSaving.set(true);
        const optionsValue = this.showOptions
            ? (this.optionsArray.value as string[]).filter((opt: string) => opt.trim() !== '')
            : [];

        const updatedQuestion: ViewQuestion = {
            question: this.question?.value as string,
            answer: this.answer?.value as string,
            type: this.type?.value as Question['type'],
            options: optionsValue,
        };

        try {
            await this.questionService.updateOne(questionId, projectId, updatedQuestion);
            this.toastService.show('Question updated successfully.');
            this.close();
        } catch (error: any) {
            const message = error.message || 'Error updating question.';
            this.toastService.show(message, 'error');
        } finally {
            this.isSaving.set(false);
        }
    }

    async onDelete() {
        const projectId = this.projectId();
        const questionId = this.questionId();
        if (!questionId || !projectId) {
            this.close();
            return;
        }

        this.isSaving.set(true);
        try {
            await this.questionService.deleteOne(questionId, projectId);
            this.toastService.show('Question deleted successfully.');
        } catch (error: any) {
            const message = error.message || 'Error deleting question.';
            this.toastService.show(message, 'error');
        } finally {
            this.isSaving.set(false);
        }
    }

    async onJson() {
        const projectId = this.projectId();

        if (!projectId) {
            this.close();
            return;
        }

        this.isSaving.set(true);
        const textValue = this.questionsForm?.value || '';
        try {
            const questions = JSON.parse(textValue) as Array<Partial<Question>>;
            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error('Data must be a non-empty array of questions.');
            }

            questions.forEach((question) => {
                question.createdAt = new Date();
                question.projectId = projectId as string;
            });

            await this.questionService.addMany(questions, projectId);
            this.toastService.show('Questions imported successfully.');
            this.close();
        } catch (error: any) {
            const message = error.message || 'No questions imported! Invalid JSON format.';
            this.toastService.show(message, 'error');
        } finally {
            this.jsonForm.reset();
            this.isSaving.set(false);
        }
    }

    close() {
        this.visible.set(false);
    }

    onClose() {
        this.jsonForm.reset();
        this.questionForm.reset();
        this.optionsArray.clear();
        this.optionsArray.push(this.fb.control(''));
        this.selectedType = 'Multiple Choice';
        this.modalClosed.emit();
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

    get jsonMode() {
        return this.mode() === 'json';
    }

    get title() {
        switch (this.mode()) {
            case 'create':
                return 'Create Question';
            case 'edit':
                return 'Edit Question';
            case 'delete':
                return 'Delete Question';
            case 'json':
                return 'Import Questions via JSON';
            default:
                return '';
        }
    }

    get questionsForm() {
        return this.jsonForm.get('questions');
    }

    get question() {
        return this.questionForm.get('question');
    }

    get answer() {
        return this.questionForm.get('answer');
    }

    get type() {
        return this.questionForm.get('type');
    }

    get options() {
        return this.questionForm.get('options');
    }

    get submitButtonText() {
        switch (this.mode()) {
            case 'create':
                return this.isSaving() ? 'Creating...' : 'Create';
            case 'edit':
                return this.isSaving() ? 'Saving Changes...' : 'Save';
            case 'delete':
                return this.isSaving() ? 'Deleting...' : 'Delete';
            case 'json':
                return this.isSaving() ? 'Importing...' : 'Import';
            default:
                return '';
        }
    }

    get submitButtonIcon() {
        switch (this.mode()) {
            case 'create':
                return this.isSaving() ? 'loader-circle' : 'plus';
            case 'edit':
                return this.isSaving() ? 'loader-circle' : 'pencil';
            case 'delete':
                return this.isSaving() ? 'loader-circle' : 'trash-2';
            case 'json':
                return this.isSaving() ? 'loader-circle' : 'upload';
            default:
                return '';
        }
    }
}
