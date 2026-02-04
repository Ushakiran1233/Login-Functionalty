import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  // ===== REGISTRATION MODEL =====
  model = {
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: 'User'
  };

  // ===== COMPONENT STATE =====
  errorMessage = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ===== REGISTER USER =====
  register() {
    this.errorMessage = '';

    if (this.model.password !== this.model.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;

    this.auth.register(this.model).subscribe({
      next: (res: any) => {
        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          html: `
            <p>Your account has been <b>activated</b>.</p>
            <p>A confirmation email has been sent to:</p>
            <b>${this.model.email}</b>
          `,
          confirmButtonText: 'Go to Login'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },

      error: err => {
        this.loading = false;

        // backend string or object support
        if (typeof err?.error === 'string') {
          this.errorMessage = err.error;
        } else if (Array.isArray(err?.error)) {
          this.errorMessage = err.error.join(', ');
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}
