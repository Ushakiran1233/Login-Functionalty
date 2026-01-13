import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent implements OnInit {

  model = {
    email: '',
    token: '',
    newPassword: ''
  };

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.model.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.model.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  resetPassword() {
    if (!this.model.newPassword) {
      alert('Please enter new password');
      return;
    }

    this.auth.resetPassword(this.model).subscribe({
  next: (res: any) => {
    alert(res.message);  // "Reset Success"
    this.router.navigate(['/login']);
  },
  error: err => {
    console.error(err);
    alert('Reset password failed');
  }
});

  }
}
