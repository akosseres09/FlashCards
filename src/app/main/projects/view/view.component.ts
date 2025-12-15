import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Project } from '../../../models/Project';
import { Question } from '../../../models/Question';
import { ProjectService } from '../../../services/project/project.service';
import { filter, map, Subscription, switchMap } from 'rxjs';
import { QuestionsModalComponent } from '../questions-modal/questions-modal.component';
import { QuestionService } from '../../../services/question/question.service';

@Component({
    selector: 'app-view',
    imports: [CommonModule, LucideAngularModule, RouterLink, QuestionsModalComponent],
    templateUrl: './view.component.html',
    styleUrl: './view.component.scss',
    host: {
        class: 'flex-1 flex flex-col',
    },
})
export class ViewComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private projectService = inject(ProjectService);
    private questionService = inject(QuestionService);
    private subscription: Subscription | null = null;

    projectId: string = '';
    project: Project | null = null;
    questions: Question[] = [];
    currentIndex: number = 0;
    isFlipped: boolean = false;
    isLoading: boolean = true;

    isModalOpen: boolean = false;

    modalMode: 'create' | 'edit' | 'delete' | 'json' = 'create';
    ngOnInit() {
        this.projectId = this.route.snapshot.paramMap.get('id') || '';
        if (this.projectId) {
            this.loadProject();
        }
    }

    loadProject() {
        this.subscription = this.projectService
            .getOne(this.projectId)
            .pipe(
                filter((project): project is Project => !!project),
                switchMap((project) => {
                    this.project = project;
                    this.isLoading = false;
                    return this.questionService.getByProject(project.id);
                })
            )
            .subscribe({
                next: (questions) => {
                    this.questions = questions;
                    this.currentIndex = 0;
                },
                error: (err) => {
                    console.error(err);
                    this.isLoading = false;
                },
            });
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
    }

    nextCard() {
        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            this.isFlipped = false;
        }
    }

    previousCard() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.isFlipped = false;
        }
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
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
        return this.questions[this.currentIndex] || null;
    }

    onModalClose() {
        this.isModalOpen = false;
    }

    addQuestion() {
        // TODO: Open modal to add new question
        console.log('Add question');
    }

    importQuestions(mode: 'create' | 'edit' | 'delete' | 'json') {
        this.modalMode = mode;
        this.isModalOpen = true;
    }

    editQuestion(question: Question) {
        // TODO: Open modal to edit question
        console.log('Edit question:', question.id);
    }

    deleteQuestion(question: Question) {
        // TODO: Implement delete functionality
        console.log('Delete question:', question.id);
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }
}
