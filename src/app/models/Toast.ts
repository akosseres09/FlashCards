export interface Toast {
    id: string;
    message: string;
    type?: 'success' | 'info' | 'error' | 'warning';
    duration?: number;
}
