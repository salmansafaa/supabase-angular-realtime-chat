import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './service/auth.service';

// src/app/auth.guard.ts
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If there is a hash (#) or a code in the URL, STICK AROUND.
  // Don't redirect. Let the component handle it.
  if (window.location.hash.includes('access_token') || window.location.href.includes('code=')) {
    return true; 
  }

  const { data } = await authService.supabase.auth.getSession();
  if (data?.session) return true;

  return router.parseUrl('/login');
};