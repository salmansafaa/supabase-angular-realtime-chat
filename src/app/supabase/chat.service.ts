import { inject, Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Ensure path is correct

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // Borrow the existing client from AuthService to avoid Lock errors
  private authService = inject(AuthService);

  async chatMessage(text: string) {
    try {
      // 1. Get the current user session
      const { data: { session } } = await this.authService.supabase.auth.getSession();
      
      // 2. Insert the message into the 'chat' table
      // Note: If your column name is 'sender', change 'user_id' to 'sender'
      const { data, error } = await this.authService.supabase
        .from('chat')
        .insert({ 
          text: text,
          sender: session?.user?.id 
        })
        .select();

      if (error) {
        alert(error.message);
        return null;
      }
      return data;
    } catch (error: any) {
      alert(error.message || error);
      return null;
    }
  }
}
