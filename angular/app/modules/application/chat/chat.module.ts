import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatContactComponent } from './chat-contact/chat-contact.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ChatComponent } from './chat.component';


@NgModule({
  declarations: [
    ChatContactComponent,
    ChatWindowComponent,
    ChatComponent
  ],
  imports: [
    CommonModule,
    // RouterModule.forChild(routes),
    FormsModule
  ],
  exports: [ChatComponent],
})
export class ChatModule { }
