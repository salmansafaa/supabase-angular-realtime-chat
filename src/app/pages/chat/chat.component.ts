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
    const res = await this.auth.supabase.auth.getSession();
    
    if (res?.data?.session) {
      if (window.location.hash) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      this.onListChat();
    } else {
      this.router.navigate(['/login']);
    }
  }

  onListChat() {
    this.chat_service.listChat().then(res => this.chats.set(res));
  }

  onSubmit() {
    if (this.chatForm.invalid) return;
    this.chat_service.chatMessage(this.chatForm.value.chat_message)
      .then(() => {
        this.chatForm.reset();
        this.onListChat();
      });
  }

  async logOut() {
    await this.auth.signOut();
  }

  openDropDown(msg: Ichat) {
    this.chat_service.selectedChats(msg);
  }
}