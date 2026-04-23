import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { db, QuestionData, Schema } from '../../models/schema/db';
import { Question, QuestionWithoutId } from '../../models/Question';
import { ProjectQuestionService } from '../project-question/project-question.service';
import { toData } from '../../utils/converter';

type ProjectId = Schema['projects']['Id'];
type QuestionCollection = ReturnType<(typeof db)['projects']>['questions'];
type QuestionId = Parameters<QuestionCollection['get']>[0];

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    private projQuestService = inject(ProjectQuestionService);

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
        await Promise.all([
            db.projects(projId).questions.add(data as QuestionData),
            this.projQuestService.incrementCardCount(projectId, 1),
        ]);
    }

    async addMany(questions: Array<Partial<Question>>, projectId: string): Promise<void> {
        const projId = projectId as ProjectId;
        const adds = questions.map((q) => {
            const { id: _id, ...data } = q;
            return db.projects(projId).questions.add(data as QuestionData);
        });
        await Promise.all([
            Promise.all(adds),
            this.projQuestService.incrementCardCount(projectId, questions.length),
        ]);
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

    deleteOne(id: string, projectId: string): Promise<[void, void]> {
        const projId = projectId as ProjectId;
        const qId = id as QuestionId;
        return Promise.all([
            db
                .projects(projId)
                .questions.remove(qId)
                .then(() => undefined),
            this.projQuestService.incrementCardCount(projectId, -1),
        ]);
    }
}
