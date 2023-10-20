import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HeaderComponent } from "./header.component";
import { ClickOutsideModule } from "ng-click-outside";
import { UpgradePopupComponent } from '../home/upgrade/upgrade-popup/upgrade-popup.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [HeaderComponent, UpgradePopupComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,ClickOutsideModule,MatTooltipModule],
  exports: [HeaderComponent],
  entryComponents: [UpgradePopupComponent]
})
export class HeaderModule {}
