import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast/toast.service';

@Component({
    selector: 'app-toast',
    imports: [CommonModule],
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.scss',
})
export class ToastComponent {
    private toastService = inject(ToastService);
    toasts$ = this.toastService.toast$;

    removeToast(id: string) {
        this.toastService.dismiss(id);
    }
}
