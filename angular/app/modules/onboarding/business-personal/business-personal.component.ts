import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { CommonService } from "./../../../services/common.service";
import { JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { Constants } from "src/app/constants/constants";
import { SharedOnboardingService } from "../../onboarding/shared-onboarding.service";
@Component({
  selector: "app-business-personal",
  templateUrl: "./business-personal.component.html",
  styleUrls: ["./business-personal.component.scss"],
})
export class BusinessPersonalComponent implements OnInit {
  industryData: any = [];
  bussinessOrPersonal: any;
  onboardingForm: FormGroup;
  bussinessPersonalImageData: any;
  imagePreview: any;
  submitted = false;
  sizeOfEmployee: any = Constants.SIZE_OF_EMPLOYEES;
  couponData;
  onboardingFormVal;
  couponerror = "";
  isRestrictedDomain:boolean= false;

  constructor(
    private common: CommonService,
    private helper: HelperService,
    private fb: FormBuilder,
    private router: Router,
    private sharedOnboardingService: SharedOnboardingService
  ) {
    this.bussinessOrPersonal = helper.getLocalStore("userType");
    this.getIndustriesList();
    this.onboardingForm = this.fb.group({
      name: ["", Validators.required],
      size: ["", Validators.required],
      industry: ["", Validators.required],
      coupon: [""],
    });
  }

  async ngOnInit() {
    this.isRestrictedDomain = false
    if(this.helper.getLocalStore("isRestrictedDomain")){
      this.isRestrictedDomain = true
    }
  }

  getIndustriesList() {
    this.common
      .industriesList()
      .then((res: JReponse) => {
        this.industryData = res.body.data;
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  submitOnboarding() {
    this.submitted = true;
    this.onboardingFormVal = this.onboardingForm.value;
    if (this.onboardingForm.invalid) {
      return;
    } else {
      this.getValidateLifetimeCoupon(this.onboardingFormVal);
    }
    // if (this.onboardingForm.invalid) {
    //   return;
    // } else {
    //   this.helper.setLocalStore("onboardingData", this.onboardingForm.value);
    //   this.router.navigate(["/onboarding/category"]);
    // }
  }

  get ob() {
    return this.onboardingForm.controls;
  }

  fileupload(event) {
    this.bussinessPersonalImageData = event.target.files[0];
    this.helper.onboardingImg = this.bussinessPersonalImageData;
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  callFileUpload() {
    document.getElementById("addLogo").click();
  }

  async getValidateLifetimeCoupon(onboardingFormVal) {
    if (onboardingFormVal.coupon != "") {
      await this.sharedOnboardingService
        .getValidateLifetimeCoupon(onboardingFormVal.coupon)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.helper.setLocalStore("couponData", jresponse.body);
            this.helper.setLocalStore("isCouponApplied", true);
            this.helper.setLocalStore("onboardingData", onboardingFormVal);
            this.router.navigate(["/onboarding/category"]);
          }
        })
        .catch((err: Error) => {
          this.couponerror = err.message;
          throw err;
        });
    } else {
      this.helper.setLocalStore("onboardingData", onboardingFormVal);
      this.router.navigate(["/onboarding/category"]);
    }
  }

  removeCouponError() {
    this.couponerror = "";
  }
}
