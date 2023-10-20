import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { ModalModule } from "ngx-bootstrap/modal";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { DragScrollModule } from "cdk-drag-scroll";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { TimepickerModule } from "ngx-bootstrap/timepicker";
import { PopoverModule } from "ngx-bootstrap/popover";
import { ClickOutsideModule } from "ng-click-outside";
import { FullCalendarModule } from "@fullcalendar/angular";
import { AutosizeModule } from "ngx-autosize";
import { MentionModule } from "angular-mentions";
import { NgxDropzoneModule } from "ngx-dropzone";

import { ApplicationBuilderComponent } from "./application-builder/application-builder.component";
import { ContentComponent } from "./content/content.component";
import { HomeComponent } from "./home.component";
import { PostListsComponent } from "./content/post-lists/post-lists.component";
import { PostMentionModule } from "./content/post-lists/post-lists.module"
import { PostMentionComponent } from "./content/post-lists/post-mention/post-mention.component"
import { HeaderModule } from "../header/header.module";
import { LeftSidebarMenuModule } from "./left-sidebar-menu/left-sidebar-menu.module";
import { RightSidebarModule } from "./right-sidebar/right-sidebar.module";
import { UploadContentComponent } from "./content/upload-content/upload-content.component";
import { EmployeeManagementComponent } from "./content/employee-management/employee-management.component";
import { CreateApplicationComponent } from "./content/create-application/create-application.component";
import { CreatePostComponent } from "./content/create-post/create-post.component";
import { PostComponent } from "./content/post-lists/post/post.component";
import { CommentComponent } from "./content/post-lists/post/comments/comment/comment.component";
import { CommentsComponent } from "./content/post-lists/post/comments/comments.component";
import { LikeComponent } from "./content/post-lists/post/comments/comment/like/like.component";
import { ReplyComponent } from "./content/post-lists/post/comments/comment/reply/reply.component";
import { PostStatasticComponent } from "./content/post-lists/post/post-statastic/post-statastic.component";
import { RelationshipModalComponent } from "./application-builder/relationship-modal/relationship-modal.component";
import { HelpTextModalComponent } from "./application-builder/help-text-modal/help-text-modal.component";
import { MobileMenuModule } from "../mobile-menu/mobile-menu.module";
// import { TaskComponent } from "./content/task/task.component";
import { NotificationComponent } from "./notification/notification.component";
import { PipeModule } from "src/app/pipes/data-format.pipe.module";
import { OrgWsCalendarComponent } from "./content/org-ws-calendar/org-ws-calendar.component";
import { RecordModalComponent } from "./application-view/record-modal/record-modal.component";
import { MarketComponent } from "./market/market.component";
import { MarketDetailComponent } from "./market-detail/market-detail.component";
import { OrgProfileComponent } from "./org-profile/org-profile.component";
import { ApplicationViewModule } from "./application-view/application-view.module";
import { RecordModalView } from "./application-view/record-modal/record-modal.module";
import { ApplicationCalenderViewComponent } from "./application-view/application-calender-view/application-calender-view.component";
import { ApplicationGridViewComponent } from "./application-view/application-grid-view/application-grid-view.component";
import { ApplicationKanbanViewComponent } from "./application-view/application-kanban-view/application-kanban-view.component";
import { MatLinkPreviewModule } from '@angular-material-extensions/link-preview';
import { ChatModule } from '../chat/chat.module';
// import { MentionUserListComponent } from "./application-view/mention-user-list/mention-user-list.component";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import { TaskModule } from "../home/content/task/task.module"
import { NgxDocViewerModule } from 'ngx-doc-viewer';

import { SubscribePaidGroupsComponent } from "./content/subscribe-paid-groups/subscribe-paid-groups.component";
import { InvitePaidGroupsComponent } from "./content/invite-paid-groups/invite-paid-groups.component";

import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatStepperModule} from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { InviteComponent } from './invite/invite.component';

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  timeGridPlugin
]);


