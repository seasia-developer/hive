import { NgModule,  NO_ERRORS_SCHEMA ,CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
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

import { ApplicationViewComponent } from "./application-view.component";
import { ApplicationCalenderViewComponent } from "./application-calender-view/application-calender-view.component";
import { ApplicationGridViewComponent } from "./application-grid-view/application-grid-view.component";
import { ApplicationKanbanViewComponent } from "./application-kanban-view/application-kanban-view.component";
import { HeaderModule } from "../../header/header.module";
import { RightSidebarModule } from "../right-sidebar/right-sidebar.module";
import { LeftSidebarMenuModule } from "../left-sidebar-menu/left-sidebar-menu.module";
import { GridRecordComponent } from "./grid-record/grid-record.component";
import { MobileMenuModule } from "../../mobile-menu/mobile-menu.module";
import { CalendarHeaderComponent } from "./application-calender-view/calendar-header.component";
import { PreventDoubleClickModule } from "src/app/directives/prevent-double-click.module";
import { PipeModule } from "src/app/pipes/data-format.pipe.module";
import { UploadOrgContentModule } from "../content/organisation-setup/upload-org-content/upload-org-content.module";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { WebformComponent } from "./webform/webform.component";
import { ChatModule } from '../../chat/chat.module';
import { QuillModule } from 'ngx-quill'
import { MentionComponent } from "./mention/mention.component";
// import{MentionUserListComponent} from "./record-modal/mention-user-list/mention-user-list.component"
import { NgxDocViewerModule } from 'ngx-doc-viewer';
const routes: Routes = [
  {
    path: "applicationView",
    component: ApplicationViewComponent,
    children: [
      {
        path: "calender-view",
        component: ApplicationCalenderViewComponent,
      },
      {
        path: "grid-view",
        component: ApplicationGridViewComponent,
      },
      {
        path: "kanban-view",
        component: ApplicationKanbanViewComponent,
      },
    ],
  },
  {
    path: "webform",
    component: WebformComponent,
  },
];

@NgModule({
  declarations: [
    ApplicationViewComponent,
    ApplicationCalenderViewComponent,
    ApplicationGridViewComponent,
    ApplicationKanbanViewComponent,
    GridRecordComponent,
    CalendarHeaderComponent,
    WebformComponent,
    MentionComponent,
    // MentionUserListComponent
  ],
  imports: [
    BsDatepickerModule.forRoot(),
    UploadOrgContentModule,
    ChatModule,
    PipeModule,
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
    PreventDoubleClickModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    MentionModule,
    AutosizeModule,
    FullCalendarModule,
    QuillModule.forRoot(),
    NgxDocViewerModule
  ],
  exports: [ApplicationViewComponent],
  schemas: [NO_ERRORS_SCHEMA,CUSTOM_ELEMENTS_SCHEMA]
})
export class ApplicationViewModule { }
