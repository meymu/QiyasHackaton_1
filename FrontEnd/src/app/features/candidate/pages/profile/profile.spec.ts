import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Profile } from './profile';
import { AuthService } from '../../../public/services/auth.service';
import { CandidateProfile, CandidateService } from '../../candidate.service';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  const profile: CandidateProfile = {
    id: 1,
    userId: 1,
    fullName: 'Test Candidate',
    headline: 'Software Developer',
    institution: 'Test University',
    fieldOfStudy: 'Computer Science',
    degreeLevel: 'Bachelor',
    graduationYear: 2025,
    gitHubUrl: null,
    portfolioUrl: null,
    skills: [{ id: 1, name: 'Angular' }],
    email: 'candidate@example.com',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        { provide: AuthService, useValue: { getErrorMessage: () => 'Request failed' } },
        {
          provide: CandidateService,
          useValue: {
            getProfile: () => of(profile),
            updateProfile: () => of(profile),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays the profile returned by the service', () => {
    expect(fixture.nativeElement.textContent).toContain('Test Candidate');
    expect(fixture.nativeElement.textContent).toContain('Angular');
    expect(fixture.nativeElement.textContent).toContain('Test University');
  });
});
