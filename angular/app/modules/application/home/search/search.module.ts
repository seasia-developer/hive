import { RightSidebarModule } from './../right-sidebar/right-sidebar.module';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PeopleComponent } from "./people/people.component";
import { OrganizationsComponent } from "./organizations/organizations.component";
import { IndustriesComponent } from "./industries/industries.component";
import { PostsComponent } from "./posts/posts.component";
import { TasksComponent } from "./tasks/tasks.component";
import { NotificationsComponent } from "./notifications/notifications.component";
import { SearchComponent } from "./search.component";
import { Routes, RouterModule } from "@angular/router";
import { HeaderModule } from "../../header/header.module";
import { MobileMenuModule } from "../../mobile-menu/mobile-menu.module";
import { LeftSidebarMenuModule } from "../left-sidebar-menu/left-sidebar-menu.module";
import { ClickOutsideModule } from "ng-click-outside";
import { ChatModule } from '../../chat/chat.module';
import { PipeModule } from "src/app/pipes/data-format.pipe.module";

const routes: Routes = [
  {
    path: "",
    component: SearchComponent,
    children: [
      {
        path: "people",
        component: PeopleComponent,
      },
      {
        path: "organizations",
        component: OrganizationsComponent,
      },
      {
        path: "industries",
        component: IndustriesComponent,
      },
      {
        path: "posts",
        component: PostsComponent,
      },
      // {
      //   path: "tasks",
      //   component: TasksComponent,
      // },
      // {
      //   path: "notifications",
      //   component: NotificationsComponent,
      // },
    ],
  },
];

@NgModule({
  declarations: [
    SearchComponent,
    PeopleComponent,
    OrganizationsComponent,
    IndustriesComponent,
    PostsComponent,
    TasksComponent,
    NotificationsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ChatModule,
    HeaderModule,
    MobileMenuModule,
    LeftSidebarMenuModule,
    RightSidebarModule,
    ClickOutsideModule,
    PipeModule
  ]
})
export class SearchModule { }
