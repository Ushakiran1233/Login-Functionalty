import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule,RouterLink,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
confirmPassword: any;
errorMessage: any;
 
  constructor(private auth:AuthService,private router:Router){}
  model = { email: '', password: '', role: 'User' };
roles = ['Admin', 'User'];

register() {
   this.errorMessage = '';

  if (!this.model.email || !this.model.password || !this.confirmPassword || !this.model.role) {
    this.errorMessage = 'All fields are required';
    return;
  }
   if (!this.model.email.includes('@')) {
    this.errorMessage = 'Invalid email address';
    return;
  }
  if (this.model.password.length < 6) {
    this.errorMessage = 'Password must be at least 6 characters';
    return;
  }
   if (this.model.password !== this.confirmPassword) {
    this.errorMessage = 'Passwords do not match';
    return;
  }
  this.auth.register(this.model).subscribe({
    next: () => this.router.navigate(['/login']),
    error: err => alert(err.error[0]?.description)
  });
}


}
