import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent {

  email = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}
forgotPassword() {
  this.auth.forgotPassword(this.email).subscribe({
    next: (res: any) => {

      // Always navigate
      this.router.navigate(['/reset-password'], {
        queryParams: {
          email: this.email,
          token: res?.token ?? ''
        }
      });
    },
    error: err => {
      console.error(err);
      alert('Failed to generate reset token');
    }
  });
}

}
