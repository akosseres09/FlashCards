import {
    Component,
    computed,
    DestroyRef,
    HostListener,
    inject,
    input,
    OnInit,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Project } from '../../../models/Project';
import { Question, ViewQuestion } from '../../../models/Question';
import { ProjectService } from '../../../services/project/project.service';
import { switchMap } from 'rxjs';
import { QuestionsModalComponent } from '../questions-modal/questions-modal.component';
import { QuestionService } from '../../../services/question/question.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../../services/auth/auth.service';
import { ProjectMemberService } from '../../../services/project-member/project-member.service';
import { ProjectRole } from '../../../models/ProjectMember';

@Component({
    selector: 'app-view',
    imports: [
        CommonModule,
        LucideAngularModule,
        RouterLink,
        QuestionsModalComponent,
        ButtonModule,
        ProgressBarModule,
        ProgressSpinnerModule,
    ],
    templateUrl: './view.component.html',
    styleUrl: './view.component.scss',
    host: {
        class: 'flex-1 flex flex-col',
    },
})
export class ViewComponent implements OnInit {
    private readonly projectService = inject(ProjectService);
    private readonly questionService = inject(QuestionService);
    private readonly authService = inject(AuthService);
    private readonly memberService = inject(ProjectMemberService);
    private readonly destroyRef = inject(DestroyRef);

    projectId = input.required<string>();

    questionData = signal<ViewQuestion | null>(null);
    project = signal<Project | null>(null);
    questions = signal<Question[]>([]);
    currentIndex = signal<number>(0);
    isFlipped = signal<boolean>(false);
    isLoading = signal<boolean>(true);

    isModalOpen = signal<boolean>(false);

    modalMode = signal<'create' | 'edit' | 'delete' | 'json'>('create');

    /** 'owner' | ProjectRole | null (null = not a member / still loading) */
    userRole = signal<ProjectRole | 'owner' | null>(null);

    canEdit = computed(() => ['owner', 'admin', 'editor'].includes(this.userRole() ?? ''));
    canManage = computed(() => ['owner', 'admin'].includes(this.userRole() ?? ''));

    get currentUser() {
        return this.authService.getUser();
    }

    private roleInitialized = false;
    async ngOnInit() {
        const projectId = this.projectId();
        if (!projectId) {
            console.error('Project ID is required');
            this.isLoading.set(false);
            return;
        }

        await this.projectService.update(projectId, { lastStudied: new Date() });
        this.loadProject();
    }

    loadProject() {
        this.projectService
            .getOne(this.projectId())
            .pipe(
                switchMap((project) => {
                    this.project.set(project);
                    this.isLoading.set(false);

                    if (!this.roleInitialized) {
                        this.roleInitialized = true;
                        this.resolveUserRole(project);
                    }

                    return this.questionService.getByProject(project.id);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (questions) => {
                    this.questions.set(questions);
                    this.currentIndex.set(0);
                },
                error: (err) => {
                    console.error(err);
                    this.isLoading.set(false);
                },
            });
    }

    private resolveUserRole(project: Project): void {
        const user = this.authService.getUser();
        if (!user) return;

        if (project.createdBy === user.uid) {
            this.userRole.set('owner');
            return;
        }

        this.memberService
            .getMembership(project.id, user.uid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((member) => this.userRole.set(member?.role ?? null));
    }

    flipCard() {
        this.isFlipped.set(!this.isFlipped());
    }

    nextCard() {
        if (this.currentIndex() < this.questions().length - 1) {
            this.currentIndex.set(this.currentIndex() + 1);
            this.isFlipped.set(false);
        }
    }

    previousCard() {
        if (this.currentIndex() > 0) {
            this.currentIndex.set(this.currentIndex() - 1);
            this.isFlipped.set(false);
        }
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        const target = event.target as HTMLElement;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            this.isModalOpen()
        ) {
            return;
        }

        switch (event.key) {
            case ' ':
            case 'Spacebar':
                event.preventDefault();
                this.flipCard();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextCard();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.previousCard();
                break;
        }
    }

    get currentQuestion(): Question | null {
        return this.questions()[this.currentIndex()] || null;
    }

    get currentQuestionId(): string | null {
        return this.currentQuestion ? this.currentQuestion.id : null;
    }

    onModalClose() {
        this.isModalOpen.set(false);
    }

    openModal(
        mode: 'create' | 'edit' | 'delete' | 'json',
        questionData: ViewQuestion | null = null,
    ) {
        this.modalMode.set(mode);
        this.isModalOpen.set(true);

        this.questionData.set(questionData);
    }
}
