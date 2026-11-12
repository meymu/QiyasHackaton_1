import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { AuthService } from '../../../public/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  jobs$ = inject(CompanyService).getJobs();
  displayName = inject(AuthService).displayName ?? 'there';
}