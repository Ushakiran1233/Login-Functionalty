import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  api = 'https://localhost:7168/api/auth';

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  login(data: any) {
    return this.http.post<any>(`${this.api}/login`, data);
  }

  forgotPassword(email: string) {
    return this.http.post<any>(`${this.api}/forgot-password`, { email });
  }

  resetPassword(data: any) {
    return this.http.post(`${this.api}/reset-password`, data);
  }

  changePassword(data: any) {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.post('https://localhost:7168/api/auth/change-password', data, { headers });
}


  getRole() {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  }
}
