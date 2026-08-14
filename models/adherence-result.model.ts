export type ResultType = 'percent' | 'mmol' | 'none';

export interface AdherenceResultSubmission {
  planNumber: string;
  resultType: ResultType;
  testResult: string;
  testDate: string;
}
