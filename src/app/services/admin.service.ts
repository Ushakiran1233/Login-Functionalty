import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminReports, AdminUser } from './admin.models.model';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private authApi = 'https://localhost:7168/api/auth';
  private reports='https://localhost:7168/api/admin/reports/reports';
  private adminApi = 'https://localhost:7168/api/admin/reports/users/current';
  private updateuser='https://localhost:7168/api/admin/reports/users';
  private users='https://localhost:7168/api/admin/reports/users';
private userapi='https://localhost:7168/api/admin/reports/Addusers';
private permissionurl='https://localhost:7168/api/admin/reports/users/current/permissions';
  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  // ================= HEADERS =================
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getToken() || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ================= REPORTS =================
  getAdminReports(): Observable<AdminReports> {
    return this.http.get<AdminReports>(this.reports, {
      headers: this.getAuthHeaders()
    });
  }

  // ================= USERS =================
  getAdminUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.users}`, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(
      `${this.adminApi}/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }
getCurrentUser(): Observable<any> {
  return this.http.get(`${this.adminApi}`);
}

  // ================= ROLES =================
  getAdminRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.adminApi}/roles`, {
      headers: this.getAuthHeaders()
    });
  }

    updateUserRoles(userId: string, role: string) {
    return this.http.put(
      `${this.adminApi}/${userId}/role`,
      { role } // ✅ MATCHES BACKEND
    );
  }
private permissions: string[] = [];

setPermissions(p: string[]) {
  this.permissions = p;
}

getPermissions(): string[] {
  return this.permissions;
}

  addRole(roleName: string) {
    return this.http.post(
      `https://localhost:7168/api/Roles`,
      { name: roleName } // ✅ MATCHES BACKEND
    );
  }
updateUserStatus(userId: string, data: { isActive: boolean }) {
  return this.http.put(
    `${this.adminApi}/users/${userId}/status`,
    data
  );
}

addUser(user: any): Observable<any> {
    return this.http.post(`${this.userapi}`, user);
  }

  // ================= UPDATE USER =================
  updateUser(userId: string, user: any): Observable<any> {
    return this.http.put(`${this.updateuser}/${userId}`, user);
  }


getRoles() {
  return this.http.get<any[]>(
    'https://localhost:7168/api/Roles',
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
}
 getUserPermissions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.permissionurl}`);
  }
  // ================= REFRESH TOKEN =================
  refreshToken(
    accessToken: string,
    refreshToken: string
  ): Observable<{ token: string; refreshToken: string; expiresIn: number }> {
    return this.http.post<{ token: string; refreshToken: string; expiresIn: number }>(
      `${this.authApi}/refresh-token`,   
      { accessToken, refreshToken }
    );
  }
}
