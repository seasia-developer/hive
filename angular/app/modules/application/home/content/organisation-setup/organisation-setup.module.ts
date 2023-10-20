import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule, ChildActivationEnd } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HeaderModule } from "../../../header/header.module";
import { LeftSidebarMenuModule } from "../../left-sidebar-menu/left-sidebar-menu.module";
import { RightSidebarModule } from "../../right-sidebar/right-sidebar.module";
// import { OrganisationSetupComponent } from "./organisation-setup.component";
// import { UploadOrgContentComponent } from "./upload-org-content/upload-org-content.component";
import { HomeModule } from "../../home.module";

const routes: Routes = [
  // {
  //   path: "",
  //   component: OrganisationSetupComponent,
  // },
  // {
  //   path: "upload-org-content",
  //   component: UploadOrgContentComponent,
  // },
];

@NgModule({
  declarations: [],
  imports: [
    HeaderModule,
    LeftSidebarMenuModule,
    RightSidebarModule,
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class OrganisationSetupModule {}
