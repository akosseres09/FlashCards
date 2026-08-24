export interface Project {
    id: string;
    name: string;
    description: string;
    cardCount: number;
    createdBy: string;
    createdByName?: string;
    updatedBy?: string;
    updatedByName?: string;
    lastStudied: Date | null;
    createdAt: Date;
    updatedAt?: Date;
}
