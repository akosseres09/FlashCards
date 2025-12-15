import { Component, importProvidersFrom, inject } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../services/toast/toast.service';

@Component({
    selector: 'app-signup',
    imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss',
})
export class SignupComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    signupForm: FormGroup;
    errorMessage: string = '';
    isLoading: boolean = false;
    showPassword: boolean = false;
    showConfirmPassword: boolean = false;

    constructor() {
        this.signupForm = this.fb.group(
            {
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.minLength(6)]],
                confirmPassword: ['', [Validators.required]],
                agree: [false, [Validators.requiredTrue]],
            },
            { validators: this.passwordMatchValidator }
        );
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;

        if (password !== confirmPassword) {
            control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }

        return null;
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    async onSubmit() {
        if (this.signupForm.valid) {
            this.isLoading = true;
            this.errorMessage = '';

            const { email, password } = this.signupForm.value;

            try {
                await this.authService.signup(email, password);
                this.toastService.show('Signup successful! Please verify your email.');
                this.router.navigate(['/auth/verify-email']);
            } catch (error: any) {
                this.errorMessage = this.getErrorMessage(error.code);
            } finally {
                this.isLoading = false;
            }
        } else {
            this.markFormGroupTouched(this.signupForm);
        }
    }

    async onGoogleSignup() {
        this.isLoading = true;
        this.errorMessage = '';

        try {
            await this.authService.loginWithGoogle();
            this.router.navigate(['/']);
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
            case 'auth/email-already-in-use':
                return 'An account with this email already exists';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/weak-password':
                return 'Password is too weak. Please use a stronger password';
            case 'auth/operation-not-allowed':
                return 'Account creation is currently disabled';
            case 'auth/popup-closed-by-user':
                return 'Sign-up popup was closed';
            default:
                return 'An error occurred. Please try again';
        }
    }

    get email() {
        return this.signupForm.get('email');
    }

    get password() {
        return this.signupForm.get('password');
    }

    get confirmPassword() {
        return this.signupForm.get('confirmPassword');
    }

    get agree() {
        return this.signupForm.get('agree');
    }
}
