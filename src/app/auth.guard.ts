import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './service/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Wait 3 seconds. This allows Supabase to initialize and 
  // process any tokens found in the URL after the Google redirect.
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    // 2. We avoid { data } = ... because if the service isn't ready,
    // it returns undefined and crashes the whole app.
    const result = await authService.supabase.auth.getSession();

    // 3. Check for session using safe navigation (optional chaining)
    if (result && result.data && result.data.session) {
      console.log("AuthGuard: Session confirmed.");
      return true;
    }

    // 4. Fallback: check the localStorage flag we set in AuthService
    if (authService.isLoggedIn) {
      console.log("AuthGuard: Local flag found.");
      return true;
    }

  } catch (error) {
    // This catch block ensures that even if Supabase fails, 
    // the app doesn't show a blank white screen.
    console.error("AuthGuard caught an initialization error:", error);
  }

  // 5. If we reach here, the user is definitely not logged in.
  console.log("AuthGuard: Redirecting to login.");
  return router.parseUrl('/login');
};