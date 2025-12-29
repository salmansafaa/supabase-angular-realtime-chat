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
  // Use getSession instead of getUser (it's often more reliable in browsers with strict privacy)
  const { data: { session } } = await this.supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("You must be logged in to send messages");
  }

  const { data, error } = await this.supabase
    .from('chat')
    .insert({ 
      text: text, 
      sender: session.user.id 
    })
    .select();

  if (error) throw error;
  return data;
}

// Update the function signature
async listChat(): Promise<Ichat[]> { 
  const { data, error } = await this.supabase
    .from('chat')
    .select(`
      id,
      text,
      created_at,
      sender,
      users:sender (
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }
  
  // Cast to any then to Ichat[] to bypass the deep nesting validation
  return (data as any) as Ichat[]; 
}

  async deleteChat(id: string) {
    return await this.supabase.from('chat').delete().eq('id', id);
  }

  selectedChats(msg: Ichat) {
    this.savedChat.set(msg);
  }
}

