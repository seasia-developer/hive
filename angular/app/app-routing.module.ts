import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./services/auth-guard.service";
import { WebformTestComponent } from './modules/webform-test/webform-test.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: "/application/home",
    pathMatch: "full",
  },
  {
    path: "auth",
    loadChildren: "./modules/authentication/auth.module#AuthModule",
    canActivate: [AuthGuard],
  },
  {
    path: "onboarding",
    loadChildren: "./modules/onboarding/onboarding.module#OnbordingModule",
    canActivate: [AuthGuard],
  },
  {
    path: "application",
    loadChildren: "./modules/application/application.module#ApplicationModule",
    canActivate: [AuthGuard],
  },
  {
    path: "webform",
    loadChildren: "./modules/public-webform/public-webform.module#PublicWebformModule",
  },
  {
    path: "testWebform",
    component: WebformTestComponent,
  },
  {
    path: "wordpress",
    loadChildren: "./modules/application/home/wordpress-structure/wordpress-structure.module#WordpressStructureModule",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
