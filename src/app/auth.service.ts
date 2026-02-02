import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { RefreshTokenRequest } from './refresh-token-response';

@Injectable({ providedIn: 'root' })
export class AuthService {
public permissions: string[] = []; // ← Add this
  public role: string = '';  
  private api = 'https://localhost:7168/api/auth';

  constructor(private http: HttpClient) {}

  // ================= REGISTER =================
  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }
  canAccess(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  // ================= LOGIN =================
  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/login`, data).pipe(
      tap(res => {
        if (res?.accessToken && res?.refreshToken) {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
        }
      })
    );
  }

  // ================= FORGOT PASSWORD =================
  forgotPassword(email: string) {
    return this.http.post<any>(`${this.api}/forgot-password`, { email });
  }

  resetPassword(data: any) {
    return this.http.post(`${this.api}/reset-password`, data);
  }

  changePassword(data: any) {
    return this.http.post(`${this.api}/change-password`, data);
  }

  // ================= REFRESH TOKEN =================
 refreshToken(): Observable<any> {

  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!accessToken || !refreshToken) {
    throw new Error('Tokens missing');
  }

  const payload: RefreshTokenRequest = {
    accessToken,
    refreshToken
  };

  return this.http.post<any>(`${this.api}/refresh-token`, payload).pipe(
    tap(res => {
      if (res?.accessToken) {
        localStorage.setItem('accessToken', res.accessToken);
      }
      if (res?.refreshToken) {
        localStorage.setItem('refreshToken', res.refreshToken);
      }
    })
  );
}

  // ================= OTP =================
  verifyOTP(data: { Email: string; Code: string }): Observable<any> {
    return this.http.post(`${this.api}/verify-otp`, data);
  }

  resendOTP(data: { email: string }): Observable<any> {
    return this.http.post(`${this.api}/resend-otp`, data);
  }

  resendLoginOtp(email: string): Observable<any> {
    return this.http.post(`${this.api}/resend-otp`, { email });
  }

  verifyLoginOtp(payload: { email: string; code: string }) {
    return this.http.post(`${this.api}/verify-login-otp`, payload);
  }

  resendRegisterOtp(payload: { email: string }): Observable<any> {
    return this.http.post(`${this.api}/resend-register-otp`, payload);
  }

  // ================= AUTH HEADER =================
  private authHeader() {
    const token = localStorage.getItem('accessToken');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // ================= SECURED APIs =================
  getProfile() {
    return this.http.get<any>(`${this.api}/profile`, this.authHeader());
  }

  getDashboard() {
    return this.http.get<any>(`${this.api}/dashboard`, this.authHeader());
  }

  getReports() {
    return this.http.get<any[]>(`${this.api}/reports`, this.authHeader());
  }

  getSettings() {
    return this.http.get<any>(`${this.api}/settings`, this.authHeader());
  }

  // ================= LOGOUT =================
  logout() {
    localStorage.clear();
  }
}
