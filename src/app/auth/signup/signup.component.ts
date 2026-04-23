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
import { ToastService } from '../../services/toast/toast.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CheckboxModule } from 'primeng/checkbox';
import { LogoComponent } from '../../common/logo/logo.component';

@Component({
    selector: 'app-signup',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        MessageModule,
        DividerModule,
        IconFieldModule,
        InputIconModule,
        CheckboxModule,
        LogoComponent,
    ],
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

    constructor() {
        this.signupForm = this.fb.group(
            {
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.minLength(6)]],
                confirmPassword: ['', [Validators.required]],
                agree: [false, [Validators.requiredTrue]],
            },
            { validators: this.passwordMatchValidator },
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
                this.errorMessage = 'An error occurred. Please try again.';
            } finally {
                this.isLoading = false;
            }
        } else {
            this.markFormGroupTouched(this.signupForm);
        }
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach((key) => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
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
