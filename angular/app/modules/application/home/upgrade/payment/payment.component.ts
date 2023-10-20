import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";

import { HomeService } from "../../home.service";
import { JReponse, APIService } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { environment } from "src/environments/environment";
@Component({
  selector: "app-payment",
  templateUrl: "./payment.component.html",
  styleUrls: ["./payment.component.scss"],
})
export class PaymentComponent implements OnInit {
  type = "";
  orgId = "";
  plan = "";
  paymentForm: FormGroup;
  cardForm: FormGroup;
  submitted = false;
  selectedPlan: any = {};
  selectedOrg: any = {};
  monthlyPrice;
  annualPrice;
  date = "";
  orgUsers = [];
  plans: any = {
    monthly: {
      pro: [],
      plus: [],
    },
    yearly: {
      pro: [],
      plus: [],
    },
  };
  mediaUrl = environment.MEDIA_URL;
  modalRef: BsModalRef | null;
  discountPrice: any;
  couponId: "";
  code = "";
  canAddComment = true;
  btnDisable = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private homeService: HomeService,
    private helperService: HelperService,
    private apiService: APIService,
    private modalService: BsModalService,
    public sanitizer: DomSanitizer,
    private router: Router
  ) { }

  async ngOnInit() {
    this.paymentForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      organization: ["", [Validators.required]],
      address_line_1: ["", [Validators.required]],
      address_line_2: [""],
      postal_code: ["", [Validators.required]],
      city: ["", [Validators.required]],
      state: [""],
      country: ["", [Validators.required]],
      phone: ["", [Validators.required]],
    });
    this.cardForm = this.fb.group({
      card_number: [
        "",
        [
          Validators.required,
          Validators.maxLength(16),
          Validators.minLength(16),
        ],
      ],
      exp_month: [
        "",
        [
          Validators.required,
          Validators.maxLength(2),
          Validators.minLength(2),
          Validators.max(12),
        ],
      ],
      exp_year: [
        "",
        [Validators.required, Validators.maxLength(2), Validators.minLength(2)],
      ],
      cvc: [
        "",
        [Validators.required, Validators.maxLength(3), Validators.minLength(3)],
      ],
    });
    this.orgId = this.activatedRoute.snapshot.queryParams.orgId;
    await this.getOrgUsers();
    this.selectedOrg = this.helperService.orgList.find(
      (org) => org._id === this.orgId
    );
    this.plan = this.activatedRoute.snapshot.queryParams.plan;
    this.type = this.activatedRoute.snapshot.queryParams.type;
    this.date =
      this.type === "monthly"
        ? moment().format("DD")
        : moment().format("DD/MM");
    if (this.homeService.plans) {
      this.selectedPlan = this.homeService.plans[this.type][this.plan];
    } else {
      this.getPlans();
    }
   
  }

  numberOnly(event, limit, value, type = ""): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode > 31 && (charCode < 48 || charCode > 57)) || limit < value) {
      return false;
    }
    return true;
  }

  upgrade() {

    let data = this.paymentForm.value;
    data.planId = this.selectedPlan.id;
    data.organization_id = this.orgId;
    data.quantity = this.orgUsers.length;
    data.plan = this.plan;
    data = { ...data, ...this.cardForm.value };
    data.discountPrice = this.discountPrice;
    data.couponCode = this.code;
    data.couponId = this.couponId;
    data.interval = this.type;
    this.submitted = true;
    if (this.paymentForm.valid && this.cardForm.valid) {
      this.btnDisable = true;
      this.homeService
        .addBillingInfo(data)
        .then((jresponse: any) => {
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            this.submitted = false;
            this.btnDisable = false;
            this.router.navigateByUrl("application/home");
          } else if (jresponse.generatedError) {
            this.btnDisable = false;
            this.helperService.showErrorToast(jresponse.generatedError.message);
          }
        })
        .catch((err: any) => {
          this.btnDisable = false;
          if (err.generatedError) {
            this.helperService.showErrorToast(err.generatedError.message);
          } else {
            this.helperService.showErrorToast(err.message);
          }
          throw err;
        });
    }
  }

  getOrgUsers() {
    return new Promise((resolve, reject) => {
      this.apiService
        .getWithHeader(`organization/${this.orgId}/employees`)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.orgUsers = jresponse.body.data;
            resolve();
          }
        })
        .catch((err: any) => {
          reject();
          throw err;
        });
    });
  }

  openPrivaceModal(template) {
    const initialState = { class: "privacyModal",animated: true,
    keyboard: true,
    backdrop: false,
    ignoreBackdropClick: true };
    this.modalRef = this.modalService.show(template, initialState);
  }

  removeCode() {
    this.code = "";
  }

  getCouponAvailability(event) {

    this.code = event.target.value;
    if (this.code.length === 14 && this.canAddComment) {
      this.canAddComment = false;
      let data = {
        code: this.code,
        plan: this.plan,
        type: this.type
      }
      this.homeService
        .getCouponAvailability(data)
        .then((jresponse: JReponse) => {
          this.canAddComment = true;
          if (jresponse.body && jresponse.body.price_per_seat) {
            this.discountPrice = jresponse.body.price_per_seat * jresponse.body.seats_per_coupon;
            this.discountPrice = parseFloat(this.discountPrice).toFixed(2);
            this.monthlyPrice=((this.orgUsers.length * this.selectedPlan.amount) - this.discountPrice).toFixed(2) 
            this.monthlyPrice=this.monthlyPrice>0?this.monthlyPrice:0;
            this.annualPrice=((this.orgUsers.length * this.selectedPlan.amount * 12) - this.discountPrice).toFixed(2)
            this.annualPrice=this.annualPrice>0?this.annualPrice:0;
            this.couponId = jresponse.body.couponId;
          } else {
            this.code = "";
            this.helperService.showErrorToast(jresponse.message);
          }
        })
        .catch((err: Error) => {
          this.canAddComment = true;
          this.helperService.showErrorToast(err.message)
          throw err;
        });
    } else {
      this.discountPrice = "";
    }
  }

  getPlans() {
    this.homeService
      .getPlans()
      .then((jresponse: JReponse) => {
        if (jresponse) {
          const plans = jresponse.body;
          const monthly = [];
          const yearly = [];
          plans.forEach((plan) => {
            plan.amount = plan.amount / 100;
            if (plan.interval === "month") {
              monthly.push(plan);
            } else {
              yearly.push(plan);
            }
          });
          if (monthly[0].amount > monthly[1].amount) {
            this.plans.monthly.pro = monthly[0];
            this.plans.monthly.plus = monthly[1];
          } else {
            this.plans.monthly.pro = monthly[1];
            this.plans.monthly.plus = monthly[0];
          }
          if (yearly[0].amount > yearly[1].amount) {
            this.plans.yearly.pro = yearly[0];
            this.plans.yearly.plus = yearly[1];
          } else {
            this.plans.yearly.pro = yearly[1];
            this.plans.yearly.plus = yearly[0];
          }
        }
        this.homeService.plans = this.plans;
        this.selectedPlan = this.homeService.plans[this.type][this.plan];
        this.selectedPlan.amount = parseFloat(this.selectedPlan.amount).toFixed(
          2
        );
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  changePlan(event, type) {
    this.code = "";
    if (type === "plan") {
      this.plan = event.target.value;
    } else {
      this.type = event.target.value;
      this.date =
        this.type === "monthly"
          ? moment().format("DD")
          : moment().format("DD/MM");
    }
    this.getPlans();
  }
  cancel() {
    this.homeService.activityWsId = "";
    this.homeService.activityOrgId = "";
    this.homeService.activeWorkspaceId = "";
    this.homeService.applicationList = [];
    this.homeService.sendOrgIdForPost({
      organization_id: "",
      workspace_id: "",
    });
    this.router.navigateByUrl("application/home");
  }
}
