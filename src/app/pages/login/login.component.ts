import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
private auth = inject(AuthService);

async handleAuth() {
    try {
      await this.auth.signInWithGoogle();
    } catch (error) {
      console.error('Login failed', error);
    }
  }
}
