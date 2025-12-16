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
import { Question } from '../../../models/Question';
import { Subscription } from 'rxjs';

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

    protected questions: Question[] = [];
    private fb = inject(FormBuilder);
    private questionService = inject(QuestionService);
    private toastService = inject(ToastService);
    protected questionForm = this.fb.group({
        question: ['', Validators.required],
        answer: ['', Validators.required],
        type: ['Multiple Choice', Validators.required],
        options: this.fb.array([]),
    });
    protected jsonForm = this.fb.group({
        questions: ['', Validators.required],
    });

    isSaving: boolean = false;
    questionSubScription: Subscription | null = null;

    ngOnChanges(changes: SimpleChanges): void {}

    onCreate() {}

    onEdit() {}

    onDelete() {}

    onSubmit() {
        if (this.jsonMode) {
            this.onJson();
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

            await this.questionService.addMany(questions);
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
}
