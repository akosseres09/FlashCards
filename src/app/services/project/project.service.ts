import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { db, ProjectData, Schema } from '../../models/schema/db';
import { Project } from '../../models/Project';
import { ProjectQuestionService } from '../project-question/project-question.service';
import { toData } from '../../utils/converter';

@Injectable({
    providedIn: 'root',
})
export class ProjectService {
    private projQuestService = inject(ProjectQuestionService);

    getOne(id: string): Observable<Project> {
        const typedId = id as Schema['projects']['Id'];
        return new Observable<Project>((subscriber) => {
            const off = db.projects
                .get(typedId)
                .on((doc) => {
                    if (doc) subscriber.next(toData<ProjectData>(doc));
                })
                .catch((err) => subscriber.error(err));
            return () => off();
        });
    }

    getAll(): Observable<Project[]> {
        return new Observable<Project[]>((subscriber) => {
            const off = db.projects
                .all()
                .on((docs) => subscriber.next(docs.map((doc) => toData<ProjectData>(doc))))
                .catch((err) => subscriber.error(err));
            return () => off();
        });
    }

    getOwnProjects(userId: string): Observable<Project[]> {
        return new Observable<Project[]>((subscriber) => {
            const off = db.projects
                .query(($) => $.field('createdBy').eq(userId))
                .on((docs) => subscriber.next(docs.map((doc) => toData<ProjectData>(doc))))
                .catch((err) => subscriber.error(err));
            return () => off();
        });
    }

    addOne(project: ProjectData): Promise<void> {
        const { ...data } = project;
        return db.projects.add(data).then(() => undefined);
    }

    update(id: string, project: Partial<Project>): Promise<void> {
        const typedId = id as Schema['projects']['Id'];
        const { id: _id, ...updateData } = project;
        return db.projects.update(typedId, updateData).then(() => undefined);
    }

    delete(id: string): Promise<[void, void]> {
        const typedId = id as Schema['projects']['Id'];
        return Promise.all([
            db.projects.remove(typedId).then(() => undefined),
            this.projQuestService.deleteByProject(id),
        ]);
    }

    /**
     * Real-time stream of projects the user has been added to as a member
     * (i.e. shared projects — does NOT include own projects).
     */
    getSharedProjects(userId: string): Observable<Project[]> {
        return new Observable<Project[]>((subscriber) => {
            const off = db.projectMembers
                .query(($) => $.field('userId').eq(userId))
                .on(async (memberDocs) => {
                    if (memberDocs.length === 0) {
                        subscriber.next([]);
                        return;
                    }
                    try {
                        const projects = await Promise.all(
                            memberDocs.map((m) =>
                                db.projects.get(m.data.projectId as Schema['projects']['Id']),
                            ),
                        );
                        subscriber.next(
                            projects.filter(Boolean).map((p) => toData<ProjectData>(p!)),
                        );
                    } catch (err) {
                        subscriber.error(err);
                    }
                })
                .catch((err) => subscriber.error(err));
            return () => off();
        });
    }
}
