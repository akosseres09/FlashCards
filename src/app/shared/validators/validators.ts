import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
    static json(control: AbstractControl): ValidationErrors | null {
        try {
            JSON.parse(control.value);
            return null;
        } catch (e) {
            return { invalidJson: 'Invalid JSON format' };
        }
    }
}
