import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import Swal from 'sweetalert2';

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

  activeSection: string = 'dashboard';
  activeSubSection: string = '';

  showProfile = false;
  showSubmenu = false;

  userPermissions: string[] = [];
  hasSecurityAccess = false;

  reports?: AdminReports;

  private refreshTimeout: any;
  private autoLogoutTime = 10 * 60 * 1000;

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
    this.scheduleAutoLogout();

    // 🔹 Load permissions
    this.adminService.getUserPermissions().subscribe({
      next: (perms: string[]) => {
        this.userPermissions = perms || [];
        this.hasSecurityAccess =
          this.userPermissions.includes('ViewSecurityAccess');
      },
      error: () => {
        this.userPermissions = [];
        this.hasSecurityAccess = false;
      }
    });

    // 🔹 Route sync (NO submenu forcing)
   this.router.events
  .pipe(filter(event => event instanceof NavigationEnd))
  .subscribe((event: any) => {
    const url = event.urlAfterRedirects;

    if (url.includes('/reports')) {
      this.activeSection = 'reports';
    } else if (url.includes('/settings')) {
      this.activeSection = 'settings';
    } else {
      this.activeSection = 'dashboard';
    }
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

  // 🔥 ONLY toggle submenu – do NOT touch activeSubSection
  this.showSubmenu = !this.showSubmenu;

  console.log('DASHBOARD CLICK 👉', {
    activeSection: this.activeSection,
    showSubmenu: this.showSubmenu,
    hasSecurityAccess: this.hasSecurityAccess,
    activeSubSection: this.activeSubSection
  });
}



  toggleSubSection(sub: string): void {
  if (!this.hasSecurityAccess) return;

  this.activeSubSection =
    this.activeSubSection === sub ? '' : sub;

  console.log('SUBMENU CLICK 👉', this.activeSubSection);
}


  navigateTo(section: string): void {
    switch (section) {
      case 'dashboard':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'users':
        this.router.navigate(['/admin-dashboard/users']);
        break;
      case 'roles':
        this.router.navigate(['/admin-dashboard/roles']);
        break;
      case 'reports':
        this.router.navigate(['/admin-dashboard/reports']);
        break;
      case 'settings':
        this.router.navigate(['/admin-dashboard/settings']);
        break;
    }
  }

  // ================= HELPERS =================
  canAccess(permission: string): boolean {
    return this.userPermissions.includes(permission);
  }

  isActive(section: string): boolean {
    return (
      this.activeSection === section ||
      this.activeSubSection === section
    );
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

      this.refreshTimeout = setTimeout(
        () => this.showRefreshPopup(),
        popupTime
      );
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
      Swal.fire(
        'Logged Out',
        'Inactive too long',
        'info'
      ).then(() => this.logout());
    }, this.autoLogoutTime);
  }
  
}
