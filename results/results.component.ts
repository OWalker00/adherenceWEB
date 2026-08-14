import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdherenceResultSubmission } from '../../models/adherence-result.model';
import { AdherenceResultService } from '../../services/adherence-result.service';
import { PlanLookupService } from '../../services/plan-lookup.service';
import { PlanOverview } from '../../models/plan-overview.model';


interface ResultSummary {
  resultType: string;
  testResult: string;
  testDate: string;
  originalHbA1c: string;
  previousHbA1c: string;
  currentHbA1c: string;
  newTotalPremiumAdjustment: string;
  newTotalReinsuranceAdjustment: string;
  outcome: string;
  nextAdherenceDueDate: string;
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})
export class ResultsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adherenceResultService = inject(AdherenceResultService);
  private readonly calculationResult = this.adherenceResultService.getCalculationResult();
  private readonly planLookupService = inject(PlanLookupService);

  readonly planNumber = this.route.snapshot.paramMap.get('planNumber') ?? '';
  private readonly submission = this.adherenceResultService.getSubmission(this.planNumber);

  private readonly planOverview$ =
    this.planLookupService.getPlanOverview(this.planNumber);

  private planOverview: PlanOverview | null = null;

  constructor() {
    this.planOverview$.subscribe(plan => {
      this.planOverview = plan;
    });
  }


  getOriginalHbA1c(): string {
    if (!this.planOverview?.a1cHistory?.length) {
      return 'Not available';
    }

    const oldest = [...this.planOverview.a1cHistory]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    return oldest.result.toString();
  }

  getPreviousHbA1c(): string {
    if (!this.planOverview?.a1cHistory?.length) {
      return 'Not available';
    }

    const newest = [...this.planOverview.a1cHistory]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return newest.result.toString();
  }
  readonly summary: ResultSummary = {
    resultType: this.getResultTypeText(this.submission),
    testResult: this.getTestResultText(this.submission),
    testDate: this.getDisplayDate(this.submission?.testDate),
    originalHbA1c: this.getOriginalHbA1c(),
    previousHbA1c: 'Not available',
    currentHbA1c: this.getTestResultText(this.submission),
    newTotalPremiumAdjustment: this.calculationResult?.NewTotalPremiumAdjustment ?? '0.0%',
    newTotalReinsuranceAdjustment: this.calculationResult?.NewTotalReinsuranceAdjustment ?? '0.0%',
    outcome: this.calculationResult?.Outcome ?? 'Continue on current terms',
    nextAdherenceDueDate: this.getNextAdherenceDueDate(this.submission?.testDate)
  };

  onConfirm(): void {

    if (!this.submission) {
      return;
    }

    const request = {
      planNumber: Number(this.submission.planNumber),
      resultType: this.submission.resultType,
      testResult: Number(this.submission.testResult),
      testDate: this.submission.testDate
    };

    this.planLookupService.saveAdherenceResult(request).subscribe({
      next: () => {
        void this.router.navigate(['/plan-overview', this.planNumber]);
      },
      error: error => {
        console.error('Save failed', error);
      }
    });
  }


  onBack(): void {
    void this.router.navigate(['/plan-overview', this.planNumber, 'add-adherence-result']);
  }

  private getResultTypeText(submission: AdherenceResultSubmission | null): string {
    if (!submission) {
      return 'Not provided';
    }

    if (submission.resultType === 'percent') {
      return 'HbA1c % result';
    }

    if (submission.resultType === 'mmol') {
      return 'HbA1c mmol/mol result';
    }

    return 'No result';
  }

  private getTestResultText(submission: AdherenceResultSubmission | null): string {
    if (!submission) {
      return 'Not provided';
    }

    if (submission.resultType === 'none') {
      return 'No result';
    }

    return submission.resultType === 'percent'
      ? `${submission.testResult}%`
      : `${submission.testResult} mmol/mol`;
  }

  private getDisplayDate(testDate: string | undefined): string {
    if (!testDate) {
      return 'Not provided';
    }

    const parsedDate = new Date(testDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not provided';
    }

    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  private getNextAdherenceDueDate(testDate: string | undefined): string {
    if (!testDate) {
      return 'Not available';
    }

    const dueDate = new Date(testDate);

    if (Number.isNaN(dueDate.getTime())) {
      return 'Not available';
    }

    dueDate.setFullYear(dueDate.getFullYear() + 1);

    return dueDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
