import { ProjectRole } from './ProjectMember';

export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface ProjectInvitation {
    id: string;
    projectId: string;
    projectName: string;
    invitedEmail: string;
    invitedBy: string; // UID
    invitedByName: string;
    role: ProjectRole;
    createdAt: Date;
    status: InvitationStatus;
}
