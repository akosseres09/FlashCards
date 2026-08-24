import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
    static json(control: AbstractControl): ValidationErrors | null {
        try {
            JSON.parse(control.value);
            return null;
        } catch {
            return { invalidJson: 'Invalid JSON format' };
        }
    }
}
