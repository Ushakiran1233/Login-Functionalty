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
    role: 'User'   // default role, backend requires it
  };

  // ===== COMPONENT STATE =====
  errorMessage = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  // ===== TOGGLE PASSWORD VISIBILITY =====
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ===== REGISTER USER =====
  register() {
    this.errorMessage = '';

    // Password validation
    if (this.model.password !== this.model.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;

    this.auth.register(this.model).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire('Success', 'Registered successfully!', 'success');
        this.router.navigate(['/login']);
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Registration failed';
      }
    });
  }
}
