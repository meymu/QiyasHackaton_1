import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CompanyService } from './company.service';

describe('CompanyService', () => {
  let service: CompanyService;
  let http: HttpTestingController;

  const job = {
    id: 7,
    employerProfileId: 3,
    title: 'Frontend Developer',
    description: 'Build Angular interfaces for our platform.',
    companyName: 'SkillBridge',
    createdAt: '2026-10-01T00:00:00Z',
    requiredSkills: [{ id: 2, name: 'Angular' }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CompanyService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads jobs from the API', () => {
    service.getJobs().subscribe(jobs => expect(jobs).toEqual([job]));

    http.expectOne('http://localhost:5099/api/jobs').flush([job]);
  });

  it('loads a job and returns undefined for a not-found response', () => {
    service.getJob(7).subscribe(result => expect(result).toEqual(job));
    http.expectOne('http://localhost:5099/api/jobs/7').flush(job);

    service.getJob(99).subscribe(result => expect(result).toBeUndefined());
    http.expectOne('http://localhost:5099/api/jobs/99').flush(
      { title: 'Not found' },
      { status: 404, statusText: 'Not Found' },
    );
  });

  it('creates a job with backend skill IDs', () => {
    service.addJob({
      title: 'Frontend Developer',
      description: 'Build Angular interfaces for our platform.',
      skills: [' angular ', 'TypeScript', 'Angular'],
    }).subscribe(result => expect(result).toEqual(job));

    http.expectOne('http://localhost:5099/api/skills').flush([
      { id: 2, name: 'Angular' },
      { id: 5, name: 'TypeScript' },
    ]);
    const request = http.expectOne('http://localhost:5099/api/jobs');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      title: 'Frontend Developer',
      description: 'Build Angular interfaces for our platform.',
      requiredSkillIds: [2, 5],
    });
    request.flush(job);
  });

  it('rejects skills that are not in the backend catalogue', () => {
    let receivedError: unknown;
    service.addJob({
      title: 'Frontend Developer',
      description: 'Build Angular interfaces for our platform.',
      skills: ['Made-up skill'],
    }).subscribe({ error: error => receivedError = error });

    http.expectOne('http://localhost:5099/api/skills').flush([
      { id: 2, name: 'Angular' },
    ]);
    expect(receivedError).toEqual(new Error('Unknown required skill: Made-up skill'));
    http.expectNone('http://localhost:5099/api/jobs');
  });

  it('updates and deletes jobs using the API', () => {
    const input = {
      title: 'Frontend Developer',
      description: 'Build Angular interfaces for our platform.',
      skills: ['Angular'],
    };

    service.updateJob(7, input).subscribe(result => expect(result).toEqual(job));
    http.expectOne('http://localhost:5099/api/skills').flush([
      { id: 2, name: 'Angular' },
    ]);
    const updateRequest = http.expectOne('http://localhost:5099/api/jobs/7');
    expect(updateRequest.request.method).toBe('PUT');
    updateRequest.flush(job);

    service.deleteJob(7).subscribe();
    const deleteRequest = http.expectOne('http://localhost:5099/api/jobs/7');
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
  });

  it('reports unavailable applicant and statistics endpoints as errors', () => {
    let applicantError: unknown;
    let statsError: unknown;
    service.getApplicants().subscribe({ error: error => applicantError = error });
    service.getStats().subscribe({ error: error => statsError = error });

    expect(applicantError).toEqual(
      new Error('Applicant endpoints are not implemented by the backend.'),
    );
    expect(statsError).toEqual(
      new Error('Company statistics are not implemented by the backend.'),
    );
  });
});
