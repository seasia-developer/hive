import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MobileMenuComponent } from './mobile-menu.component';
import { LeftSidebarMenuModule } from "../../../modules/application/home/left-sidebar-menu/left-sidebar-menu.module";
import { ClickOutsideModule } from "ng-click-outside";
import { PreventDoubleClickModule } from 'src/app/directives/prevent-double-click.module';

@NgModule({
  declarations: [
    MobileMenuComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LeftSidebarMenuModule,
    ClickOutsideModule,
    PreventDoubleClickModule,
  ],
  exports: [
    MobileMenuComponent   
  ]
})
export class MobileMenuModule { }
