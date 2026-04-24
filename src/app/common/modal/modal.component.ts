import { Component, EventEmitter, input, output, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
    selector: 'app-modal',
    imports: [DialogModule, ButtonModule, LucideAngularModule],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
})
export class ModalComponent {
    closeChange = output<void>();
    visible = input<boolean>(true);

    onClose() {
        this.closeChange.emit();
    }
}
