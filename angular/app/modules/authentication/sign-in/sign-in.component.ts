import { Component, OnInit, Injectable } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs";
// import { AuthService } from "angularx-social-login";
// import { GoogleLoginProvider } from "angularx-social-login";

import { MessagingService } from "../../../services/messaging.service";
import { HomeService } from "../../application/home/home.service";
import { HelperService } from "src/app/services/helper.service";
// import { Socket } from 'ngx-socket-io';
// import * as io from 'socket.io-client';
import { APIService, JReponse } from "src/app/services/api.service";
import { SocketService } from 'src/app/services/socketio.service';
import { GoogleAPIService } from 'src/app/services/googleApi.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.scss"],
})
@Injectable()
export class SignInComponent implements OnInit {
  signInForm: FormGroup;
  submitted = false;
  googleLoginData: any;
  isValidEmail = false;
  showError = false;
  errorMessage = "";
  confirmPasswordType = "password";
  currentMessage = new BehaviorSubject(null);
  title = "push-notification";
  message;
  // socket;
  password:any;
  passwordMinLength:any = 8;
  passwordLength:any = 25;
  passwordLengthError:any;
  disableButtonForInvalidPassword:boolean = false;
  disableButton = false;

  marketIdFromURL;
  marketInfo;
  loginEmail:any;

  emailIsverified:boolean = true;

