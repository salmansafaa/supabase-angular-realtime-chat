import { Inject, inject, Injectable, NgZone } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
public supabase!: SupabaseClient;

private router = inject(Router);
private _ngZone = inject(NgZone)

  constructor() { 
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'sb-auth-token',
        // ADD THIS PART TO STOP THE LOCK ERROR:
        navigatorLock: {
          acquire: async () => ({ release: () => {} }) 
        }
      } as any
    }
    );

    this.supabase.auth.onAuthStateChange((event, session) =>{
      console.log("event", event);
      console.log("session", session);

     localStorage.setItem('session',JSON.stringify(session?.user));

     if(event === 'SIGNED_IN'){
      this._ngZone.run(() => {
      this.router.navigate(['/chat']);
      }); 
     }
     if (event === 'SIGNED_OUT') {
    this._ngZone.run(() => {
      this.router.navigate(['/login']);
    });
  }

    });
  }

get isLoggedIn(): boolean {
  const user = localStorage.getItem('session');
  // Returns true only if user is not null and not the string "undefined"
  return !!user && user !== 'undefined';
}

  async signInWithGoogle(){
    await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      
    });
  }

  async signOut(){
    await this.supabase.auth.signOut();
  }
}
