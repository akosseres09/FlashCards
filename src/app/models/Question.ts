export interface Question {
    id: string;
    projectId: string;
    type: 'Multiple Choice' | 'Definition' | 'Concept' | 'Yes/No';
    question: string;
    answer: string;
    options?: string[];
    createdAt: Date;
    updatedAt?: Date;
}