const routes: Routes = [
  // {
  //   path: "mention-user-list",
  //   component: MentionUserListComponent,
  // },
  {
    path: "",
    component: PostListsComponent,
  },
  {
    path: "calendar",
    component: OrgWsCalendarComponent,
  },
  {
    path: "parent",
    loadChildren: "./content/parent/parent.module#ParentModule",
  },
  {
    path: "upgrade",
    loadChildren: "./upgrade/upgrade.module#UpgradeModule",
  },
  {
    path: "search",
    loadChildren: "./search/search.module#SearchModule",
  },
  // {
  //   path: "task",
  //   component: TaskComponent,
  // },
  {
    path: "notifications",
    component: NotificationComponent,
  },
  {
    path: "add-org",
    loadChildren:
      "./content/organisation-setup/organisation-setup.module#OrganisationSetupModule",
  },
  {
    path: "admin",
    loadChildren: "./admin/admin.module#AdminModule",
  },
  {
    path: "app-view",
    loadChildren:
      "./application-view/application-view.module#ApplicationViewModule",
  },
  {
    path: "admin",
    loadChildren: "./admin/admin.module#AdminModule",
  },
  {
    path: "employee",
    component: EmployeeManagementComponent,
  },
  {
    path: "user-management",
    loadChildren:
      "./content/user-management/user-management.module#UserManagementModule",
    // component: UserManagementComponent,
  },
  {
    path: "create-workspace/:orgId",
    loadChildren:
      "./content/create-workspace/create-workspace.module#CreateWorkspaceModule",
    //  component: CreateWorkspaceComponent,
  },
  {
    path: "create-app",
    loadChildren: "./content/create-app/create-app.module#CreateAppModule",
    // component: CreateAppComponent,
  },
  {
    path: "application-builder",
    component: ApplicationBuilderComponent,
  },
  {
    path: "org-leave",
    loadChildren: "./content/org-leave/org-leave.module#OrgLeaveModule",

    // component: OrgLeaveComponent,
  },
  {
    path: "org-user-workspace",
    loadChildren:
      "./content/organisation-user-workspace/organisation-user-workspace.module#OrganisationUserWorkspaceModule",
    // component: OrganisationUserWorkspaceComponent,
  },
  {
    path: "org-workspace",
    loadChildren:
      "./content/organisation-workspaceList/organisation-workspace.module#OrganisationWorkspaceListModule",
  },
  {
    path: "market",
    component: MarketComponent,
  },
  {
    path: "market-detail",
    component: MarketDetailComponent,
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
    path: "org-profile",
    component: OrgProfileComponent,
  },
  {
    path: "subscribe/paid-groups/:workspaceId",
    component: SubscribePaidGroupsComponent,
  },
  {
    path: "invite/paid-groups/:workspaceId",
    component: InvitePaidGroupsComponent,
  },
  {
    path: 'invite',
    component : InviteComponent
  }
  

];

@NgModule({
  declarations: [
    ContentComponent,
    CreateApplicationComponent,
    CreatePostComponent,
    // CreateWorkspaceComponent,
    PostComponent,
    CommentComponent,
    CommentsComponent,
    LikeComponent,
    ReplyComponent,
    PostStatasticComponent,
    UploadContentComponent,
    HomeComponent,
    PostListsComponent,
    PostMentionComponent,
    // CreateWorkspaceComponent,
    UploadContentComponent,
    EmployeeManagementComponent,
    // UserManagementComponent,
    // CreateAppComponent,
    ApplicationBuilderComponent,
    RelationshipModalComponent,
    HelpTextModalComponent,
    // TaskComponent,
    NotificationComponent,
    OrgWsCalendarComponent,
    MarketComponent,
    MarketDetailComponent,
    OrgProfileComponent,
    // OrgLeaveComponent,
    // OrganisationUserWorkspaceComponent,
    // OrganisationWorkspacesComponent,
    // MentionUserListComponent
    SubscribePaidGroupsComponent,
    InvitePaidGroupsComponent,
    InviteComponent
  ],
  imports: [
    MatSlideToggleModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatLinkPreviewModule.forRoot(),
    ChatModule,
    CommonModule,
    HeaderModule,
    MobileMenuModule,
    LeftSidebarMenuModule,
    RightSidebarModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    DragScrollModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    PopoverModule.forRoot(),
    ClickOutsideModule,
    NgxDropzoneModule,
    AutosizeModule,
    PipeModule,
    MentionModule,
    FullCalendarModule,
    ApplicationViewModule,
    RecordModalView,
    TaskModule,
    PostMentionModule,
    NgxDocViewerModule,
  ],
  entryComponents: [RecordModalComponent],
  exports: [PostListsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class HomeModule { }
