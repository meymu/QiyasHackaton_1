import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, switchMap } from 'rxjs';

const API_URL = 'http://localhost:5099/api';

export interface RecommendedJob {
  id: number;
  title: string;
  company: string;
  skills: string[];
  match: number;
}

export interface CandidateDashboard {
  applications: number;
  pending: number;
  shortlisted: number;
  recommendedJobs: RecommendedJob[];
}

export interface CandidateSkill {
  id: number;
  name: string;
}

export interface CandidateProfile {
  id: number;
  userId: number;
  fullName: string;
  headline: string | null;
  institution: string;
  fieldOfStudy: string | null;
  degreeLevel: string | null;
  graduationYear: number | null;
  gitHubUrl: string | null;
  portfolioUrl: string | null;
  skills: CandidateSkill[];
  email: string;
}

export type CandidateProfileUpdate = Pick<
  CandidateProfile,
  'fullName' | 'headline' | 'institution' | 'fieldOfStudy' | 'degreeLevel' |
  'graduationYear' | 'gitHubUrl' | 'portfolioUrl'
>;

interface CurrentUser {
  email: string;
}

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<CandidateDashboard> {
    return this.http.get<CandidateDashboard>(`${API_URL}/candidates/me/dashboard`);
  }

  getProfile(): Observable<CandidateProfile> {
    return forkJoin({
      profile: this.http.get<Omit<CandidateProfile, 'email'>>(`${API_URL}/candidates/me`),
      user: this.http.get<CurrentUser>(`${API_URL}/auth/me`),
    }).pipe(
      map(({ profile, user }) => ({ ...profile, email: user.email })),
    );
  }

  updateProfile(profile: CandidateProfileUpdate): Observable<CandidateProfile> {
    return this.http.put<void>(`${API_URL}/candidates/me`, profile).pipe(
      switchMap(() => this.getProfile()),
    );
  }
}