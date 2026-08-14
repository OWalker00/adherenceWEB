import { Plan } from './plan.model';

export interface A1cHistoryEntry {
    date: string;
    result: number;
    premiumAdjustment: string;
    resultType?: string;
}

export interface PlanOverview extends Plan {
  lifeAssuredName: string;
  policyStartDate: string;
  a1cHistory: A1cHistoryEntry[];
}
