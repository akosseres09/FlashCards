import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { db, ProjectInvitationData, Schema } from '../../models/schema/db';
import { ProjectInvitation, InvitationStatus } from '../../models/ProjectInvitation';
import { toData } from '../../utils/converter';

@Injectable({
    providedIn: 'root',
})
export class InvitationService {
    /** Real-time stream of pending invitations sent to a given email address. */
    getByEmail(email: string): Observable<ProjectInvitation[]> {
        return new Observable<ProjectInvitation[]>((subscriber) => {
            const off = db.invitations
                .query(($) => $.field('invitedEmail').eq(email))
                .on((docs) => {
                    const pending = docs
                        .map((doc) => toData<ProjectInvitationData>(doc))
                        .filter((inv) => inv.status === 'pending');
                    subscriber.next(pending);
                })
                .catch((err) => subscriber.error(err));
            return () => off();
        });
    }

    /** Real-time stream of pending invitations for a given project. */
    getByProject(projectId: string): Observable<ProjectInvitation[]> {
        return new Observable<ProjectInvitation[]>((subscriber) => {
            const off = db.invitations
                .query(($) => $.field('projectId').eq(projectId))
                .on((docs) => {
                    const pending = docs
                        .map((doc) => toData<ProjectInvitationData>(doc))
                        .filter((inv) => inv.status === 'pending');
                    subscriber.next(pending);
                })
                .catch((err) => subscriber.error(err));
            return () => off();
        });
    }

    /** Real-time stream of all invitations created by a user (any status). */
    getSentByUser(userId: string): Observable<ProjectInvitation[]> {
        return new Observable<ProjectInvitation[]>((subscriber) => {
            const off = db.invitations
                .query(($) => $.field('invitedBy').eq(userId))
                .on((docs) =>
                    subscriber.next(docs.map((doc) => toData<ProjectInvitationData>(doc))),
                )
                .catch((err) => subscriber.error(err));
            return () => off();
        });
    }

    create(invitation: ProjectInvitationData): Promise<void> {
        return db.invitations.add(invitation).then(() => undefined);
    }

    updateStatus(id: string, status: InvitationStatus): Promise<void> {
        const typedId = id as Schema['invitations']['Id'];
        return db.invitations.update(typedId, { status }).then(() => undefined);
    }

    delete(id: string): Promise<void> {
        const typedId = id as Schema['invitations']['Id'];
        return db.invitations.remove(typedId).then(() => undefined);
    }
}
