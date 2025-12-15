import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './common/toast/toast.component';

@Component({
    standalone: true,
    selector: 'app-root',
    imports: [RouterOutlet, ToastComponent],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    protected readonly title = signal('FlashCards');
}
