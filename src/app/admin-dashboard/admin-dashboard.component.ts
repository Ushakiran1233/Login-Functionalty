import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';
import { RouterOutlet, NavigationEnd, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import Swal from 'sweetalert2';

import { AdminService } from '../services/admin.service';
import { TokenService } from '../services/token.service';
import { AdminReports } from '../services/admin.models.model';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  showWelcome = false;

  adminName = '';
  adminRole = 'Admin';

  activeSection: string = 'dashboard';
  activeSubSection: string = '';

  showProfile = false;
  showSubmenu = false;

  userPermissions: string[] = [];
  hasSecurityAccess = false;

  reports?: AdminReports;

  // ================== CHANGE PASSWORD ==================
  showChangePassword = false;
  model: any = {
    CurrentPassword: '',
    NewPassword: '',
    ConfirmPassword: ''
  };
  successMessage = '';
  errorMessage = '';

  private refreshTimeout: any;
  private autoLogoutTime = 10 * 60 * 1000;

  @ViewChild('profileBox') profileBox!: ElementRef;

  constructor(
    private adminService: AdminService,
    private tokenService: TokenService,
    private router: Router,private auth: AuthService,
  ) {
    const nav = this.router.getCurrentNavigation();
    this.showWelcome = nav?.extras?.state?.['showWelcome'] === true;
  }

  // ================= INIT =================
  ngOnInit(): void {

    const token = this.tokenService.getToken();
    if (!token) {
      this.router.navigate(['/login']);

      return;
    }

    this.adminName = localStorage.getItem('adminName') || 'Admin';
    this.showWelcome = history.state?.showWelcome === true;

    this.loadProfile();
    this.loadAdminReports();
    this.scheduleTokenRefresh();
    this.scheduleAutoLogout();

    this.adminService.getUserPermissions().subscribe({
      next: (perms: string[]) => {
        this.userPermissions = (perms || []).map(p => p.toLowerCase());
        this.hasSecurityAccess = this.userPermissions.includes('viewsecurityaccess');
      },
      error: () => {
        this.userPermissions = [];
        this.hasSecurityAccess = false;
      }
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        if (url.includes('/reports')) this.activeSection = 'reports';
        else if (url.includes('/settings')) this.activeSection = 'settings';
        else this.activeSection = 'dashboard';
      });
  }

  ngOnDestroy(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
  }

  // ================= SIDEBAR =================
  toggleSection(section: string): void {

    if (section !== 'dashboard') {
      this.activeSection = section;
      this.showSubmenu = false;
      this.activeSubSection = '';
      this.navigateTo(section);
      return;
    }

    this.activeSection = 'dashboard';
    if (!this.hasSecurityAccess) {
      this.showSubmenu = false;
      return;
    }
    this.showSubmenu = !this.showSubmenu;
  }

  toggleSubSection(sub: string): void {
    if (!this.hasSecurityAccess) return;
    this.activeSubSection = this.activeSubSection === sub ? '' : sub;
  }

  navigateTo(section: string): void {
    switch (section) {
      case 'dashboard': this.router.navigate(['/admin-dashboard']); break;
      case 'users': this.router.navigate(['/admin-dashboard/users']); break;
      case 'roles': this.router.navigate(['/admin-dashboard/roles']); break;
      case 'reports': this.router.navigate(['/admin-dashboard/reports']); break;
      case 'settings': this.router.navigate(['/admin-dashboard/settings']); break;
    }
  }

  // ================= HELPERS =================
  canAccess(permission: string): boolean {
    return this.userPermissions.includes(permission.toLowerCase());
  }

  isActive(section: string): boolean {
    return this.activeSection === section || this.activeSubSection === section;
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

  // ================= DATA =================
  loadProfile(): void {
    this.adminService.getCurrentUser().subscribe({
      next: (user: any) => {
        this.adminName = user?.name || 'Admin';
        this.adminRole = user?.role || 'Admin';
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  loadAdminReports(): void {
    this.adminService.getAdminReports().subscribe({
      next: res => (this.reports = res),
      error: err => console.error(err)
    });
  }

  // ================= TOKEN =================
  private scheduleTokenRefresh(): void {
    const token = this.tokenService.getToken();
    if (!token) return;

    try {
      const decoded: any = this.tokenService.decodeToken(token);
      const expiry = decoded.exp * 1000;
      const popupTime = Math.max(expiry - Date.now() - 120000, 0);

      this.refreshTimeout = setTimeout(() => this.showRefreshPopup(), popupTime);
    } catch {}
  }

  private showRefreshPopup(): void {
    Swal.fire({
      title: 'Session Expiring',
      text: 'Click OK to continue',
      icon: 'warning',
      confirmButtonText: 'OK'
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
        this.scheduleTokenRefresh();
      },
      error: () => this.logout()
    });
  }

  private scheduleAutoLogout(): void {
    this.refreshTimeout = setTimeout(() => {
      Swal.fire('Logged Out', 'Inactive too long', 'info').then(() => this.logout());
    }, this.autoLogoutTime);
  }

  // ================= CHANGE PASSWORD =================
  openChangePassword(): void {
    this.showChangePassword = true;
    this.clearChangePasswordForm();
  }

  closeChangePassword(): void {
    this.showChangePassword = false;
  }

  changePassword(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.model.CurrentPassword || !this.model.NewPassword || !this.model.ConfirmPassword) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    if (this.model.NewPassword !== this.model.ConfirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;

    }

    this.auth.changePassword(this.model).subscribe({
      next: () => {
        this.successMessage = 'Password changed successfully!';
        this.model.CurrentPassword = '';
        this.model.NewPassword = '';
        this.model.ConfirmPassword = '';
      },
      error: (err: { error: { message: string; }; }) => {
        this.errorMessage = err?.error?.message || 'Failed to change password.';
      }
    });
  }

  private clearChangePasswordForm(): void {
    this.model.CurrentPassword = '';
    this.model.NewPassword = '';
    this.model.ConfirmPassword = '';
    this.successMessage = '';
    this.errorMessage = '';
  }
}
