import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { HomeService } from "../home.service";
import { JReponse } from "src/app/services/api.service";
@Component({
  selector: "app-upgrade",
  templateUrl: "./upgrade.component.html",
  styleUrls: ["./upgrade.component.scss"],
})
export class UpgradeComponent implements OnInit {
  type = "yearly";
  orgId: any;
  plans: any = {
    monthly: {
      pro: {},
      plus: {},
    },
    yearly: {
      pro: {},
      plus: {},
    },
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private homeService: HomeService
  ) {}

  ngOnInit() {
    this.orgId = this.activatedRoute.snapshot.queryParams.orgId;
    this.getPlans();
  }

  upgradePlan(type) {
    this.router.navigateByUrl(
      `application/home/upgrade/payment?orgId=${this.orgId}&plan=${type}&type=${this.type}`
    );
  }

  updateType(event) {
    if (event.target.checked) {
      this.type = "monthly";
    } else {
      this.type = "yearly";
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
          this.plans.yearly.pro.amount = parseFloat(
            this.plans.yearly.pro.amount
          ).toFixed(2);
          this.plans.yearly.plus.amount = parseFloat(
            this.plans.yearly.plus.amount
          ).toFixed(2);
          this.plans.monthly.pro.amount = parseFloat(
            this.plans.monthly.pro.amount
          ).toFixed(2);
          this.plans.monthly.plus.amount = parseFloat(
            this.plans.monthly.plus.amount
          ).toFixed(2);
        }
        this.homeService.plans = this.plans;
      })
      .catch((err: Error) => {
        throw err;
      });
  }
}
