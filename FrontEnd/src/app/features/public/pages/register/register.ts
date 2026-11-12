import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';
type AccountType = 'candidate' | 'company';

@Component({
  imports: [FormsModule, RouterLink],
  standalone: true,
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})


export class Register {
  accountType: AccountType = 'candidate';
  email = '';
  password = '';
  confirmPassword = '';
  fullName = '';
  headline = '';
  institution = '';
  fieldOfStudy = '';
  degreeLevel = '';
  graduationYear: number | null = null;
  gitHubUrl = '';
  portfolioUrl = '';
  companyName = '';
  contactName = '';
  website = '';
  errorMessage = '';
  isSubmitting = false;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  selectAccountType(type: AccountType): void {
    this.accountType = type;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    this.errorMessage = '';

    if (
      this.password.length < 8 ||
      !/[a-z]/.test(this.password) ||
      !/[A-Z]/.test(this.password) ||
      !/[0-9]/.test(this.password)
    ) {
      this.errorMessage =
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    const request: RegisterRequest = {
      email: this.email.trim(),
      password: this.password,
      role: this.accountType === 'candidate' ? 'Candidate' : 'Employer',
      candidate: this.accountType === 'candidate'
        ? {
            fullName: this.fullName.trim(),
            headline: this.headline.trim() || null,
            institution: this.institution.trim(),
            fieldOfStudy: this.fieldOfStudy.trim(),
            degreeLevel: this.degreeLevel.trim(),
            graduationYear: Number(this.graduationYear),
            gitHubUrl: this.gitHubUrl.trim() || null,
            portfolioUrl: this.portfolioUrl.trim() || null,
          }
        : null,
      employer: this.accountType === 'company'
        ? {
            companyName: this.companyName.trim(),
            contactName: this.contactName.trim(),
            website: this.website.trim() || null,
          }
        : null,
    };

    this.isSubmitting = true;
    this.authService.register(request).subscribe({
      next: response => {
        const destination = response.user.role === 'Candidate'
          ? '/candidate/dashboard'
          : response.user.role === 'Employer'
            ? '/company/dashboard'
            : null;

        if (!destination) {
          this.errorMessage = `Your account role (${response.user.role}) is not supported by this application.`;
          this.isSubmitting = false;
          return;
        }

        void this.router.navigate([destination]);
      },
      error: error => {
        this.errorMessage = this.authService.getErrorMessage(error);
        this.isSubmitting = false;
      },
    });
  }
}
