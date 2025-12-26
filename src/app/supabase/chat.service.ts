import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../service/auth.service'; 
import { Ichat } from '../interface/chat-response';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private auth = inject(AuthService);
  
  // Getter for the singleton Supabase instance
  private get supabase() {
    return this.auth.supabase;
  }
  
  public savedChat = signal<any>({});

 async chatMessage(text: string) {
  // 1. Get the current user
  const { data: { user } } = await this.supabase.auth.getUser();

  if (!user) {
    alert("No active session found!");
    return;
  }

  // 2. Perform the insert
  const { data, error } = await this.supabase
    .from('chat')
    .insert({ 
      text: text, 
      sender: user.id // This ID must exist in the table your FK points to
    })
    .select();

  if (error) {
    console.error("Insert Error Details:", error);
    throw error;
  }
  return data;
}

  async listChat() {
    try {
      // Assuming your sender column relates to a users table
      const { data, error } = await this.supabase
        .from('chat')
        .select('*, sender(*)'); // Adjusting to match your 'sender' column name
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('List Chat Error:', error);
      return [];
    }
  }

  async deleteChat(id: string) {
    return await this.supabase.from('chat').delete().eq('id', id);
  }

  selectedChats(msg: Ichat) {
    this.savedChat.set(msg);
  }
}

