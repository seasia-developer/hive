import { NgModule,CUSTOM_ELEMENTS_SCHEMA,NO_ERRORS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { DragScrollModule } from "cdk-drag-scroll";
import { RouterModule } from "@angular/router";
import { ClickOutsideModule } from "ng-click-outside";

import { LeftSidebarMenuComponent } from "./left-sidebar-menu.component";
import { OrganisationIconsComponent } from "./organisation-icons/organisation-icons.component";
import { OrganisationWorkspacesComponent } from "./organisation-workspaces/organisation-workspaces.component";
import { OrganisationSetupComponent } from "../content/organisation-setup/organisation-setup.component";
import { UploadOrgContentComponent } from "../content/organisation-setup/upload-org-content/upload-org-content.component";
import { CreateWorkspaceComponent } from "../content/create-workspace/create-workspace.component";
import { CreateAppComponent } from "../content/create-app/create-app.component";
import { UserManagementComponent } from "../content/user-management/user-management.component";
import { OrganisationUserWorkspaceComponent } from "../content/organisation-user-workspace/organisation-user-workspace.component";
import { OrgLeaveComponent } from "../content/org-leave/org-leave.component";
import { OrganisationWorkspaceListComponent } from "../content/organisation-workspaceList/organisation-workspaceList.component";
import { RecordModalComponent } from "../application-view/record-modal/record-modal.component";
import { NgxDropzoneModule } from "ngx-dropzone";
import { MatSliderModule, MatProgressBarModule } from "@angular/material";
import { NgxCleaveDirectiveModule } from "ngx-cleave-directive";
import { PipeModule } from "src/app/pipes/data-format.pipe.module";
import { PreventDoubleClickModule } from "src/app/directives/prevent-double-click.module";
import { UploadOrgContentModule } from '../content/organisation-setup/upload-org-content/upload-org-content.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MentionModule } from 'angular-mentions';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    LeftSidebarMenuComponent,
    OrganisationIconsComponent,
    OrganisationWorkspacesComponent,
    OrganisationSetupComponent,
    // RecordModalComponent,
    // UploadOrgContentComponent,
    CreateWorkspaceComponent,
    CreateAppComponent,
    UserManagementComponent,
    OrganisationUserWorkspaceComponent,
    OrgLeaveComponent,
    OrganisationWorkspaceListComponent,
  ],
  imports: [
    BsDatepickerModule.forRoot(),
    MatProgressBarModule,
    UploadOrgContentModule,
    PipeModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    DragScrollModule,
    RouterModule,
    ClickOutsideModule,
    NgxDropzoneModule,
    MatSliderModule,
    NgxCleaveDirectiveModule,
    PreventDoubleClickModule,
    MentionModule,
    // PreventDoubleSubmitModule.forRoot(),
    NgxSpinnerModule,
    MatTooltipModule
  ],
  exports: [LeftSidebarMenuComponent],
  entryComponents: [
    // RecordModalComponent,
    OrganisationSetupComponent,
    // UploadOrgContentComponent,
    CreateWorkspaceComponent,
    CreateAppComponent,
    UserManagementComponent,
    OrganisationUserWorkspaceComponent,
    OrgLeaveComponent,
    OrganisationWorkspaceListComponent,
  ],  schemas: []
})
export class LeftSidebarMenuModule {}
