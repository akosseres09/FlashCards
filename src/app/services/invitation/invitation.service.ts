import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { db, ProjectInvitationData, Schema } from '../../models/schema/db';
import { ProjectInvitation, InvitationStatus } from '../../models/ProjectInvitation';
import { toData } from '../../utils/converter';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({
    providedIn: 'root',
})
export class InvitationService {
    private functions = inject(Functions);

    /** Real-time stream of pending invitations sent to a given email address. */
    getByEmail(email: string): Observable<ProjectInvitation[]> {
        return new Observable<ProjectInvitation[]>((subscriber) => {
            const off = db.invitations
                .query(($) => [$.field('invitedEmail').eq(email), $.field('status').eq('pending')])
                .on((docs) => {
                    const pending = docs.map((doc) => toData<ProjectInvitationData>(doc));
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
                .query(($) => [$.field('projectId').eq(projectId), $.field('status').eq('pending')])
                .on((docs) => {
                    const pending = docs.map((doc) => toData<ProjectInvitationData>(doc));
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

    async create(invitation: ProjectInvitationData): Promise<void> {
        await httpsCallable(this.functions, 'invite')(invitation);
    }

    async updateStatus(id: string, status: InvitationStatus): Promise<void> {
        const typedId = await db.invitations.id(id);
        return db.invitations.update(typedId, { status }).then(() => undefined);
    }

    async delete(id: string): Promise<void> {
        const typedId = await db.invitations.id(id);
        return db.invitations.remove(typedId).then(() => undefined);
    }
}
