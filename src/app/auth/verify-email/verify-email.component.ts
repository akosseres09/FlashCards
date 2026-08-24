import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../services/toast/toast.service';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FirebaseError } from '@angular/fire/app';
import { take } from 'rxjs';

@Component({
    selector: 'app-verify-email',
    imports: [CommonModule, LucideAngularModule, ButtonModule, DividerModule],
    templateUrl: './verify-email.component.html',
    styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly toastService = inject(ToastService);

    readonly userEmail = signal<string>('');
    readonly isLoading = signal<boolean>(false);
    readonly canResend = signal<boolean>(true);
    readonly resendCooldown = signal<number>(0);
    private readonly cooldownInterval = signal<number | null>(null);

    ngOnInit(): void {
        this.authService.user$.pipe(take(1)).subscribe((user) => {
            if (user) {
                this.userEmail.set(user.email || '');
            }
        });
    }

    async resendVerificationEmail() {
        if (!this.canResend()) return;

        this.isLoading.set(true);

        try {
            await this.authService.sendVerificationEmail();
            this.toastService.show('Verification email sent! Please check your inbox.');
            this.startCooldown();
        } catch (error) {
            if (error instanceof FirebaseError) {
                this.toastService.show(this.getErrorMessage(error.code), 'error');
            }
        } finally {
            this.isLoading.set(false);
        }
    }

    async checkEmailVerification() {
        this.isLoading.set(true);

        try {
            const user = this.authService.getUser();
            if (!user) {
                return;
            }

            await user.reload();
            if (user.emailVerified) {
                this.toastService.show('Email verified successfully!');
                this.router.navigate(['/']);
            } else {
                this.toastService.show(
                    'Email not verified yet. Please check your inbox and click the verification link.',
                    'warning',
                );
            }
        } catch {
            this.toastService.show(
                'Unable to check verification status. Please try again.',
                'error',
            );
        } finally {
            this.isLoading.set(false);
        }
    }

    private startCooldown() {
        this.canResend.set(false);
        this.resendCooldown.set(60);

        this.cooldownInterval.set(
            setInterval(() => {
                this.resendCooldown.update((value) => value - 1);
                const interval = this.cooldownInterval();
                if (this.resendCooldown() <= 0 && interval) {
                    this.canResend.set(true);
                    clearInterval(interval);
                }
            }, 1000),
        );
    }

    private getErrorMessage(errorCode: string): string {
        switch (errorCode) {
            case 'auth/too-many-requests':
                return 'Too many requests. Please try again later.';
            case 'auth/user-not-found':
                return 'User not found. Please sign up.';
            default:
                return typeof errorCode === 'string' && errorCode.includes('No user')
                    ? 'Please sign in to verify your email.'
                    : 'An error occurred. Please try again.';
        }
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }

    ngOnDestroy(): void {
        const interval = this.cooldownInterval();
        if (interval) {
            clearInterval(interval);
        }
    }
}
