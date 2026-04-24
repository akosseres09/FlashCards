import { Injectable } from '@angular/core';
import { db, Schema } from '../../models/schema/db';

type ProjectId = Schema['projects']['Id'];

@Injectable({
    providedIn: 'root',
})
export class ProjectQuestionService {
    async deleteByProject(projectId: string): Promise<void> {
        const projId = projectId as ProjectId;
        const docs = await db.projects(projId).questions.all();
        if (!docs.length) return;
        await Promise.all(docs.map((d) => d.remove()));
    }
}
