import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { filter } from 'rxjs';

import { AdminService } from '../services/admin.service';
import { TokenService } from '../services/token.service';
import { AdminReports } from '../services/admin.models.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  adminName = '';
  adminRole = 'Admin';

  activeSection: 'dashboard' | 'users' | 'roles' | 'reports' | 'settings' = 'dashboard';
  showProfile = false;

  reports?: AdminReports;

  private refreshTimeout: any;

  @ViewChild('profileBox') profileBox!: ElementRef;

  constructor(
    private adminService: AdminService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    const token = this.tokenService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfile();
    this.loadAdminReports();
    this.scheduleTokenRefresh();

    // Update active section automatically on route change
this.router.events.pipe(
  filter(event => event instanceof NavigationEnd)
).subscribe((event: any) => {
  const url = event.urlAfterRedirects;

  if (url.includes('users')) this.activeSection = 'users';
  else if (url.includes('roles')) this.activeSection = 'roles';
  else this.activeSection = 'dashboard';
});

  }

  ngOnDestroy(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
  }

  // ================= NAVIGATION =================
  navigateTo(
  section: 'dashboard' | 'users' | 'roles' | 'reports' | 'settings'
): void {
  this.activeSection = section;

  switch (section) {
    case 'dashboard':
      this.router.navigate(['/admin-dashboard']);
      break;

    case 'users':
      this.router.navigate(['/admin-dashboard', 'users']);
      break;

    case 'roles':
      this.router.navigate(['/admin-dashboard', 'roles']);
      break;

    case 'reports':
      // ✅ SECTION ONLY — DO NOT NAVIGATE
      this.router.navigate(['/admin-dashboard', 'reports']);
      break;

    case 'settings':
      this.router.navigate(['/admin-dashboard', 'settings']);
      break;
  }
}


  // ================= PROFILE =================
  toggleProfile(): void {
    this.showProfile = !this.showProfile;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    if (
      this.showProfile &&
      this.profileBox &&
      !this.profileBox.nativeElement.contains(event.target)
    ) {
      this.showProfile = false;
    }
  }

  logout(): void {
    this.tokenService.removeTokens();
    this.router.navigate(['/login']);
  }

  // ================= LOAD PROFILE =================
  loadProfile(): void {
  this.adminService.getCurrentUser().subscribe({
    next: (user: any) => {
      if (user) {
        this.adminName = user.name || 'Admin';
        this.adminRole = user.role || 'Admin'; // role is STRING
      }
    },
    error: (err) => {
      console.error('Failed to load profile', err);
      this.router.navigate(['/login']);
    }
  });
}


  // ================= LOAD REPORTS =================
  loadAdminReports(): void {
    this.adminService.getAdminReports().subscribe({
      next: (res) => (this.reports = res),
      error: (err) => console.error(err)
    });
  }

  // ================= TOKEN REFRESH =================
  private scheduleTokenRefresh(): void {
    const token = this.tokenService.getToken();
    if (!token) return;

    try {
      const decoded: any = this.tokenService.decodeToken(token);
      const expiryTime = (decoded.exp || 0) * 1000;
      const popupTime = Math.max(expiryTime - Date.now() - 120000, 0);

      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
      }

      this.refreshTimeout = setTimeout(
        () => this.showRefreshPopup(),
        popupTime
      );
    } catch {
      console.error('Token refresh scheduling failed');
    }
  }

  private showRefreshPopup(): void {
    Swal.fire({
      title: 'Session Expiring',
      text: 'Click OK to continue your session',
      icon: 'warning',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    }).then(() => this.refreshToken());
  }

  private refreshToken(): void {
    const accessToken = this.tokenService.getToken();
    const refreshToken = this.tokenService.getRefreshToken();

    if (!accessToken || !refreshToken) {
      this.logout();
      return;
    }

    this.adminService.refreshToken(accessToken, refreshToken).subscribe({
      next: (res: any) => {
        this.tokenService.setToken(res.token);
        this.tokenService.setRefreshToken(res.refreshToken);

        this.loadProfile();
        this.loadAdminReports();
        this.scheduleTokenRefresh();

        Swal.fire('Success', 'Session refreshed!', 'success');
      },
      error: () => {
        Swal.fire('Session Expired', 'Please login again', 'error');
        this.logout();
      }
    });
  }

  // ================= EXTRA METHODS =================
  goToUsers(): void {
    this.router.navigate(['/admin-dashboard', 'users']); // keep it nested
  }

  goToRoles(): void {
    this.router.navigate(['/admin-dashboard', 'roles']); // keep it nested
  }
}
