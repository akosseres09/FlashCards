export type ProjectRole = 'viewer' | 'editor' | 'admin';

export interface ProjectMember {
    id: string; // "${projectId}_${userId}"
    projectId: string;
    userId: string;
    email: string;
    role: ProjectRole;
    invitedBy: string; // UID of the user who created the invitation
    joinedAt: Date;
}
