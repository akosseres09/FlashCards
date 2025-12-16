import {
    Component,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { ModalComponent } from '../../../common/modal/modal.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuestionService } from '../../../services/question/question.service';
import { ToastService } from '../../../services/toast/toast.service';
import { LucideAngularModule } from 'lucide-angular';
import {
    Question,
    QUESTION_TYPES,
    QuestionWithoutId,
    ViewQuestion,
} from '../../../models/Question';

@Component({
    selector: 'app-questions-modal',
    imports: [ModalComponent, ReactiveFormsModule, LucideAngularModule],
    templateUrl: './questions-modal.component.html',
    styleUrl: './questions-modal.component.scss',
})
export class QuestionsModalComponent implements OnChanges {
    @Output() modalClosed: EventEmitter<void> = new EventEmitter<void>();
    @Input() projectId: string | null = null;
    @Input() questionId: string | null = null;
    @Input() mode: 'edit' | 'create' | 'delete' | 'json' = 'create';
    @Input() questionData: ViewQuestion | null = null;

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
    isSaving: boolean = false;
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

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['questionId']) {
            this.questionId = changes['questionId'].currentValue;
        }

        if (changes['mode']) {
            this.mode = changes['mode'].currentValue;
        }

        if (changes['projectId']) {
            this.projectId = changes['projectId'].currentValue;
        }

        if (changes['questionData']) {
            this.questionData = changes['questionData'].currentValue;
            if (this.questionData) {
                this.question?.setValue(this.questionData.question || '');
                this.answer?.setValue(this.questionData.answer || '');
                this.type?.setValue(this.questionData.type || 'Multiple Choice');
                this.selectedType = this.questionData.type || 'Multiple Choice';

                if (this.questionData.options && this.questionData.options.length > 0) {
                    this.optionsArray.clear();
                    this.questionData.options.forEach((option: string) => {
                        this.optionsArray.push(this.fb.control(option));
                    });
                }
            }
        }
    }

    async onCreate() {
        if (!this.questionForm.valid || !this.projectId) return;

        this.isSaving = true;
        const optionsValue = this.showOptions
            ? (this.optionsArray.value as string[]).filter((opt: string) => opt.trim() !== '')
            : [];

        const newQuestion: QuestionWithoutId = {
            question: this.question?.value as string,
            answer: this.answer?.value as string,
            type: this.type?.value as Question['type'],
            options: optionsValue,
            projectId: this.projectId,
            createdAt: new Date(),
        };

        try {
            await this.questionService.addOne(newQuestion, this.projectId);
            this.toastService.show('Question created successfully.');
        } catch (error: any) {
            const message = error.message || 'Error creating question.';
            this.toastService.show(message, 'error');
        } finally {
            this.isSaving = false;
            this.onClose();
        }
    }

    onEdit() {
        if (!this.questionForm.valid) return;

        this.isSaving = true;
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
            this.questionService.updateOne(
                this.questionId as string,
                this.projectId as string,
                updatedQuestion
            );
            this.toastService.show('Question updated successfully.');
        } catch (error: any) {
            const message = error.message || 'Error updating question.';
            this.toastService.show(message, 'error');
        } finally {
            this.isSaving = false;
            this.onClose();
        }
    }

    async onDelete() {
        if (!this.questionId) {
            this.onClose();
            return;
        }

        this.isSaving = true;
        try {
            await this.questionService.deleteOne(this.questionId, this.projectId as string);
            this.toastService.show('Question deleted successfully.');
        } catch (error: any) {
            const message = error.message || 'Error deleting question.';
            this.toastService.show(message, 'error');
        } finally {
            this.isSaving = false;
            this.onClose();
        }
    }

    onSubmit() {
        if (this.jsonMode) {
            this.onJson();
        } else if (this.createMode) {
            this.onCreate();
        } else if (this.editMode) {
            this.onEdit();
        } else if (this.deleteMode) {
            this.onDelete();
        }
    }

    async onJson() {
        this.isSaving = true;
        const textValue = this.questionsForm?.value || '';
        try {
            const questions = JSON.parse(textValue) as Array<Partial<Question>>;
            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error('Data must be a non-empty array of questions.');
            }

            questions.forEach((question) => {
                question.createdAt = new Date();
                question.projectId = this.projectId as string;
            });

            await this.questionService.addMany(questions, this.projectId as string);
            this.toastService.show('Questions imported successfully.');
        } catch (error: any) {
            const message = error.message || 'No questions imported! Invalid JSON format.';
            this.toastService.show(message, 'error', 20000);
        } finally {
            this.jsonForm.reset();
            this.isSaving = false;
            this.onClose();
        }
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
        return this.mode === 'edit';
    }

    get createMode() {
        return this.mode === 'create';
    }

    get deleteMode() {
        return this.mode === 'delete';
    }

    get jsonMode() {
        return this.mode === 'json';
    }

    get title() {
        switch (this.mode) {
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
        switch (this.mode) {
            case 'create':
                return this.isSaving ? 'Creating...' : 'Create Question';
            case 'edit':
                return this.isSaving ? 'Saving Changes...' : 'Save Changes';
            case 'delete':
                return this.isSaving ? 'Deleting...' : 'Delete Question';
            case 'json':
                return this.isSaving ? 'Importing...' : 'Import Questions';
            default:
                return '';
        }
    }

    get submitButtonIcon() {
        switch (this.mode) {
            case 'create':
                return this.isSaving ? 'loader-circle' : 'plus';
            case 'edit':
                return this.isSaving ? 'loader-circle' : 'pencil';
            case 'delete':
                return this.isSaving ? 'loader-circle' : 'trash-2';
            case 'json':
                return this.isSaving ? 'loader-circle' : 'upload';
            default:
                return '';
        }
    }
}
