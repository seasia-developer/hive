import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
// import { SocialLoginModule, AuthServiceConfig } from "angularx-social-login";
// import { GoogleLoginProvider } from "angularx-social-login";

import { CheckEmailComponent } from "./check-email/check-email.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { SignInComponent } from "./sign-in/sign-in.component";
import { SupportLinksComponent } from "./support-links/support-links.component";
import { TokenValidationComponent } from "./token-validation/token-validation.component";
import { ActivatedComponent } from "./activated/activated.component";
import { environment } from "./../../../environments/environment";

const routes: Routes = [

  {
    path: "sign-in",
    component: SignInComponent,
  },
  {
    path: "sign-up",
    component: SignUpComponent,
  },
  {
    path: "support-links",
    component: SupportLinksComponent,
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
  },
  {
    path: "reset-password/:token",
    component: ResetPasswordComponent,
  },
  {
    path: "check-email",
    component: CheckEmailComponent,
  },
  {
    path: "token-validation",
    component: TokenValidationComponent,
  },
  {
    path: "activated",
    component: ActivatedComponent,
  },
];

// const config = new AuthServiceConfig([
//   {
//     id: GoogleLoginProvider.PROVIDER_ID,
//     provider: new GoogleLoginProvider(environment.GoogleKey),
//   },
// ]);

// export function provideConfig() {
//   return config;
// }

@NgModule({
  declarations: [
    CheckEmailComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    SignUpComponent,
    SignInComponent,
    SupportLinksComponent,
    TokenValidationComponent,
    ActivatedComponent,
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule.forChild(routes),
    // SocialLoginModule,
  ],
  exports: [RouterModule],
  // providers: [
  //   {
  //     provide: AuthServiceConfig,
  //     useFactory: provideConfig,
  //   },
  // ],
})
export class AuthModule {}
