import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatService } from '../../supabase/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  // 1. Injecting Services
  private auth = inject(AuthService);
  private chat_service = inject(ChatService);
  private fb = inject(FormBuilder);

  chatForm!: FormGroup;

  ngOnInit() {
    // 2. Initialize the form here (Angular standard)
    this.chatForm = this.fb.group({
      chat_message: ['', Validators.required]
    });
  }

  // 3. Simplified Logout
  async logOut() {
    try {
      await this.auth.signOut();
      // Note: Your AuthService listener will automatically 
      // redirect the user to /login when they sign out.
    } catch (err: any) {
      alert(err.message);
    }
  }

  // 4. Submit Message
  onSubmit() {
    const formValue = this.chatForm.value.chat_message;
    
    this.chat_service.chatMessage(formValue).then((res) => {
      console.log('Message sent!', res);
      this.chatForm.reset(); 
    }).catch((err) => {
      alert(err.message);
    });
  }
}
