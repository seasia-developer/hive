import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";

import { HelperService } from "src/app/services/helper.service";
import { APIService, JReponse } from "src/app/services/api.service";
@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  submitted = false;
  token;
  pwPasswordType = "password";
  confirmPasswordType = "password";
  apiCalled: boolean;
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
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get("token");
    this.resetPasswordForm = this.fb.group(
      {
        password: [
          "",
          [
            Validators.required,
            Validators.pattern(
              "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
            ),
          ],
        ],
        confirmPassword: ["", [Validators.required]],
      },
      {
        validator: this.helperService.confirmedValidator(
          "password",
          "confirmPassword"
        ),
      }
    );
  }

  get form() {
    return this.resetPasswordForm.controls;
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

  submit() {
    this.disableButtonForInvalidPassword = false;
    if(this.password.length < this.passwordMinLength || this.password.length > this.passwordLength){
      return false
    }
    this.submitted = true;
    this.apiCalled = true;
    if (this.resetPasswordForm.valid) {
      this.disableButtonForInvalidPassword = true;
      const data = {
        token: this.token,
        password: this.resetPasswordForm.get("password").value,
      };
      this.apiService
        .postWithHeader("user/reset-password", data, this.token)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.helperService.showSuccessToast(jresponse.message);
            
          }
          this.apiCalled = false;
          this.resetPasswordForm.reset();
          this.router.navigateByUrl("/auth/sign-in");
          this.disableButtonForInvalidPassword = false;
        })
        .catch((err: any) => {
          this.apiCalled = false;
          this.helperService.showErrorToast(err.message);
          this.disableButtonForInvalidPassword = false;
          throw err;
        });
    }
    this.apiCalled = false;
  }
}
