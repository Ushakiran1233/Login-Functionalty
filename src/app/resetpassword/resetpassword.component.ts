import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent implements OnInit {

  model = {
    email: '',
    token: '',
    newPassword: '',
    confirmPassword:''
  };

  

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.model.email =
      this.route.snapshot.queryParamMap.get('email') || '';

    this.model.token =
      this.route.snapshot.queryParamMap.get('token') || '';

    // 🚫 Invalid or missing token
    if (!this.model.email || !this.model.token) {
      alert('Invalid or expired reset link');
      this.router.navigate(['/login']);
    }
  }

  resetPassword() {
    if (!this.model.newPassword || !this.model.confirmPassword) {
      alert('Please fill all fields');
      return;
    }

    if (this.model.newPassword !== this.model.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.auth.resetPassword(this.model).subscribe({
      next: (res: any) => {
        alert(res.message || 'Password reset successful');
        this.router.navigate(['/login']);
      },
      error: err => {
        console.error(err);
        alert(err?.error?.message || 'Reset password failed');
      }
    });
  }
}
