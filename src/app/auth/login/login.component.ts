import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-login',
    imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm: FormGroup;
    errorMessage: string = '';
    isLoading: boolean = false;
    showPassword: boolean = false;

    constructor() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    async onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading = true;
            this.errorMessage = '';

            const { email, password } = this.loginForm.value;

            try {
                await this.authService.login(email, password);
                this.router.navigate(['/']);
            } catch (error: any) {
                this.errorMessage = this.getErrorMessage(error.code);
            } finally {
                this.isLoading = false;
            }
        } else {
            this.markFormGroupTouched(this.loginForm);
        }
    }

    async onGoogleLogin() {
        this.isLoading = true;
        this.errorMessage = '';

        try {
            await this.authService.loginWithGoogle();
            this.router.navigate(['/projects']);
        } catch (error: any) {
            this.errorMessage = this.getErrorMessage(error.code);
        } finally {
            this.isLoading = false;
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
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'Invalid email or password';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later';
            case 'auth/user-disabled':
                return 'This account has been disabled';
            case 'auth/popup-closed-by-user':
                return 'Sign-in popup was closed';
            default:
                return 'An error occurred. Please try again';
        }
    }

    get email() {
        return this.loginForm.get('email');
    }

    get password() {
        return this.loginForm.get('password');
    }
}
