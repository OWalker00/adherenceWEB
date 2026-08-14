export interface Plan {
    policyNumber: string;
    status: string;

    currentPremium?: number;
    currentReinsurance?: number;
}
