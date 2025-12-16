import { inject, Injectable } from '@angular/core';
import {
    collection,
    collectionData,
    deleteDoc,
    doc,
    docData,
    Firestore,
    setDoc,
    updateDoc,
    writeBatch,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Question, QuestionWithoutId } from '../../models/Question';
import { ProjectQuestionService } from '../project-question/project-question.service';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    PROJECTS_COLLECTION = 'projects';
    QUESTIONS_COLLECTION = 'questions';
    private firestore = inject(Firestore);
    private projQuestService = inject(ProjectQuestionService);

    getOne(projectId: string, id: string) {
        const ref = doc(
            collection(
                this.firestore,
                this.PROJECTS_COLLECTION + `/${projectId}/` + this.QUESTIONS_COLLECTION
            ),
            id
        );
        return docData(ref) as Observable<Question>;
    }

    getByProject(projectId: string) {
        const ref = collection(
            this.firestore,
            this.PROJECTS_COLLECTION + `/${projectId}/` + this.QUESTIONS_COLLECTION
        );
        return collectionData(ref) as Observable<Question[]>;
    }

    async addOne(question: QuestionWithoutId, projectId: string) {
        const questionRef = doc(
            collection(
                this.firestore,
                this.PROJECTS_COLLECTION + `/${projectId}/` + this.QUESTIONS_COLLECTION
            )
        );
        question.id = questionRef.id;

        return Promise.all([
            setDoc(questionRef, question),
            this.projQuestService.incrementCardCount(projectId, 1),
        ]);
    }

    async addMany(questions: Array<Partial<Question>>, projectId: string) {
        const batch = writeBatch(this.firestore);
        questions.forEach((question) => {
            const ref = doc(
                collection(
                    this.firestore,
                    this.PROJECTS_COLLECTION + `/${projectId}/` + this.QUESTIONS_COLLECTION
                )
            );
            question.id = ref.id;
            batch.set(ref, question);
        });

        return Promise.all([
            batch.commit(),
            this.projQuestService.incrementCardCount(projectId, questions.length),
        ]);
    }

    updateOne(id: string, projectId: string, question: Partial<Question>) {
        const ref = doc(
            this.firestore,
            this.PROJECTS_COLLECTION + `/${projectId}/` + this.QUESTIONS_COLLECTION + `/${id}`
        );
        question.updatedAt = new Date();
        return updateDoc(ref, question);
    }

    deleteOne(id: string, projectId: string) {
        const ref = doc(
            this.firestore,
            this.PROJECTS_COLLECTION + `/${projectId}/` + this.QUESTIONS_COLLECTION + `/${id}`
        );
        return Promise.all([
            deleteDoc(ref),
            this.projQuestService.incrementCardCount(projectId, -1),
        ]);
    }
}
