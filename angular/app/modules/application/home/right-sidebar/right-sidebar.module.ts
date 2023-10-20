import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RightSidebarComponent } from './right-sidebar.component';
import { ProfileComponent } from './profile/profile.component';
import { WhosOnlineComponent } from './whos-online/whos-online.component';

@NgModule({
  declarations: [
    RightSidebarComponent,
    ProfileComponent,
    WhosOnlineComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    RightSidebarComponent 
  ]
})
export class RightSidebarModule { }
