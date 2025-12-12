export interface Project {
    id: string;
    name: string;
    description: string;
    cardCount: number;
    lastStudied: Date | null;
    createdAt: Date;
}
