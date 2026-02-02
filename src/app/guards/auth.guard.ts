import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { jwtDecode } from 'jwt-decode'; // ✅ fixed import
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private router: Router, private auth: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAccess(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAccess(route);
  }

  private checkAccess(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);

      // ⏰ JWT Expiry check
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
        return false;
      }

      // 🔑 Extract role
      const roleClaim =
        decoded['role'] ||
        decoded['roles'] ||
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      const userRole = Array.isArray(roleClaim)
        ? roleClaim[0].toLowerCase()
        : roleClaim?.toLowerCase();

      const expectedRole = route.data['role']?.toLowerCase();

      // 🚀 Extract permissions from JWT and store in AuthService
      const permissions = decoded['permissions'] || [];
      this.auth.permissions = permissions;
      localStorage.setItem('permissions', JSON.stringify(permissions)); // optional for reload

      // Store role in AuthService
      this.auth.role = userRole;

      // No role restriction → allow
      if (!expectedRole) return true;

      // Role mismatch → redirect to proper dashboard
      if (userRole !== expectedRole) {
        this.router.navigate([
          userRole === 'admin' ? '/admin-dashboard' : '/dashboard'
        ]);
        return false;
      }

      return true;

    } catch {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
