import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../services/toast/toast.service';

@Component({
    selector: 'app-verify-email',
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './verify-email.component.html',
    styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    userEmail: string = '';
    isLoading: boolean = false;
    canResend: boolean = true;
    resendCooldown: number = 60;
    private cooldownInterval: any;

    ngOnInit(): void {
        this.authService.user$.subscribe((user) => {
            if (user) {
                this.userEmail = user.email || '';
            }
        });
    }

    async resendVerificationEmail() {
        if (!this.canResend) return;

        this.isLoading = true;

        try {
            await this.authService.sendVerificationEmail();
            this.toastService.show('Verification email sent! Please check your inbox.', 'success');
            this.startCooldown();
        } catch (error: any) {
            this.toastService.show(this.getErrorMessage(error.code || error), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async checkEmailVerification() {
        this.isLoading = true;

        try {
            const user = this.authService.getUser();
            if (user) {
                await user.reload();
                if (user.emailVerified) {
                    this.toastService.show('Email verified successfully!', 'success');
                    this.router.navigate(['/']);
                } else {
                    this.toastService.show(
                        'Email not verified yet. Please check your inbox and click the verification link.',
                        'info'
                    );
                }
            }
        } catch (error: any) {
            this.toastService.show(
                'Unable to check verification status. Please try again.',
                'error'
            );
        } finally {
            this.isLoading = false;
        }
    }

    private startCooldown() {
        this.canResend = false;
        this.resendCooldown = 60;

        this.cooldownInterval = setInterval(() => {
            this.resendCooldown--;
            if (this.resendCooldown <= 0) {
                this.canResend = true;
                clearInterval(this.cooldownInterval);
            }
        }, 1000);
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
        if (this.cooldownInterval) {
            clearInterval(this.cooldownInterval);
        }
    }
}
