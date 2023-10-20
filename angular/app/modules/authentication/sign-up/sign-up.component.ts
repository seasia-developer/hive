import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
// import { AuthService } from "angularx-social-login";
// import { GoogleLoginProvider } from "angularx-social-login";
import { Router, ActivatedRoute } from "@angular/router";

import { HelperService } from "src/app/services/helper.service";
import { APIService, JReponse } from "src/app/services/api.service";
import { GoogleAPIService } from 'src/app/services/googleApi.service';
import { AdminService } from 'src/app/modules/application/home/admin/admin.service';

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.scss"],
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  submitted = false;
  googleLoginData: any;
  confirmPasswordType = "password";
  guestUserEmail: any;
  guestUserId: any;
  isGuestUser = false;
  disableButton = false;
  signupEmail:any;
  restrictedDomain:any;
  password:any;
  passwordMinLength:any = 8;
  passwordLength:any = 25;
  passwordLengthError:any;
  disableButtonForInvalidPassword:boolean = false;

  constructor(
    private fb: FormBuilder,
    private helperService: HelperService,
    private apiService: APIService,
    private router: Router,
    // private authService: AuthService,
    private googleAuthService: GoogleAPIService,
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.guestUserEmail = this.activatedRoute.snapshot.queryParams.email || "";
    this.guestUserId = this.activatedRoute.snapshot.queryParams.userId;
    this.signUpForm = this.fb.group({
      email: [this.guestUserEmail, [Validators.required, Validators.email]],
      firstName: ["", [
        Validators.required, 
        Validators.pattern('^[a-zA-Z]+$'),
        Validators.minLength(2),
        Validators.maxLength(20)
        ]],
      lastName: ["", [
        Validators.required, 
        Validators.pattern('^[a-zA-Z]+$'),
        Validators.minLength(2),
        Validators.maxLength(20)
        ]],
      password: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
          ),
        ],
      ],
    });
    if (this.guestUserEmail && this.guestUserId) {
      this.isGuestUser = true;
      this.signUpForm.controls.email.disable();
    }
  }

  get form() {
    return this.signUpForm.controls;
  }

  checkPasswordLength(){
    // ENABLE PASSWORD SUBMIT BTN 
    this.disableButtonForInvalidPassword = false;
    // ENABLE PASSWORD ERROR MSG
    this.passwordLengthError = false;
    // IF PASSWORD LENGTH EXCEEDS 
    if(this.password.length < this.passwordMinLength || this.password.length > this.passwordLength){
      // DISABLE SUBMIT BTN 
      this.disableButtonForInvalidPassword = true;
      // DISABLE ERROR MSG 
      this.passwordLengthError = true;
    }
  }

  async isRestrictedDomain(email){
    this.helperService.setLocalStore(
      "isRestrictedDomain",
      false
    );
    await this.adminService.getAllRestrictedDomains()
    .then((jresponse: JReponse) => {
      if (jresponse.success) {
        this.restrictedDomain = jresponse.body.map(data => data.domain);
      }
    })
    .catch((err: Error) => {
      throw err;
    });
    if(this.restrictedDomain.includes(email.split('@')[1])){
      this.helperService.setLocalStore(
        "isRestrictedDomain",
        true
      );
    }
  }

  async signUp() {
    this.disableButton = false;
    if(this.password.length < this.passwordMinLength || this.password.length > this.passwordLength){
      return false
    }
    this.submitted = true;
    // await this.isRestrictedDomain(this.signupEmail);
    if (this.signUpForm.valid) {
      this.disableButton = true;
      if (this.isGuestUser) {
        const userData = this.signUpForm.value;
        userData.userId = this.guestUserId;
        userData.email = this.guestUserEmail;
        this.apiService
          .post("user/guestSignup", userData)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              this.submitted = false;
              this.helperService.showSuccessToast(jresponse.message);
              this.helperService.setLocalStore(
                "userData",
                jresponse.body.userData
              );

              let redirectURL = localStorage.getItem('redirect');

              if(redirectURL){
                this.router.navigateByUrl(redirectURL)
              }
              else{
                this.router.navigate(["application/home"], {
                  queryParams: { guestLogin: true },
                });
              }
              
              this.signUpForm.reset();
            }
             this.disableButton = false;
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.error.message);
            this.submitted = false;
            this.disableButton = false;
            throw err;
          });
      } else {
        this.apiService
          .post("user/signup", this.signUpForm.value)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              localStorage.setItem('signupUserData', JSON.stringify(this.signUpForm.value))
              this.submitted = false;
              this.helperService.showSuccessToast(jresponse.message);
              this.router.navigateByUrl("auth/check-email");
              this.signUpForm.reset();
            }
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.error.message);
            this.submitted = false;
            this.disableButton = false;
            throw err;
          });
      }
    } else {
      this.disableButton = false;
    }
  }

  async signUpWithGoogle() {
    await this.googleAuthService.gSignIn();
    const user = this.googleAuthService.userDetails;
    const keys = Object.keys(user);
    let tokenData={
      "access_token":user[keys[1]].access_token,
      "expires_in":user[keys[1]].expires_in,
      "scope":user[keys[1]].scope,
      "token_type":user[keys[1]].token_type,
      "id_token":user[keys[1]].id_token
    }
    const loginData = {
      email: user[keys[2]][Object.keys(user[keys[2]])[5]],
      id: user[keys[0]],
      firstName: user[keys[2]][Object.keys(user[keys[2]])[2]],
      lastName: user[keys[2]][Object.keys(user[keys[2]])[3]],
      token:tokenData
    }
    // await this.isRestrictedDomain(loginData.email);
    this.loginWithSocial(
      loginData.email,
      "google",
      loginData.id,
      loginData.firstName,
      loginData.lastName,
      loginData.token
    );
    // this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((x) => {
    //   this.googleLoginData = x;
    //   this.loginWithSocial(
    //     this.googleLoginData.email,
    //     value,
    //     this.googleLoginData.id,
    //     this.googleLoginData.firstName,
    //     this.googleLoginData.lastName
    //   );
    // });
  }

  async loginWithSocial(emailId, socialTypes, socialIds, firstName, lastName,token) {
    const data = {
      email: emailId,
      loginType: socialTypes,
      socialId: socialIds,
      firstName: firstName,
      lastName: lastName,
      token:token
    };
    try {
      // await this.isRestrictedDomain(emailId);
      this.apiService
        .post("user/googleSignIn", data)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            if(jresponse.body.userData.restrictedDomain){
              this.helperService.setLocalStore(
                "isRestrictedDomain",
                true
              );
            }
            this.helperService.showSuccessToast(jresponse.message);
            this.helperService.setLocalStore(
              "userData",
              jresponse.body.userData
            );
            let redirectURL = localStorage.getItem('redirect');
            if(redirectURL){
              this.router.navigateByUrl(redirectURL)
            }
            else{
            this.router.navigateByUrl("application/home");
            }
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    } catch (err) {}
  }
}
