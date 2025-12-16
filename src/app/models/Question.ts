export const QUESTION_TYPES = ['Multiple Choice', 'Definition', 'Concept', 'Yes/No'] as const;

export interface Question {
    id: string;
    projectId: string;
    type: (typeof QUESTION_TYPES)[number];
    question: string;
    answer: string;
    options?: string[];
    createdAt: Date;
    updatedAt?: Date;
}

export type QuestionWithoutId = Omit<Question, 'id'> & { id?: string };

export type ViewQuestion = Pick<Question, 'question' | 'answer' | 'type' | 'options'>;
