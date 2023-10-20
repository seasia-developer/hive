import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";

import { Constants } from "src/app/constants/constants";
import { JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { AdminService } from "../admin.service";
@Component({
  selector: "app-generate-coupons",
  templateUrl: "./generate-coupons.component.html",
  styleUrls: ["./generate-coupons.component.scss"],
})
export class GenerateCouponsComponent implements OnInit {
  planTypes = Constants.PLAN_TYPES;
  planPeriod = Constants.PLAN_PERIOD;
  pricePerSeat = Constants.PRICE_PER_SEAT;
  generateCouponForm: FormGroup;
  couponId;
  numberOfCoupon;
  submitted = false;
  couponDetails;
  couponCodes = [];
  today = new Date();
 // seatOption;
  isEdit;

  constructor(
    private fb: FormBuilder,
    private helperService: HelperService,
    private router: Router,
    private adminService: AdminService,
    private activatedRoute: ActivatedRoute
  ) {
    this.couponId = this.activatedRoute.snapshot.queryParams.couponId;
    this.numberOfCoupon = this.activatedRoute.snapshot.queryParams.numberOfCoupon;
   // this.seatOption = this.activatedRoute.snapshot.queryParams.seatOption;
    this.isEdit = this.activatedRoute.snapshot.queryParams.isEdit;
  }

  ngOnInit() {
    if (this.couponId) {
      this.getCouponDetails();
    }
    this.generateCouponForm = this.fb.group({
      issuedTo: [""],
      email: ["", [ Validators.email]],
      note: [""],
      planType: ["", Validators.required],
      period: ["", Validators.required],
      //seatOption: ["", Validators.required],
      records: [""],
      storage: [""],
      seats_per_coupon: ["", [Validators.required,Validators.pattern("^[0-9]*$")]],
      // max_member_per_coupon: ["", [Validators.required,Validators.pattern("^[0-9]*$")]],
      no_of_coupon: ["", [Validators.required,Validators.pattern("^[0-9]*$")]],
      price_per_seat: [""],
      acquisition_cost: [""],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
    });
  }

  async getCouponDetails() {
    await this.adminService
      .getCouponDetail(this.couponId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.couponCodes = [];
          this.couponDetails = jresponse.body;
          this.couponDetails.startDate = moment(this.couponDetails.startDate).format("MM/DD/YYYY");
          this.couponDetails.endDate = moment(this.couponDetails.endDate).format("MM/DD/YYYY");
          this.setGenerateCouponForm(this.couponDetails);
          this.couponDetails.couponData.forEach((element) => {
            this.couponCodes.push(element.coupon);
          });
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  setGenerateCouponForm(couponDetails) {
    this.generateCouponForm.setValue({
      issuedTo: couponDetails.issuedTo,
      email: couponDetails.email,
      note: couponDetails.note,
      planType: couponDetails.planType,
      period: couponDetails.period,
   //   seatOption: couponDetails.seatOption,
      records: couponDetails.records,
      storage: couponDetails.storage,
      seats_per_coupon: couponDetails.seats_per_coupon,
      // max_member_per_coupon: couponDetails.max_member_per_coupon,
      no_of_coupon: couponDetails.no_of_coupon,
      price_per_seat: couponDetails.price_per_seat,
      acquisition_cost: couponDetails.acquisition_cost,
      startDate: couponDetails.startDate,
      endDate: couponDetails.endDate,
    });
    if (this.numberOfCoupon > 1 && this.isEdit) {
      this.generateCouponForm.controls["issuedTo"].disable();
      this.generateCouponForm.controls["email"].disable();
      this.generateCouponForm.controls["note"].disable();
      this.generateCouponForm.controls["planType"].disable();
      this.generateCouponForm.controls["period"].disable();
    //  this.generateCouponForm.controls["seatOption"].disable();
      this.generateCouponForm.controls["records"].disable();
      this.generateCouponForm.controls["storage"].disable();
      this.generateCouponForm.controls["seats_per_coupon"].disable();
      // this.generateCouponForm.controls["max_member_per_coupon"].disable();
      // this.generateCouponForm.controls["no_of_coupon"].disable();
       this.generateCouponForm.controls["price_per_seat"].disable();
      this.generateCouponForm.controls["startDate"].disable();
      this.generateCouponForm.controls["endDate"].disable();
    } else if (this.numberOfCoupon <= 1 && this.isEdit) {
      this.generateCouponForm.controls["issuedTo"].disable();
      this.generateCouponForm.controls["email"].disable();
      this.generateCouponForm.controls["note"].disable();
      this.generateCouponForm.controls["planType"].disable();
      this.generateCouponForm.controls["period"].disable();
      
     // this.generateCouponForm.controls["seatOption"].disable();
      this.generateCouponForm.controls["records"].disable();
      this.generateCouponForm.controls["storage"].disable();
      this.generateCouponForm.controls["seats_per_coupon"].disable();
      // this.generateCouponForm.controls["max_member_per_coupon"].disable();
      this.generateCouponForm.controls["no_of_coupon"].disable();
      this.generateCouponForm.controls["price_per_seat"].disable();
      // this.generateCouponForm.controls["acquisition_cost"].disable();
      this.generateCouponForm.controls["startDate"].disable();
      this.generateCouponForm.controls["endDate"].disable();
    } else {
      this.generateCouponForm.controls["issuedTo"].disable();
      this.generateCouponForm.controls["email"].disable();
      this.generateCouponForm.controls["note"].disable();
      this.generateCouponForm.controls["planType"].disable();
      this.generateCouponForm.controls["period"].disable();
     // this.generateCouponForm.controls["seatOption"].disable();
      this.generateCouponForm.controls["records"].disable();
      this.generateCouponForm.controls["storage"].disable();
      this.generateCouponForm.controls["seats_per_coupon"].disable();
      // this.generateCouponForm.controls["max_member_per_coupon"].disable();
      this.generateCouponForm.controls["no_of_coupon"].disable();
      this.generateCouponForm.controls["price_per_seat"].disable();
      this.generateCouponForm.controls["acquisition_cost"].disable();
      this.generateCouponForm.controls["startDate"].disable();
      this.generateCouponForm.controls["endDate"].disable();
    }
  }

  changePlanType(e) {
    this.generateCouponForm.controls.planType.setValue(e.target.value);
  }

  changePeriod(e) {
    this.generateCouponForm.controls.period.setValue(e.target.value);
  }

  // changePricePerSeat(e) {
  //   this.generateCouponForm.controls.seatOption.setValue(e.target.value);
  // }

  get form() {
    return this.generateCouponForm.controls;
  }

  generateCoupon() {
    if (!this.couponId && !this.numberOfCoupon) {
      this.submitted = true;
      if (this.generateCouponForm.valid) {
        try {
          this.adminService
            .generateCoupon(this.generateCouponForm.value)
            .then((jresponse: JReponse) => {
              if (jresponse) {
                this.helperService.showSuccessToast(jresponse.message);
                this.generateCouponForm.reset();
                this.submitted = false;
                this.router.navigateByUrl("application/home/admin/coupopns");
              }
            })
            .catch((err: Error) => {
              this.submitted = false;
              throw err;
            });
        } catch (err) {
          throw err;
        }
      }
    } else if (this.couponId && this.numberOfCoupon <= 1) {
      this.adminService
        .sendCouponEmail(this.couponId)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            this.router.navigateByUrl("application/home/admin/coupopns");
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    } else if (this.couponId && this.numberOfCoupon > 1) {
      let data = [];
      this.couponCodes.forEach((e) => {
        let innerExcelDetails = {
          "Coupon codes": e,
          "Issued to": this.generateCouponForm.controls["issuedTo"].value,
          Email: this.generateCouponForm.controls["email"].value,
          Notes: this.generateCouponForm.controls["note"].value,
          Plan: this.generateCouponForm.controls["planType"].value,
          "Seats per coupon": this.generateCouponForm.controls[
            "seats_per_coupon"
          ].value,
          // "max member per coupon": this.generateCouponForm.controls[
          //   "max_member_per_coupon"
          // ].value,
          Period: this.generateCouponForm.controls["period"].value,
          "Number of coupons": this.generateCouponForm.controls["no_of_coupon"]
            .value,
          "Records per workspace": this.generateCouponForm.controls["records"]
            .value,
          "Price per seat":
            this.generateCouponForm.controls["price_per_seat"].value ,
         
         //   this.generateCouponForm.controls["seatOption"].value,
          "Storage per seat": this.generateCouponForm.controls["storage"].value,
          "Cost of acquisition": this.generateCouponForm.controls[
            "acquisition_cost"
          ].value,
          "Valid dates":
            moment(this.generateCouponForm.controls["startDate"].value).format(
              "MMM DD, YYYY"
            ) +
            " to " +
            moment(this.generateCouponForm.controls["endDate"].value).format(
              "MMM DD, YYYY"
            ),
        };
        data.push(innerExcelDetails);
      });
      this.adminService.exportAsExcelFile(data, "Coupon_Details");
    } else {
      this.submitted = true;
      if (this.generateCouponForm.valid) {
        try {
          this.adminService
            .editCoupon(this.couponId, this.generateCouponForm.value)
            .then((jresponse: JReponse) => {
              if (jresponse) {
                this.helperService.showSuccessToast(jresponse.message);
                this.generateCouponForm.reset();
                this.submitted = false;
                this.router.navigateByUrl("application/home/admin/coupopns");
              }
            })
            .catch((err: Error) => {
              this.submitted = false;
              throw err;
            });
        } catch (err) {
          throw err;
        }
      }
    }
  }
}
