import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultType } from '../../models/adherence-result.model';
import { AdherenceResultService } from '../../services/adherence-result.service';
import { PlanLookupService } from '../../services/plan-lookup.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-add-adherence-result',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-adherence-result.component.html',
  styleUrl: './add-adherence-result.component.css'
})
export class AddAdherenceResultComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adherenceResultService = inject(AdherenceResultService);
  private readonly planLookupService = inject(PlanLookupService);



  readonly maxDate = new Date().toISOString().split('T')[0];
  readonly planNumber = this.route.snapshot.paramMap.get('planNumber') ?? '';
  readonly planOverview$ = this.planLookupService.getPlanOverview(this.planNumber);

  constructor() {
    this.planOverview$.subscribe(plan => {

      const latestEntry = plan.a1cHistory[0];

      if (latestEntry) {
        this.latestResultDate = latestEntry.date;
      }
    });
  }

  resultType: ResultType | '' = '';
  testResult = '';
  testDate = '';
  submitted = false;
  validationMessage = '';
  latestResultDate: string | null = null;

  get isFutureDate(): boolean {
    return !!this.testDate && this.testDate > this.maxDate;
  }

  onResultTypeChange(): void {
    if (this.resultType === 'none') {
      this.testResult = '';
    }
  }

  onTestDateChange(form: NgForm): void {
    this.applyFutureDateValidation(form);
  }

  onSubmit(form: NgForm): void {
    this.submitted = true;
    form.form.markAllAsTouched();
    this.applyFutureDateValidation(form);
    this.validationMessage = '';
    if (
      this.latestResultDate &&
      this.testDate &&
      new Date(this.testDate) <= new Date(this.latestResultDate)
    ) {
      this.validationMessage =
        'Test date must be later than the most recent adherence result on record.';
      return;
    }


    if (this.resultType === 'percent') {
      const value = Number(this.testResult);


      if (isNaN(value)) {
        this.validationMessage = 'HbA1c % must be a numeric value.';
        return;
      }

      if (value < 2 || value > 20) {
        this.validationMessage = 'HbA1c % must be between 2 and 20.';
        return;
      }


    }

    if (this.resultType === 'mmol') {
      const value = Number(this.testResult);

      if (isNaN(value)) {
        this.validationMessage = 'HbA1c mmol/mol must be a numeric value.';
        return;
      }

      if (value < 20 || value > 200) {
        this.validationMessage = 'HbA1c mmol/mol must be between 20 and 200.';
        return;
      }
    }




    if (form.invalid || !this.resultType) {
      return;
    }

    this.adherenceResultService.setSubmission({
      planNumber: this.planNumber,
      resultType: this.resultType,
      testResult: this.testResult.trim(),
      testDate: this.testDate
    });

    this.adherenceResultService.calculate({
      planNumber: this.planNumber,
      resultType: this.resultType,
      testResult: this.testResult.trim(),
      testDate: this.testDate
    }).subscribe(result => {
      this.adherenceResultService.setCalculationResult(result);

      void this.router.navigate([
        '/plan-overview',
        this.planNumber,
        'results'
      ]);
    });
  }

  isControlInvalid(form: NgForm, controlName: string): boolean {
    const control = form.controls[controlName];
    return !!control && control.invalid && (control.touched || control.dirty || this.submitted);
  }

  hasControlError(form: NgForm, controlName: string, errorKey: string): boolean {
    const control = form.controls[controlName];
    return this.isControlInvalid(form, controlName) && !!control?.errors?.[errorKey];
  }

  private applyFutureDateValidation(form: NgForm): void {
    const testDateControl = form.controls['testDate'];

    if (!testDateControl) {
      return;
    }

    const currentErrors = testDateControl.errors ?? {};

    if (this.isFutureDate) {
      testDateControl.setErrors({ ...currentErrors, futureDate: true });
      return;
    }

    if (!currentErrors['futureDate']) {
      return;
    }

    const { futureDate, ...remainingErrors } = currentErrors as Record<string, unknown>;
    testDateControl.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
  }
}
