import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { AuthService } from '../../../public/services/auth.service';
import { CandidateService } from '../../candidate.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: AuthService, useValue: { displayName: 'Test Candidate', getErrorMessage: () => 'Request failed' } },
        {
          provide: CandidateService,
          useValue: {
            getDashboard: () => of({
              applications: 0,
              pending: 0,
              shortlisted: 0,
              recommendedJobs: [],
            }),
          },
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
