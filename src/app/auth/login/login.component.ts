import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AuthErrorCodes } from '@angular/fire/auth';
import { LogoComponent } from '../../common/logo/logo.component';
import { FirebaseError } from '@angular/fire/app';

@Component({
    selector: 'app-login',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        LucideAngularModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        MessageModule,
        DividerModule,
        IconFieldModule,
        InputIconModule,
        LogoComponent,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });
    readonly errorMessage = signal<string>('');
    readonly isLoading = signal<boolean>(false);
    readonly showPassword = signal<boolean>(false);

    togglePasswordVisibility() {
        this.showPassword.set(!this.showPassword());
    }

    async onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading.set(true);
            this.errorMessage.set('');

            const { email, password } = this.loginForm.value;
            if (!email || !password) {
                this.errorMessage.set('Email and password are required');
                this.isLoading.set(false);
                return;
            }

            try {
                await this.authService.login(email, password);
                this.router.navigate(['/']);
            } catch (error) {
                if (error instanceof FirebaseError) {
                    this.errorMessage.set(this.getErrorMessage(error.code));
                }
            } finally {
                this.isLoading.set(false);
            }
        } else {
            this.markFormGroupTouched(this.loginForm);
        }
    }

    async onGoogleLogin() {
        this.isLoading.set(true);
        this.errorMessage.set('');

        try {
            await this.authService.loginWithGoogle();
            this.router.navigate(['/projects']);
        } catch (error) {
            if (error instanceof FirebaseError) {
                this.errorMessage.set(this.getErrorMessage(error.code));
            }
        } finally {
            this.isLoading.set(false);
        }
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach((key) => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    private getErrorMessage(errorCode: string): string {
        switch (errorCode) {
            case AuthErrorCodes.INVALID_EMAIL:
            case AuthErrorCodes.INVALID_PASSWORD:
            case AuthErrorCodes.INVALID_IDP_RESPONSE:
                return 'Invalid email or password';
            case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
                return 'Too many failed attempts. Please try again later';
            case AuthErrorCodes.USER_DISABLED:
                return 'This account has been disabled';
            case AuthErrorCodes.POPUP_CLOSED_BY_USER:
                return 'Sign-in popup was closed';
            default:
                return 'An error occurred. Please try again';
        }
    }

    get email() {
        return this.loginForm.get('email')!;
    }

    get password() {
        return this.loginForm.get('password')!;
    }
}
