import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';

const API_URL = 'http://localhost:5099/api/auth';

export interface CandidateRegistration {
  fullName: string;
  headline: string | null;
  institution: string;
  fieldOfStudy: string;
  degreeLevel: string;
  graduationYear: number;
  gitHubUrl: string | null;
  portfolioUrl: string | null;
}

export interface EmployerRegistration {
  companyName: string;
  contactName: string;
  website: string | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'Candidate' | 'Employer';
  candidate: CandidateRegistration | null;
  employer: EmployerRegistration | null;
}

export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  user: {
    id: number;
    email: string;
    role: string;
    displayName: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  get accessToken(): string | null {
    return this.isBrowser ? localStorage.getItem('skillbridge.accessToken') : null;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/login`, { email, password }).pipe(
      tap(response => this.storeAuth(response)),
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/register`, request).pipe(
      tap(response => this.storeAuth(response)),
    );
  }

  get displayName(): string | null {
    return this.isBrowser ? localStorage.getItem('skillbridge.displayName') : null;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('skillbridge.accessToken');
      localStorage.removeItem('skillbridge.displayName');
    }
  }

  getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return error instanceof Error ? error.message : 'An unexpected error occurred.';
    }

    const body: unknown = error.error;
    if (typeof body === 'string' && body.trim()) return body;
    if (body && typeof body === 'object') {
      const problem = body as { title?: unknown; detail?: unknown; errors?: unknown };
      if (typeof problem.detail === 'string') return problem.detail;
      if (typeof problem.title === 'string') {
        if (problem.errors && typeof problem.errors === 'object') {
          const validationMessages = Object.entries(problem.errors)
            .flatMap(([field, messages]) => {
              if (!Array.isArray(messages)) return [];
              return messages
                .filter((message): message is string => typeof message === 'string')
                .map(message => `${field}: ${message}`);
            });
          if (validationMessages.length) {
            return `${problem.title}: ${validationMessages.join(' ')}`;
          }
        }
        return problem.title;
      }
    }

    return error.status
      ? `The request failed (${error.status}). Please try again.`
      : 'Unable to reach the server. Check that the backend is running and try again.';
  }

  private storeAuth(response: AuthResponse): void {
    if (!this.isBrowser) return;
    localStorage.setItem('skillbridge.accessToken', response.accessToken);
    localStorage.setItem('skillbridge.displayName', response.user.displayName);
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
