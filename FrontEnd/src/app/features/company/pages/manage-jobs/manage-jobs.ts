import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Job } from '../../models/company.model';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-manage-jobs',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './manage-jobs.html',
  styleUrl: './manage-jobs.css',
})
export class ManageJobs {
  private service = inject(CompanyService);
  jobs: Job[] = [];

  constructor() {
    this.load();
  }

  load() {
    this.service.getJobs().subscribe(j => (this.jobs = j));
  }

  remove(job: Job) {
    if (confirm(`Delete "${job.title}"?`)) {
      this.service.deleteJob(job.id).subscribe(() => this.load());
    }
  }
}