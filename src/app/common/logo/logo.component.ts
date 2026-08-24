import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
    selector: 'flashcard-logo',
    imports: [CommonModule],
    templateUrl: './logo.component.html',
    styleUrl: './logo.component.scss',
})
export class LogoComponent {
    height = input<number>(64);
    width = input<number>(64);
    showBottomMargin = input<boolean>(true);
    roundness = input<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('2xl');

    roundnessClasses = {
        xs: 'rounded-xs',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
    };
}
