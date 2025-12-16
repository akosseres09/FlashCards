import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast } from '../../models/Toast';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    private toastSubject = new BehaviorSubject<Toast[]>([]);
    toast$ = this.toastSubject.asObservable();

    show(message: string, type: Toast['type'] = 'info', duration: number = 3000) {
        const toast: Toast = { id: crypto.randomUUID(), message, type, duration };
        this.toastSubject.next([...this.toastSubject.value, toast]);

        setTimeout(() => {
            this.dismiss(toast.id);
        }, duration);
    }

    dismiss(id: string) {
        this.toastSubject.next(this.toastSubject.value.filter((toast) => toast.id !== id));
    }
}
