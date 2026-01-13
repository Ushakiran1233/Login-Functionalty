import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { error } from 'console';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
 errorMessage:any;
  
  constructor(private auth:AuthService,private router:Router){}
  model:any={};
login() {
   this.errorMessage = '';

  if (!this.model.email || !this.model.password) {
    this.errorMessage = 'Email and password are required';
    return;
  }

  if (!this.model.email.includes('@')) {
    this.errorMessage = 'Enter a valid email';
    return;
  }
  this.auth.login(this.model).subscribe((res: any) => {
    localStorage.setItem('token', res.token);

    const role = this.auth.getRole();

    role === 'Admin'
      ? this.router.navigate(['/admin-dashboard'])
      : this.router.navigate(['/dashboard']);
  });
}


}
