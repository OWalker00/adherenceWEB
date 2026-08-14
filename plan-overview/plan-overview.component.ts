import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PlanOverview } from '../../models/plan-overview.model';
import { PlanLookupService } from '../../services/plan-lookup.service';

@Component({
  selector: 'app-plan-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan-overview.component.html',
  styleUrl: './plan-overview.component.css'
})
export class PlanOverviewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly planLookupService = inject(PlanLookupService);

  planOverview$!: Observable<PlanOverview>;
  private planNumber = '';
  errorMessage = '';
  ngOnInit(): void {
    this.planNumber = this.route.snapshot.paramMap.get('planNumber') ?? '';
    this.planOverview$ = this.planLookupService.getPlanOverview(this.planNumber);
  }

  onAddNewResult(): void {
    void this.router.navigate(['/plan-overview', this.planNumber, 'add-adherence-result']);
  }
}
