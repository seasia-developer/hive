import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ClickOutsideModule } from "ng-click-outside";
import { AutosizeModule } from "ngx-autosize";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { MatSliderModule } from "@angular/material/slider";
import { ParentComponent } from "./parent.component";
import { MyProfileComponent } from "./my-profile/my-profile.component";
import { BusinessProfileComponent } from "./business-profile/business-profile.component";
import { MyWorkspacesComponent } from "./my-workspaces/my-workspaces.component";
import { EmailNotificationsComponent } from "./email-notifications/email-notifications.component";
import { ServicesComponent } from "./services/services.component";
import { HeaderModule } from "../../../header/header.module";
import { LeftSidebarMenuModule } from "../../left-sidebar-menu/left-sidebar-menu.module";
import { RightSidebarModule } from "../../right-sidebar/right-sidebar.module";
import { CountryFlagPipe } from "src/app/pipes/country-flag.pipe";
import { LimitToPipe } from "src/app/pipes/limitTo.pipe";
import { MobileMenuModule } from "../../../mobile-menu/mobile-menu.module";
import { SaveWorkspacesComponent } from "./save-workspaces/save-workspaces.component";
import { BannersComponent } from "./save-workspaces/banners/banner.component";
import { PublicProfileComponent } from "./public-profile/public-profile.component";
import { HomeModule } from "../../home.module";
import { ChatModule } from '../../../chat/chat.module';

import { PlatformBillingComponent } from "./platform-billing/platform-billing.component";
import { MonetizationComponent } from "./monetization/monetization.component";
import { BillingComponent } from "./billing/billing.component";

import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatStepperModule} from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon'

const routes: Routes = [
  {
    path: "",
    component: ParentComponent,
    children: [
      {
        path: "my-profile",
        component: MyProfileComponent,
      },
      {
        path: "business-profile",
        component: BusinessProfileComponent,
      },
      {
        path: "my-workspace",
        component: MyWorkspacesComponent,
      },
      {
        path: "services",
        component: ServicesComponent,
      },
      {
        path: "email-notification",
        component: EmailNotificationsComponent,
      },
      {
        path: "save-workspace",
        component: SaveWorkspacesComponent,
      },
      {
        path: "banners",
        component: BannersComponent,
      },
      {
        path: "platform-billing",
        component: PlatformBillingComponent,
      },
      {
        path: "monetization",
        component: MonetizationComponent,
      },
      {
        path: "billing",
        component: BillingComponent,
      },
    ],
  },
  {
    path: "public-profile",
    component: PublicProfileComponent,
  },
];

@NgModule({
  providers: [CountryFlagPipe],
  declarations: [
    ParentComponent,
    MyProfileComponent,
    BusinessProfileComponent,
    MyWorkspacesComponent,
    EmailNotificationsComponent,
    ServicesComponent,
    CountryFlagPipe,
    SaveWorkspacesComponent,
    BannersComponent,
    LimitToPipe,
    PublicProfileComponent,
    PlatformBillingComponent,
    MonetizationComponent,
    BillingComponent
  ],
  imports: [
    MatIconModule,
    MatSliderModule,
    HeaderModule,
    ChatModule,
    MobileMenuModule,
    LeftSidebarMenuModule,
    RightSidebarModule,
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MobileMenuModule,
    AutosizeModule,
    ClickOutsideModule,
    HomeModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ProgressbarModule.forRoot(),
  ],
})
export class ParentModule {}