  constructor(
    private afAuth: AngularFireAuth,
    private fb: FormBuilder,
    private helperService: HelperService,
    private homeService: HomeService,
    private apiService: APIService,
    private router: Router,
    // private authService: AuthService,
    private messagingService: MessagingService,
    private socketService: SocketService,
    private googleAuthService: GoogleAPIService,
    // private socket: Socket
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    const redirectURL = localStorage.getItem('redirect');
    localStorage.clear();
    if(redirectURL){
      localStorage.setItem('redirect',redirectURL);
    }
    this.messagingService.requestPermission();
    this.messagingService.receiveMessage();
    this.message = this.messagingService.currentMessage;
    this.signInForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
      remember: [false],
    });
    this.marketIdFromURL = this.activatedRoute.snapshot.queryParams.marketId;
    this.marketInfo = this.helperService.getLocalStore("wpMarket");
  }

  get form() {
    return this.signInForm.controls;
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

  checkMail() {
    this.submitted = true;
    this.showError = false;
    this.emailIsverified = true;
    if (this.signInForm.controls.email.valid) {
      const data = {
        email: this.signInForm.get("email").value,
      };
      this.loginEmail = this.signInForm.get("email").value;

      this.apiService
        .post("user/check-email-exist", data)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.submitted = false;
            this.isValidEmail = true;
          }
        })
        .catch((err: any) => {
          this.errorMessage = err.error.message;
          console.log(err.error)
          if(err.error.isverified === false){
            this.emailIsverified = err.error.isverified
          }
          this.showError = true;
          this.submitted = false;
          throw err;
        });
    }
  }

  signIn() {
    this.submitted = true;
    if(this.password.length < this.passwordMinLength || this.password.length > this.passwordLength){
      return false
    }
    this.submitted = true;
    this.showError = false;
    if (this.signInForm.valid) {
      this.submitted = true;
       const data = {
        email: this.signInForm.get("email").value,
        password: this.signInForm.get("password").value,
        fcmToken: this.helperService.getLocalStore("fcmToken"),
      };
      this.apiService
        .post("user/login", data)
        .then((jresponse: JReponse) => {
          
          if (jresponse) {
          
            if(jresponse.body.userData.restrictedDomain){
             
              this.helperService.setLocalStore(
                "isRestrictedDomain",
                true
              );
            }
            this.helperService.setLocalStore(
              "userData",
              jresponse.body.userData
            );
            this.getNotifications('unread', 0);
            // this.socketService.connectSocket();ost
            // this.socket.on("connection", (msg) => {
            // })
            // this.socket.emit("new-message", "hello");
            //this.helperService.hideLoading();
            //  this.socketService.connectSocket();
            
            
            this.helperService.changeClass();
            this.homeService.activityOrgId = "";
            this.homeService.activityWsId = "";
            this.homeService.sendOrgIdForPost({
              organization_id: "",
              workspace_id: "",
            });
            if (this.marketInfo && this.marketInfo.marketId) {
              // this.router.navigateByUrl(`wordpress/wp-market-detail?marketId=${this.marketIdFromURL}&auth=true`)
              this.router.navigateByUrl(
                `application/home/market-detail?marketId=${this.marketInfo.marketId}&auth=true`
              );
            } else {
              let redirectURL = localStorage.getItem('redirect');
              jresponse.body.userData.onboarding
                ? (redirectURL ? this.router.navigateByUrl(redirectURL) : this.router.navigateByUrl("application/home"))
                : this.router.navigateByUrl("onboarding");
            }
            this.submitted = false;
          }
        })
        .catch((err: any) => {
          this.errorMessage = err.error.message;
          this.showError = true;
          this.submitted = false;
          throw err;
        });
    }
  }

  getNotifications(type, skip) {
    this.homeService
      .getNotifications(skip, type)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          //  let notificationCount = 0;
          // jresponse.body.forEach((notification) => {
          //   if (!notification.is_read) {
          //     notificationCount += 1;
          //   }
          // });
          this.helperService.notificationApiCalled = true;
          this.helperService.setLocalStore(
            "notificationCount",
            jresponse.body.totalRecord
          );
          this.helperService.notificationCount = jresponse.body.totalRecord;
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  async signInWithGoogle() {
    await this.googleAuthService.gSignIn();
    const user = this.googleAuthService.userDetails;
    const keys = Object.keys(user);
    let tokenData = {
      "access_token": user[keys[1]].access_token,
      "expires_in": user[keys[1]].expires_in,
      "scope": user[keys[1]].scope,
      "token_type": user[keys[1]].token_type,
      "id_token": user[keys[1]].id_token
    }
    const loginData = {
      email: user[keys[2]][Object.keys(user[keys[2]])[5]],
      id: user[keys[0]],
      firstName: user[keys[2]][Object.keys(user[keys[2]])[2]],
      lastName: user[keys[2]][Object.keys(user[keys[2]])[3]],
      token: tokenData
    }
    this.loginWithSocial(
      loginData.email,
      "google",
      loginData.id,
      loginData.firstName,
      loginData.lastName,
      loginData.token
    );
    // this.authService
    //   .signIn(GoogleLoginProvider.PROVIDER_ID)
    //   .then((x) => {
    //     this.googleLoginData = x;
    //     this.loginWithSocial(
    //       this.googleLoginData.email,
    //       value,
    //       this.googleLoginData.id,
    //       this.googleLoginData.firstName,
    //       this.googleLoginData.lastName
    //     );
    //   })
    //   .catch((err: any) => {
    //     console.log(err)
    //     throw err;
    //   });
  }

  async _loginWithGoogle() {
    this.afAuth.signInWithPopup(new auth.GoogleAuthProvider())
      .then(googleResponse => {
        // Successfully logged in
        console.log(googleResponse);
        console.log(googleResponse.user.displayName)

        let tokenData = {
          "access_token": googleResponse.credential.access_token,
          // "expires_in": googleResponse.user.stsTokenManager.expirationTime,
          "id_token": googleResponse.user.uid,
        }
        const loginData = {
          email: googleResponse.user.email,
          id: googleResponse.user.uid,
          firstName: googleResponse.user.displayName.split(' ')[0],
          lastName: googleResponse.user.displayName.split(' ')[1],
          token: tokenData
        }
        this.loginWithSocial(
          loginData.email,
          "google",
          loginData.id,
          loginData.firstName,
          loginData.lastName,
          loginData.token
        );

        // email 
        // Add your logic here
        
      }).catch(err => {
        // Login error
        console.log(err);
      });
}

  loginWithSocial(emailId, socialTypes, socialIds, firstName, lastName, token) {
    const data = {
      email: emailId,
      loginType: socialTypes,
      socialId: socialIds,
      firstName: firstName,
      lastName: lastName,
      token: token
    };
    try {
      this.apiService
        .post("user/googleSignIn", data)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            // this.helperService.showSuccessToast(jresponse.message);
            if(jresponse.body.userData.restrictedDomain){
              this.helperService.setLocalStore(
                "isRestrictedDomain",
                true
              );
            }
            this.helperService.setLocalStore(
              "userData",
              jresponse.body.userData
            );
            this.getNotifications('unread', 0);
            let redirectURL = localStorage.getItem('redirect');
            jresponse.body.userData.onboarding
              ? (redirectURL ? this.router.navigateByUrl(redirectURL) : this.router.navigateByUrl("application/home"))
              : this.router.navigateByUrl("onboarding");
          }
        })
        .catch((err: Error) => {
          throw err;
        });
      this.signInForm.reset();
    } catch (err) { }
  }

  resendSignUpVerification(){
      this.disableButton = true;
      const postData = {
        email: this.loginEmail
      };
      this.apiService
        .postWithContentTypeHeader("user/resendSignUpVerification", postData)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.helperService.showSuccessToast(jresponse.message);
            this.disableButton = false;
          }
        })
        .catch((err: any) => {
          this.helperService.showErrorToast(err.error.message);
          this.disableButton = false;
          throw err;
        });
  }
  
}
