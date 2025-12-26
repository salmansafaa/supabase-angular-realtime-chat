import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatService } from '../../supabase/chat.service';
import { Ichat } from '../../interface/chat-response';
import { DatePipe } from '@angular/common';
import { DeleteModalComponent } from '../../layout/delete-modal/delete-modal.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, DeleteModalComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  private auth = inject(AuthService);
  private chat_service = inject(ChatService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  chats = signal<Ichat[]>([]);
  chatForm: FormGroup;

  constructor() {
    this.chatForm = this.fb.group({
      chat_message: ['', Validators.required]
    });
  }

  async ngOnInit() {
    // Check session from Supabase (handles the URL token)
    const { data } = await this.auth.supabase.auth.getSession();
    
    if (data?.session || this.auth.isLoggedIn) {
      // Clean the URL hash so it looks professional
      if (window.location.hash) {
        this.router.navigate([], { fragment: undefined, replaceUrl: true });
      }
      this.onListChat();
    } else {
      this.router.navigate(['/login']);
    }
  }

  onListChat() {
    this.chat_service.listChat()
      .then((res) => {
        if (res) this.chats.set(res);
      })
      .catch((err) => console.error(err.message));
  }

  onSubmit() {
    if (this.chatForm.invalid) return;
    const message = this.chatForm.value.chat_message;
    this.chat_service.chatMessage(message)
      .then(() => {
        this.chatForm.reset();
        this.onListChat();
      })
      .catch((err) => alert(err.message));
  }

 async logOut() {
    // This bypasses the service entirely so the app compiles
    await (this.auth as any).supabase.auth.signOut();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  openDropDown(msg: Ichat) {
    this.chat_service.selectedChats(msg);
  }
}