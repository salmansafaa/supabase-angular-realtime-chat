import { inject, Injectable, NgZone } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
    {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
        storageKey: 'sb-auth-token',
        lockType: 'custom',
        // 'name' is now a string, 'callback' is any. No more red lines.
        async lock(name: string, callback: any) {
          if (typeof callback === 'function') {
            return await callback();
          }
          if (callback && typeof callback.acquire === 'function') {
            return await callback.acquire();
          }
          return;
        }
      } as any
    }
  );

  private router = inject(Router);
  private _ngZone = inject(NgZone);

  constructor() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        localStorage.setItem('session', JSON.stringify(session.user));
      } else {
        localStorage.removeItem('session');
      }
    });
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('session') || !!localStorage.getItem('sb-auth-token');
  }

 async signInWithGoogle() {
  await this.supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // This is what your friend has:
      queryParams: {
        prompt: 'select_account',
        access_type: 'offline'
      },
      redirectTo: window.location.origin + '/chat'
    }
  });
}

  async signOut() {
    await this.supabase.auth.signOut();
    localStorage.clear();
    this._ngZone.run(() => {
      this.router.navigate(['/login']);
    });
  }
}