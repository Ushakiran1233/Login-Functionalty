import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {

  adminEmail = '';

  constructor(private router: Router) {
    this.loadAdmin();
  }

  loadAdmin() {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.adminEmail = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
