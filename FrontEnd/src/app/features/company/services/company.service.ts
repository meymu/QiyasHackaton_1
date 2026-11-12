import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, switchMap, throwError } from 'rxjs';
import {
  Applicant, ApplicationStatus, CompanyStats, Job, JobInput, RequiredSkill,
} from '../models/company.model';

interface JobRequest {
  title: string;
  description: string;
  requiredSkillIds: number[];
}

const API_URL = 'http://localhost:5099/api';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly jobsUrl = `${API_URL}/jobs`;

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.jobsUrl);
  }

  getJob(id: number): Observable<Job | undefined> {
    return this.http.get<Job>(`${this.jobsUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) return [undefined];
        return throwError(() => error);
      }),
    );
  }

  addJob(input: JobInput): Observable<Job> {
    return this.toRequest(input).pipe(
      switchMap(request => this.http.post<Job>(this.jobsUrl, request)),
    );
  }

  updateJob(id: number, input: JobInput): Observable<Job> {
    return this.toRequest(input).pipe(
      switchMap(request => this.http.put<Job>(`${this.jobsUrl}/${id}`, request)),
    );
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.jobsUrl}/${id}`);
  }

  getApplicants(_jobId?: number): Observable<Applicant[]> {
    return this.unavailable('Applicant endpoints are not implemented by the backend.');
  }

  getApplicant(_id: number): Observable<Applicant | undefined> {
    return this.unavailable('Applicant endpoints are not implemented by the backend.');
  }

  updateApplicantStatus(
    _id: number,
    _status: ApplicationStatus,
  ): Observable<Applicant | undefined> {
    return this.unavailable('Applicant endpoints are not implemented by the backend.');
  }

  getStats(): Observable<CompanyStats> {
    return this.unavailable('Company statistics are not implemented by the backend.');
  }

  private toRequest(input: JobInput): Observable<JobRequest> {
    return this.http.get<RequiredSkill[]>(`${API_URL}/skills`).pipe(
      map(skills => {
        const skillsByName = new Map(
          skills.map(skill => [skill.name.trim().toLocaleLowerCase(), skill]),
        );
        const requestedSkills = input.skills.map(name => name.trim()).filter(Boolean);
        const requiredSkillIds = requestedSkills.map(name => {
          const skill = skillsByName.get(name.toLocaleLowerCase());
          if (!skill) throw new Error(`Unknown required skill: ${name}`);
          return skill.id;
        });

        if (requiredSkillIds.length === 0) {
          throw new Error('At least one required skill must be selected.');
        }

        return {
          title: input.title,
          description: input.description,
          requiredSkillIds: [...new Set(requiredSkillIds)],
        };
      }),
    );
  }

  private unavailable<T>(message: string): Observable<T> {
    return throwError(() => new Error(message));
  }
}
