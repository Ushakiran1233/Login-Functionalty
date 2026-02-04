import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-changepassword',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterLink],
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent {

  model = {
    CurrentPassword: '',
    NewPassword: '',
    ConfirmPassword: ''
  };

  errorMessage = '';
  successMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  changePassword() {
  this.errorMessage = '';
  this.successMessage = '';

 this.auth.changePassword(this.model).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Password changed successfully';
        this.errorMessage = '';
        
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.Errors?.join(', ') || 'Something went wrong';
        this.successMessage = '';
      }
    });
}

}
