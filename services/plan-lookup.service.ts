import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';
import { PlanOverview } from '../models/plan-overview.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlanLookupService {


  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPlanOverview(planNumber: string): Observable<PlanOverview> {
    return this.http.get<any>(
      `${this.baseUrl}/plans/${planNumber}`
    ).pipe(
      map(response => ({
        policyNumber: response.Plan.PlanNumber.toString(),
        status: 'Active',
        lifeAssuredName: response.Plan.LifeAssuredName,
        policyStartDate: response.Plan.PolicyStartDate,

        currentPremium: response.Plan.CurrentPremium,
        currentReinsurance: response.Plan.CurrentReinsurance,

        a1cHistory: response.AdherenceResults.map((result: any) => ({
          date: result.ResultDate,
          result: result.A1cResult,
          premiumAdjustment: result.PremiumAdjustment,
          resultType: result.ResultType === 'HbA1cPercentage'
            ? 'HbA1c %'
            : result.ResultType === 'HbA1cMmol'
              ? 'HbA1c mmol/mol'
              : result.ResultType,
        }))
      }))
    );
  }

  saveAdherenceResult(request: any): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/plans/save`,
      request
    );
  }
}
