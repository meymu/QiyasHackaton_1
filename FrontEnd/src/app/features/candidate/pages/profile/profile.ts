import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../public/services/auth.service';
import { CandidateProfile, CandidateService } from '../../candidate.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  isEditing = false;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  candidate: CandidateProfile | null = null;

  private readonly candidateService = inject(CandidateService);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.candidateService.getProfile().subscribe({
      next: profile => {
        this.candidate = profile;
        this.isLoading = false;
      },
      error: error => {
        this.errorMessage = this.authService.getErrorMessage(error);
        this.isLoading = false;
      },
    });
  }

  editProfile() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.loadProfile();
  }

  saveProfile() {
    if (!this.candidate || this.isSaving) return;

    const {
      fullName,
      headline,
      institution,
      fieldOfStudy,
      degreeLevel,
      graduationYear,
      gitHubUrl,
      portfolioUrl,
    } = this.candidate;

    this.isSaving = true;
    this.errorMessage = '';
    this.candidateService.updateProfile({
      fullName,
      headline,
      institution,
      fieldOfStudy,
      degreeLevel,
      graduationYear,
      gitHubUrl,
      portfolioUrl,
    }).subscribe({
      next: profile => {
        this.candidate = profile;
        this.isEditing = false;
        this.isSaving = false;
      },
      error: error => {
        this.errorMessage = this.authService.getErrorMessage(error);
        this.isSaving = false;
      },
    });
  }

}