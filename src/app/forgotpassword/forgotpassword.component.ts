import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent {

  email = '';
  loading = false;
  emailNotExists = false; // 👈 validation flag

  constructor(private auth: AuthService) {}

  // ✅ Email format regex
  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    return emailPattern.test(email);
  }

  forgotPassword() {
    // Required field check
    if (!this.email.trim()) {
      Swal.fire('Error', 'Please enter your email', 'error');
      return;
    }

    // Email format check
    if (!this.isValidEmail(this.email)) {
      Swal.fire('Error', 'Please enter a valid email address', 'error');
      return;
    }

    this.loading = true;

    this.auth.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire(
          'Reset Link Sent',
          'A reset link has been sent to your email.',
          'success'
        );
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to send reset link', 'error');
      }
    });
  }
}
