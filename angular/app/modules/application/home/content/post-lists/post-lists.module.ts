import { NgModule, NO_ERRORS_SCHEMA ,CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import {PostListsComponent} from "./post-lists.component"
import { QuillModule } from 'ngx-quill';
import { MatProgressBarModule } from "@angular/material";
import { ClickOutsideModule } from "ng-click-outside";
import { NgxDropzoneModule } from "ngx-dropzone";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { DragScrollModule } from "cdk-drag-scroll";
import { MatSliderModule } from "@angular/material/slider";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { AgGridModule } from "ag-grid-angular";
import { NgxCleaveDirectiveModule } from "ngx-cleave-directive";
import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { MentionModule } from "angular-mentions";
import { AutosizeModule } from "ngx-autosize";
import { FullCalendarModule } from "@fullcalendar/angular";

import { HeaderModule } from "../../../header/header.module";
import { RightSidebarModule } from "../../right-sidebar/right-sidebar.module";
import { LeftSidebarMenuModule } from "../../left-sidebar-menu/left-sidebar-menu.module";
import { MobileMenuModule } from "../../../mobile-menu/mobile-menu.module";
// import { PreventDoubleClickModule } from "src/app/directives/prevent-double-click.module";
// import { PipeModule } from "src/app/pipes/data-format.pipe.module";
import { UploadOrgContentModule } from "../organisation-setup/upload-org-content/upload-org-content.module";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { ChatModule } from '../../../chat/chat.module';
import{PostMentionComponent} from "./post-mention/post-mention.component";
import { from } from "rxjs";
import { NgxDocViewerModule } from 'ngx-doc-viewer';

const routes: Routes = [
 
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), FormsModule
  ,  QuillModule.forRoot(),
  //  PipeModule,
  BsDatepickerModule.forRoot(),
  UploadOrgContentModule,
  ChatModule,
  DragDropModule,
  DragScrollModule,
  CommonModule,
  HeaderModule,
  LeftSidebarMenuModule,
  RightSidebarModule,
  RouterModule.forChild(routes),
  FormsModule,
  ReactiveFormsModule,
  ClickOutsideModule,
  NgxDropzoneModule,
  MatSliderModule,
  MatProgressBarModule,
  NgMultiSelectDropDownModule.forRoot(),
  AgGridModule.withComponents([]),
  NgxCleaveDirectiveModule,
  MobileMenuModule,
 // PreventDoubleClickModule,
  CalendarModule.forRoot({
    provide: DateAdapter,
    useFactory: adapterFactory,
  }),
  MentionModule,
  AutosizeModule,
  FullCalendarModule,
  NgxDocViewerModule
],
  exports: [],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class PostMentionModule { }
