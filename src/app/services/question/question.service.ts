import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { db, QuestionData, Schema } from '../../models/schema/db';
import { Question, QuestionWithoutId } from '../../models/Question';
import { toData } from '../../utils/converter';

type ProjectId = Schema['projects']['Id'];
type QuestionCollection = ReturnType<(typeof db)['projects']>['questions'];
type QuestionId = Parameters<QuestionCollection['get']>[0];

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    private functions = inject(Functions);

    getOne(projectId: string, id: string): Observable<Question> {
        const projId = projectId as ProjectId;
        const qId = id as QuestionId;
        return new Observable<Question>((subscriber) => {
            const off = db
                .projects(projId)
                .questions.get(qId)
                .on((doc) => {
                    if (doc) subscriber.next(toData<QuestionData>(doc));
                })
                .catch((err) => subscriber.error(err));
            return () => off();
        });
    }

    getByProject(projectId: string): Observable<Question[]> {
        const projId = projectId as ProjectId;
        return new Observable<Question[]>((subscriber) => {
            const off = db
                .projects(projId)
                .questions.all()
                .on((docs) => subscriber.next(docs.map((doc) => toData<QuestionData>(doc))))
                .catch((err) => subscriber.error(err));
            return () => off();
        });
    }

    async addOne(question: QuestionWithoutId, projectId: string): Promise<void> {
        const projId = projectId as ProjectId;
        const { id: _id, ...data } = question as QuestionWithoutId & { id?: string };
        await db.projects(projId).questions.add(data as QuestionData);
    }

    async addMany(questions: Partial<Question>[], projectId: string): Promise<void> {
        const payload = questions.map((q) => {
            const { id: _id, ...data } = q;
            return data;
        });
        await httpsCallable(this.functions, 'bulkAddQuestions')({ projectId, questions: payload });
    }

    updateOne(id: string, projectId: string, question: Partial<Question>): Promise<void> {
        const projId = projectId as ProjectId;
        const qId = id as QuestionId;
        const { id: _id, ...updateData } = question;
        return db
            .projects(projId)
            .questions.update(qId, { ...updateData, updatedAt: new Date() })
            .then(() => undefined);
    }

    deleteOne(id: string, projectId: string): Promise<void> {
        const projId = projectId as ProjectId;
        const qId = id as QuestionId;
        return db
            .projects(projId)
            .questions.remove(qId)
            .then(() => undefined);
    }
}
