import { inject, Injectable } from '@angular/core';
import {
    collection,
    doc,
    Firestore,
    getDocs,
    increment,
    updateDoc,
    writeBatch,
} from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})
export class ProjectQuestionService {
    PROJECTS_COLLECTION = 'projects';
    QUESTIONS_COLLECTION = 'questions';
    private firestore = inject(Firestore);

    async deleteByProject(projectId: string) {
        const ref = collection(
            this.firestore,
            this.PROJECTS_COLLECTION + `/${projectId}/` + this.QUESTIONS_COLLECTION
        );

        const snapshot = await getDocs(ref);
        if (snapshot.empty) return;

        const batch = writeBatch(this.firestore);
        snapshot.docs.forEach((d) => batch.delete(doc(this.firestore, d.ref.path)));
        return batch.commit();
    }

    incrementCardCount(projectId: string, incrementBy: number) {
        const ref = doc(collection(this.firestore, this.PROJECTS_COLLECTION), projectId);
        return updateDoc(ref, {
            cardCount: increment(incrementBy),
            updatedAt: new Date(),
        });
    }
}
