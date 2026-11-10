import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  readonly isSubmitting = signal(false);
  readonly isSuccess = signal(false);
  readonly isError = signal(false);
  readonly showPassword = signal(false);

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  clearError(): void {
    if (this.isError()) {
      this.isError.set(false);
    }
  }

  handleLoginSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.isSuccess.set(false);
    this.isError.set(false);

    setTimeout(() => {
      const isValid =
        this.email.trim().toLowerCase() === 'admin@tecno.com' &&
        this.password === 'admin123';

      this.isSubmitting.set(false);

      if (isValid) {
        this.isSuccess.set(true);
        setTimeout(() => this.isSuccess.set(false), 1800);
      } else {
        this.isError.set(true);
      }
    }, 1000);
  }
}
