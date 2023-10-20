import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule, ChildActivationEnd } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HeaderModule } from "../../../header/header.module";

const routes: Routes = [
];

@NgModule({
  declarations: [],
  imports: [
    HeaderModule,
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class OrgLeaveModule {}
