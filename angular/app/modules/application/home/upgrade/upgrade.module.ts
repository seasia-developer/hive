import { UpgradeComponent } from "./upgrade.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UpgradePopupComponent } from "./upgrade-popup/upgrade-popup.component";
import { PaymentComponent } from "./payment/payment.component";
import { Routes, RouterModule } from "@angular/router";
import { HeaderModule } from "../../header/header.module";
import { MobileMenuModule } from "../../mobile-menu/mobile-menu.module";
import { LeftSidebarMenuModule } from "../left-sidebar-menu/left-sidebar-menu.module";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ChatModule } from '../../chat/chat.module';

const routes: Routes = [
  {
    path: "",
    component: UpgradeComponent
  },
  // {
  //   path: "popup",
  //   component: UpgradePopupComponent
  // },
  {
    path: "payment",
    component: PaymentComponent
  }
];

@NgModule({
  declarations: [UpgradeComponent, PaymentComponent],
  imports: [
    CommonModule,
    ChatModule,
    RouterModule.forChild(routes),
    HeaderModule,
    MobileMenuModule,
    LeftSidebarMenuModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class UpgradeModule { }
