import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { HelperService } from "src/app/services/helper.service";
import { APIService, JReponse } from "src/app/services/api.service";
@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  submitted = false;
  emailSent = false;
  emailNotRecognised = false;
  isVerified = true;
  


  constructor(
    private fb: FormBuilder,
    private helperService: HelperService,
    private apiService: APIService,
    private router: Router
  ) {}

  ngOnInit() {
    this.forgotPasswordForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }

  get form() {
    return this.forgotPasswordForm.controls;
  }

  send() {
    this.submitted = false;
    if (this.forgotPasswordForm.valid) {
      this.submitted = true;
      this.apiService
        .post("user/forgot-password", this.forgotPasswordForm.value)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.helperService.showSuccessToast(jresponse.message);
            this.forgotPasswordForm.reset();
            this.emailSent = true;
            this.submitted = false;
          }
        })
        .catch((err: any) => {
          this.helperService.showErrorToast(err.error.message);
          this.submitted = false;
          if (err.error.message === "Please enter valid email id") {
            this.emailNotRecognised = true;
          }
          if (err.error.message === "Please verify your account first") {
            this.isVerified = false;
          }
          throw err;
        });
    }
  }
}
