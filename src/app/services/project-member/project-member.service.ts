import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { db, ProjectMemberData, Schema } from '../../models/schema/db';
import { ProjectMember, ProjectRole } from '../../models/ProjectMember';
import { toData } from '../../utils/converter';

@Injectable({
    providedIn: 'root',
})
export class ProjectMemberService {
    /** Real-time list of all accepted members for a project. */
    getByProject(projectId: string): Observable<ProjectMember[]> {
        return new Observable<ProjectMember[]>((subscriber) => {
            const off = db.projectMembers
                .query(($) => $.field('projectId').eq(projectId))
                .on((docs) => subscriber.next(docs.map((doc) => toData<ProjectMemberData>(doc))))
                .catch((err) => subscriber.error(err));
            return () => off();
        });
    }

    /** Real-time list of all projects the user is a member of. */
    getMyMemberships(userId: string): Observable<ProjectMember[]> {
        return new Observable<ProjectMember[]>((subscriber) => {
            const off = db.projectMembers
                .query(($) => $.field('userId').eq(userId))
                .on((docs) => subscriber.next(docs.map((doc) => toData<ProjectMemberData>(doc))))
                .catch((err) => subscriber.error(err));
            return () => off();
        });
    }

    /** Real-time membership document for a specific user+project combination. */
    getMembership(projectId: string, userId: string): Observable<ProjectMember | null> {
        const docId = `${projectId}_${userId}` as Schema['projectMembers']['Id'];
        return new Observable<ProjectMember | null>((subscriber) => {
            const off = db.projectMembers
                .get(docId)
                .on((doc) => subscriber.next(doc ? toData<ProjectMemberData>(doc) : null))
                .catch((err) => subscriber.error(err));
            return () => off();
        });
    }

    updateRole(memberId: string, role: ProjectRole): Promise<void> {
        const typedId = memberId as Schema['projectMembers']['Id'];
        return db.projectMembers.update(typedId, { role }).then(() => undefined);
    }

    delete(memberId: string): Promise<void> {
        const typedId = memberId as Schema['projectMembers']['Id'];
        return db.projectMembers.remove(typedId).then(() => undefined);
    }
}
