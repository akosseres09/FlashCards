import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
    animations: [
        trigger('modalAnimation', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'scale(0.95) translateY(10px)',
                }),
                animate(
                    '200ms cubic-bezier(0.16, 1, 0.3, 1)',
                    style({
                        opacity: 1,
                        transform: 'scale(1) translateY(0)',
                    })
                ),
            ]),
            transition(':leave', [
                animate(
                    '150ms ease-in',
                    style({
                        opacity: 0,
                        transform: 'scale(0.95) translateY(10px)',
                    })
                ),
            ]),
        ]),
    ],
})
export class ModalComponent {
    @Input() isOpen = false;
    @Output() closeChange = new EventEmitter<boolean>();

    onClose() {
        this.closeChange.emit(false);
    }

    @HostListener('document:keydown.escape')
    onEsc() {
        this.onClose();
    }
}
