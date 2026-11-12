import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { catchError, of } from 'rxjs';
import { JobCard } from '../../components/job-card/job-card';
import { AuthService } from '../../../public/services/auth.service';
import { CandidateService } from '../../candidate.service';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, JobCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private readonly authService = inject(AuthService);

  candidateName = this.authService.displayName ?? 'there';
  errorMessage = '';
  dashboard$ = inject(CandidateService).getDashboard().pipe(
    catchError(error => {
      this.errorMessage = this.authService.getErrorMessage(error);
      return of(null);
    }),
  );

}