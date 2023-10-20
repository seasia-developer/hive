import { NgModule, NO_ERRORS_SCHEMA ,CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";


import { HeaderModule } from "../../../header/header.module";
import { RightSidebarModule } from "../../right-sidebar/right-sidebar.module";
import { LeftSidebarMenuModule } from "../../left-sidebar-menu/left-sidebar-menu.module";
import { MobileMenuModule } from "../../../mobile-menu/mobile-menu.module";

import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { ChatModule } from '../../../chat/chat.module';
import { from } from "rxjs";
import { NgxDocViewerModule } from 'ngx-doc-viewer';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

const routes: Routes = [
 
];

@NgModule({
  declarations: [],
  imports: [  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,CommonModule, RouterModule.forChild(routes), FormsModule,
  //  PipeModule,
  BsDatepickerModule.forRoot(),
  ChatModule,
  CommonModule,
  HeaderModule,
  LeftSidebarMenuModule,
  RightSidebarModule,
  RouterModule.forChild(routes),
  FormsModule,
  ReactiveFormsModule,
  MobileMenuModule,
  NgxDocViewerModule,

],
  exports: [ ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class SubscribePaidGroupsModule { }
