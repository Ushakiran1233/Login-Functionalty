import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { ChartModule } from 'primeng/chart';
import { AuthService } from '../auth.service';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  activeSection: string = 'dashboard';

  // 🔐 User info
  name = '';
  role = '';

  // UI
  showProfileDropdown = false;
  showPopup = false;

  // 🔹 PROFILE REF (for outside click)
  @ViewChild('profileBox') profileBox!: ElementRef;

  // Dynamic data
  stats: any = {};
  profile: any = {};
  settings: any = {};
  reports: any[] = [];

  // Timer
  private refreshTimeout: any;

  constructor(
    private auth: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadUserFromToken();
    this.loadDashboard();
    this.loadProfile();
    this.loadSettings();
    this.loadReports();
    this.scheduleTokenRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
  }

  // ================= USER FROM TOKEN =================
  loadUserFromToken(): void {
    const decoded = this.tokenService.decodeToken();
    if (!decoded) {
      this.logout();
      return;
    }

    this.name =
      decoded.name ||
      decoded.unique_name ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      decoded.email ||
      '';

    const roleClaim =
      decoded.role ||
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    this.role = Array.isArray(roleClaim)
      ? roleClaim.join(', ')
      : roleClaim || 'User';
  }

  // ================= PROFILE DROPDOWN =================
  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  // ✅ CLOSE WHEN CLICK OUTSIDE
  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (
      this.showProfileDropdown &&
      this.profileBox &&
      !this.profileBox.nativeElement.contains(event.target)
    ) {
      this.showProfileDropdown = false;
    }
  }

  logout(): void {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    this.tokenService.removeTokens();
    this.router.navigate(['/login']);
  }

  // ================= REFRESH TOKEN FLOW =================
  private scheduleTokenRefresh(): void {
    const expiryTime = this.tokenService.getTokenExpiry();
    if (!expiryTime) return;

    const now = Date.now();
    const popupTime = Math.max(expiryTime - now - 120000, 0);

    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);

    this.refreshTimeout = setTimeout(() => {
      this.showPopup = true;
    }, popupTime);
  }
onPopupOk(): void {

  this.auth.refreshToken().subscribe({
    next: (res: any) => {
      this.tokenService.setToken(res.token);
      this.tokenService.setRefreshToken(res.refreshToken);

      this.showPopup = false;

      // allow interceptor to pick up new token
      setTimeout(() => {
        this.loadUserFromToken();
        this.scheduleTokenRefresh();
      }, 0);

      Swal.fire('Success', 'Session refreshed', 'success');
    },
    error: () => {
      Swal.fire('Session Expired', 'Please login again', 'error');
      this.logout();
    }
  });
}


  // ================= API DATA =================
  loadDashboard() {
    this.auth.getDashboard().subscribe(res => this.stats = res?.stats || {});
  }

  loadProfile() {
    this.auth.getProfile().subscribe(res => this.profile = res || {});
  }

  loadSettings() {
    this.auth.getSettings().subscribe(res => this.settings = res || {});
  }

  loadReports() {
    this.auth.getReports().subscribe(res => {
      this.reports = res || [];
    });
  }

  selectSection(section: string) {
    this.activeSection = section;
  }
}
