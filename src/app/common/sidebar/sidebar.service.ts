import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'flashcards_sidebar_collapsed';

@Injectable({ providedIn: 'root' })
export class SidebarService {
    readonly collapsed = signal<boolean>(
        typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) === 'true' : false,
    );

    toggle(): void {
        const next = !this.collapsed();
        this.collapsed.set(next);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, String(next));
        }
    }

    open(): void {
        this.collapsed.set(false);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, 'false');
        }
    }

    close(): void {
        this.collapsed.set(true);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, 'true');
        }
    }
}
