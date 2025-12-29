import { Component, effect, inject, signal } from '@angular/core';
import { ChatService } from '../../supabase/chat.service';
import { Router } from '@angular/router';
import { error } from 'console';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css'
})


  export class DeleteModalComponent {
  private chat_service = inject(ChatService);
  private router = inject(Router);
  dismiss = signal(false);

  constructor() {
    effect(() => {
      // Call the signal as a function ()
      console.log('Current Saved Chat Data:', this.chat_service.savedChat());
    });
  }

  deleteChat() {
    // 1. Get the data from the signal safely
    const chatData = this.chat_service.savedChat();
    
    // 2. Safely get the ID (assuming it might be string or number)
    const id = chatData?.id;

    if (!id) {
      console.error("No message selected for deletion");
      return;
    }

    this.chat_service.deleteChat(id)
      .then(() => {
        const currentUrl = this.router.url;
        this.dismiss.set(true);

        // Refresh the current route
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      })
      .catch((error: any) => { // Adding ': any' fixes the red error squiggly
        console.error("Delete failed:", error);
        alert(error.message || "An error occurred while deleting");
      });
  }
}

  
