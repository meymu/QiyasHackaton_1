import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthResponse, AuthService, RegisterRequest } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const response: AuthResponse = {
    accessToken: 'test-token',
    expiresAtUtc: '2026-10-12T12:00:00Z',
    user: {
      id: 1,
      email: 'user@example.com',
      role: 'Candidate',
      displayName: 'Test User',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    service.logout();
  });

  it('posts login credentials and stores the returned token', () => {
    service.login('user@example.com', 'password123').subscribe(result => {
      expect(result).toEqual(response);
      expect(service.accessToken).toBe('test-token');
      expect(service.displayName).toBe('Test User');
    });

    const request = http.expectOne('http://localhost:5099/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'user@example.com',
      password: 'password123',
    });
    request.flush(response);
  });

  it('posts the selected registration role and profile data', () => {
    const registration: RegisterRequest = {
      email: 'user@example.com',
      password: 'password123',
      role: 'Candidate',
      candidate: {
        fullName: 'Test User',
        headline: null,
        institution: 'Test University',
        fieldOfStudy: 'Computer Science',
        degreeLevel: "Bachelor's",
        graduationYear: 2026,
        gitHubUrl: null,
        portfolioUrl: null,
      },
      employer: null,
    };

    service.register(registration).subscribe(result => {
      expect(result.user.role).toBe('Candidate');
      expect(service.accessToken).toBe('test-token');
      expect(service.displayName).toBe('Test User');
    });

    const request = http.expectOne('http://localhost:5099/api/auth/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(registration);
    request.flush(response);
  });

  it('includes backend validation field names in the displayed error', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        title: 'One or more validation errors occurred.',
        errors: { Password: ['Passwords must include an uppercase letter.'] },
      },
    });

    expect(service.getErrorMessage(error)).toBe(
      'One or more validation errors occurred.: Password: Passwords must include an uppercase letter.',
    );
  });
});
