import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast/toast.service';
import { LucideAngularModule } from 'lucide-angular';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-toast',
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.scss',
    animations: [
        trigger('toastAnimation', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateY(-100%) scale(0.8)',
                }),
                animate(
                    '300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    style({
                        opacity: 1,
                        transform: 'translateY(0) scale(1)',
                    })
                ),
            ]),
            transition(':leave', [
                animate(
                    '250ms cubic-bezier(0.4, 0, 1, 1)',
                    style({
                        opacity: 0,
                        transform: 'translateY(-100%) scale(0.8)',
                    })
                ),
            ]),
        ]),
    ],
})
export class ToastComponent {
    private toastService = inject(ToastService);
    toasts$ = this.toastService.toast$;

    removeToast(id: string) {
        this.toastService.dismiss(id);
    }
}
