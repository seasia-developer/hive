import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { JReponse } from "src/app/services/api.service";
import { AdminService } from "../admin.service";
import { Constants } from "src/app/constants/constants";

@Component({
  selector: "app-coupons",
  templateUrl: "./coupons.component.html",
  styleUrls: ["./coupons.component.scss"],
})
export class CouponsComponent implements OnInit {
  headElements = [
    // "Issued to",
    "Plan",
    "Period",
    "Coupons",
    "Consumed Seats",
    // "Price",
    // "Email",
  ];
  planTypes = Constants.PLAN_TYPES;
  couponList = [];
  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit() {
    this.getCoupons();
  }


  async getCoupons() {
    await this.adminService
      .getCoupons()
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.couponList = jresponse.body;
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  send(couponId, numberOfCoupon, seatOption) {
    this.router.navigate(["application/home/admin/generate-coupons"], {
      queryParams: {
        couponId: couponId,
        numberOfCoupon: numberOfCoupon,
        seatOption: seatOption,
      },
    });
  }

  editCoupon(couponId, numberOfCoupon) {
    this.router.navigate(["application/home/admin/generate-coupons"], {
      queryParams: {
        couponId: couponId,
        numberOfCoupon: numberOfCoupon,
        isEdit: true,
      },
    });
  }
}
