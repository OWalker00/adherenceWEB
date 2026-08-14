import { Injectable } from '@angular/core';
import { AdherenceResultSubmission } from '../models/adherence-result.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdherenceResultService {

  constructor(private readonly http: HttpClient) { }

  private readonly submissionsByPlan = new Map<string, AdherenceResultSubmission>();

  private calculationResult: any;

  setCalculationResult(result: any): void {
    this.calculationResult = result;
  }

  getCalculationResult(): any {
    return this.calculationResult;
  }

  setSubmission(submission: AdherenceResultSubmission): void {
    this.submissionsByPlan.set(submission.planNumber, submission);
  }

  getSubmission(planNumber: string): AdherenceResultSubmission | null {
    return this.submissionsByPlan.get(planNumber) ?? null;
  }

  calculate(submission: AdherenceResultSubmission) {
    return this.http.post(
      'https://localhost:44388/api/plans/calculate',
      {
        planNumber: submission.planNumber,
        resultType: submission.resultType,
        testResult: Number(submission.testResult),
        testDate: submission.testDate
      }
    );
  }
}
