import { AbstractControl, ValidatorFn } from '@angular/forms';

export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;
    const birth = new Date(control.value);
    const today = new Date();
    const age   = today.getFullYear() - birth.getFullYear()
      - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    return age >= minAge ? null : { minAge: { required: minAge, actual: age } };
  };
}
