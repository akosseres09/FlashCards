import { Component, model, output } from '@angular/core';
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
    readonly closeChange = output<void>();
    readonly visible = model<boolean>(true);

    onClose() {
        this.closeChange.emit();
    }
}
