import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from './services/token.service';


export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const tokenService = inject(TokenService);

  // ❌ Do NOT attach token to refresh-token API
  if (req.url.includes('/refresh-token')) {
    return next(req);
  }

  // ✅ Always fetch latest token
  const accessToken = tokenService.getToken();

  if (accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(req);
};
