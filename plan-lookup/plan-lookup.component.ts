import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanLookupService } from '../../services/plan-lookup.service';

@Component({
  selector: 'app-plan-lookup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-lookup.component.html',
  styleUrl: './plan-lookup.component.css'
})
export class PlanLookupComponent {
  private readonly router = inject(Router);
  private readonly planLookupService = inject(PlanLookupService);

  planNumber = '';
  errorMessage = '';

  onSearch(): void {
    const trimmedPlanNumber = this.planNumber.trim();

    this.errorMessage = '';

    if (!trimmedPlanNumber) {
      this.errorMessage = 'Please enter a plan number.';
      return;
    }

    if (!/^\d+$/.test(trimmedPlanNumber)) {
    this.errorMessage = 'Plan number must contain numbers only.';
    return;
}

this.planLookupService.getPlanOverview(trimmedPlanNumber).subscribe({
  next: () => {
    void this.router.navigate(['/plan-overview', trimmedPlanNumber]);
  },
  error: () => {
    this.errorMessage = 'Plan not found. Please enter a valid policy number.';
  }
});
}
}
