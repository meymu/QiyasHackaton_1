import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { CompanyService } from '../../services/company.service';
import { ManageJobs } from './manage-jobs';

describe('ManageJobs', () => {
  let fixture: ComponentFixture<ManageJobs>;
  let component: ManageJobs;
  let service: {
    getJobs: ReturnType<typeof vi.fn>;
    deleteJob: ReturnType<typeof vi.fn>;
  };

  const jobs = [
    {
      id: 1,
      employerProfileId: 2,
      title: 'Frontend Developer',
      description: 'Build Angular interfaces.',
      companyName: 'SkillBridge',
      createdAt: '2026-10-01T00:00:00Z',
      requiredSkills: [{ id: 1, name: 'Angular' }],
    },
    {
      id: 2,
      employerProfileId: 2,
      title: 'Backend Developer',
      description: 'Build backend services.',
      companyName: 'SkillBridge',
      createdAt: '2026-10-02T00:00:00Z',
      requiredSkills: [{ id: 2, name: 'C#' }],
    },
  ];

  beforeEach(async () => {
    service = {
      getJobs: vi.fn(() => of(jobs)),
      deleteJob: vi.fn(() => of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [ManageJobs],
      providers: [
        provideRouter([]),
        { provide: CompanyService, useValue: service },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ManageJobs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a row for each job', () => {
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('deletes a job after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.remove(component.jobs[0]);
    expect(service.deleteJob).toHaveBeenCalledWith(1);
    expect(service.getJobs).toHaveBeenCalledTimes(2);
  });

  it('keeps the job when deletion is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.remove(component.jobs[0]);
    expect(service.deleteJob).not.toHaveBeenCalled();
  });
});