import { schema, Typesaurus } from 'typesaurus';
import { Question } from '../Question';
import { Project } from '../Project';
import { ProjectMember } from '../ProjectMember';
import { ProjectInvitation } from '../ProjectInvitation';

export type DocData<T> = Omit<T, 'id'>;
export type QuestionData = DocData<Question>;
export type ProjectData = DocData<Project>;
export type ProjectMemberData = DocData<ProjectMember>;
export type ProjectInvitationData = DocData<ProjectInvitation>;

export const db = schema(($) => ({
    projects: $.collection<DocData<ProjectData>>().sub({
        questions: $.collection<DocData<QuestionData>>(),
    }),
    projectMembers: $.collection<ProjectMemberData>(),
    invitations: $.collection<ProjectInvitationData>(),
}));

export type Schema = Typesaurus.Schema<typeof db>;
