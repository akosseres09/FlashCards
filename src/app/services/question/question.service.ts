import { inject, Injectable } from '@angular/core';
import {
    collection,
    collectionData,
    deleteDoc,
    doc,
    docData,
    Firestore,
    query,
    setDoc,
    updateDoc,
    where,
    writeBatch,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Question } from '../../models/Question';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    QUESTIONS_COLLECTION = 'questions';
    firestore = inject(Firestore);

    getOne(id: string) {
        const ref = doc(collection(this.firestore, this.QUESTIONS_COLLECTION), id);
        return docData(ref) as Observable<Question>;
    }

    getByProject(projectId: string) {
        const ref = collection(this.firestore, this.QUESTIONS_COLLECTION);
        const q = query(ref, where('projectId', '==', projectId));
        return collectionData(q) as Observable<Question[]>;
    }

    addOne(question: Question) {
        const ref = doc(collection(this.firestore, this.QUESTIONS_COLLECTION));
        question.id = ref.id;
        return setDoc(ref, question);
    }

    async addMany(questions: Array<Partial<Question>>) {
        const batch = writeBatch(this.firestore);
        questions.forEach((question) => {
            if (question.projectId) {
                const ref = doc(collection(this.firestore, this.QUESTIONS_COLLECTION));
                question.id = ref.id;
                batch.set(ref, question);
            }
        });
        await batch.commit();
    }

    updateOne(id: string, question: Partial<Question>) {
        const ref = doc(this.firestore, this.QUESTIONS_COLLECTION + `/${id}`);
        return updateDoc(ref, question);
    }

    deleteOne(id: string) {
        const ref = doc(this.firestore, this.QUESTIONS_COLLECTION + `/${id}`);
        return deleteDoc(ref);
    }
}
