export interface Project {
    id: string;
    name: string;
    description: string;
    cardCount: number;
    createdBy: string;
    lastStudied: Date | null;
    createdAt: Date;
}
