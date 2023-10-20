import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AgGridModule } from "ag-grid-angular";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";

import { RestrictedDomainsComponent } from "./restricted-domains/restricted-domains.component";
import { WorkspaceImagesComponent } from "./workspace-images/workspace-images.component";
import { PredefinedWorkspacesComponent } from "./predefined-workspaces/predefined-workspaces.component";
import { IndustriesComponent } from "./industries/industries.component";
import { UsersComponent } from "./users/users.component";
import { ContributedWorkspacesComponent } from "./contributed-workspaces/contributed-workspaces.component";
import { AdminComponent } from "./admin.component";
import { HeaderModule } from "../../header/header.module";
import { RightSidebarModule } from "../right-sidebar/right-sidebar.module";
import { SidebarMenuComponent } from "./sidebar-menu/sidebar-menu.component";
import { MobileMenuModule } from "../../mobile-menu/mobile-menu.module";
import { ApplicationViewModule } from "../application-view/application-view.module";
import { ApplicationGridViewComponent } from "../application-view/application-grid-view/application-grid-view.component";
import { ApplicationCalenderViewComponent } from "../application-view/application-calender-view/application-calender-view.component";
import { ApplicationKanbanViewComponent } from "../application-view/application-kanban-view/application-kanban-view.component";
import { CouponsComponent } from "./coupons/coupons.component";
import { GenerateCouponsComponent } from "./generate-coupons/generate-coupons.component";
import { ChatModule } from '../../chat/chat.module';
import { SuperAdminAuthGuard } from "src/app/services/super-admin-auth-guard.service";
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatStepperModule} from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

const routes: Routes = [
  {
    path: "",
    component: AdminComponent,
    canActivate: [SuperAdminAuthGuard],
    children: [
      {
        path: "restricted-domains",
        component: RestrictedDomainsComponent,
        canActivate: [SuperAdminAuthGuard]
      },
      {
        path: "workspace-images",
        component: WorkspaceImagesComponent,
        canActivate: [SuperAdminAuthGuard]
      },
      {
        path: "predefined-workspaces",
        component: PredefinedWorkspacesComponent,
        canActivate: [SuperAdminAuthGuard]
      },
      {
        path: "users",
        component: UsersComponent,
        canActivate: [SuperAdminAuthGuard]
      },
      {
        path: "industries",
        component: IndustriesComponent,
        canActivate: [SuperAdminAuthGuard]
      },
      {
        path: "contributed-workspaces",
        component: ContributedWorkspacesComponent,
        canActivate: [SuperAdminAuthGuard],
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
        path: "coupopns",
        component: CouponsComponent,
        canActivate: [SuperAdminAuthGuard]
      },
      {
        path: "generate-coupons",
        component: GenerateCouponsComponent,
        canActivate: [SuperAdminAuthGuard]
      },
    ],
  },
];

@NgModule({
  declarations: [
    AdminComponent,
    RestrictedDomainsComponent,
    WorkspaceImagesComponent,
    PredefinedWorkspacesComponent,
    UsersComponent,
    IndustriesComponent,
    ContributedWorkspacesComponent,
    SidebarMenuComponent,
    CouponsComponent,
    GenerateCouponsComponent,
  ],
  imports: [
    ChatModule,
    HeaderModule,
    MobileMenuModule,
    RightSidebarModule,
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    AgGridModule.withComponents([]),
    ApplicationViewModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    BsDatepickerModule.forRoot(),
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger', // set defaults here
      cancelButtonType: 'danger', // set defaults here
    }),
  ],
})
export class AdminModule {}
