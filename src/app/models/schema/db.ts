import { schema, Typesaurus } from 'typesaurus';
import { Question, QUESTION_TYPES } from '../Question';
import { Project } from '../Project';

export type DocData<T> = Omit<T, 'id'>;
export type QuestionData = DocData<Question>;
export type ProjectData = DocData<Project>;

export const db = schema(($) => ({
    projects: $.collection<DocData<ProjectData>>().sub({
        questions: $.collection<DocData<QuestionData>>(),
    }),
}));

export type Schema = Typesaurus.Schema<typeof db>;
