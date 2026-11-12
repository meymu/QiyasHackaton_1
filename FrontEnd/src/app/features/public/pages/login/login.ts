import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onSubmit(): void {
    if (this.isSubmitting) return;

    this.errorMessage = '';
    this.isSubmitting = true;
    this.authService.login(this.email.trim(), this.password).subscribe({
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
