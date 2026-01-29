import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {

  private readonly ACCESS_TOKEN_KEY = 'token';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  // ================= ACCESS TOKEN =================
  getToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  // ================= REFRESH TOKEN =================
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  // ================= REMOVE =================
  removeTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // ================= DECODE =================
  decodeToken(token?: string): any | null {
    const actualToken = token || this.getToken();
    if (!actualToken) return null;

    try {
      return JSON.parse(atob(actualToken.split('.')[1]));
    } catch {
      return null;
    }
  }

  // ================= CLAIMS =================
  getEmail(): string | null {
    const decoded = this.decodeToken();
    return decoded?.email ||
           decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
           decoded?.unique_name ||
           null;
  }

  getRole(): string | null {
    const decoded = this.decodeToken();
    const roleClaim =
      decoded?.role ||
      decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    return Array.isArray(roleClaim) ? roleClaim[0] : roleClaim || null;
  }

  // ================= EXPIRY =================
  getTokenExpiry(token?: string): number {
    const decoded = this.decodeToken(token);
    return decoded?.exp ? decoded.exp * 1000 : 0;
  }
}
