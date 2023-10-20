import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Constants } from "../../../../../constants/constants";
import { HelperService } from "src/app/services/helper.service";
import { HomeService } from "src/app/modules/application/home/home.service";

@Component({
  selector: "app-parent",
  templateUrl: "./parent.component.html",
  styleUrls: ["./parent.component.scss"],
})
export class ParentComponent implements OnInit {
  activeTabId: any;
  subscriptions: any;
  isMonetisationTab: any = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private helper: HelperService,
    private homeService: HomeService
  ) {}

  ngOnInit() {
    switch (this.activatedRoute.snapshot["_urlSegment"].segments[3].path) {
      case Constants.PARENT_ROUTES.profile:
        this.activeTabId = "profile";
        break;
      case Constants.PARENT_ROUTES.business:
        this.activeTabId = "businessprofile";
        break;
      case Constants.PARENT_ROUTES.workspace:
        this.activeTabId = "workspace";
        break;
      case Constants.PARENT_ROUTES.services:
        this.activeTabId = "services";
        break;
      case Constants.PARENT_ROUTES.email:
        this.activeTabId = "email-notification";
        break;
    }
    // this.router.navigate(['/application/home/parent/my-profile']);
    // this.activeTabId = 'profile';
    this.getPlatformSubscriptions();
  }

  ngDoCheck() {
    if (localStorage.getItem("isPaidPlan") === "true") {
      this.isMonetisationTab = true;
    } else {
      this.isMonetisationTab = false;
    }
  }

  // GET PLATFORM SUBSCRIPTONS
  getPlatformSubscriptions() {
    this.homeService
      .getPlatformSubscriptions()
      .then((jresponse: any) => {
        if (jresponse) {
          console.log("jresponse dd", jresponse.body);
          this.subscriptions = jresponse.body.filter((data) => data.status);
          if (this.subscriptions.length) {
            localStorage.setItem("isPaidPlan", "true");
          } else {
            localStorage.setItem("isPaidPlan", "false");
          }
          console.log("this.subscriptions", this.subscriptions);
        }
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        throw err;
      });
  }

  navigateComponent(to) {
    if (to === "profile") {
      this.router.navigate(["/application/home/parent/my-profile"]);
      this.activeTabId = "profile";
    } else if (to === "businessprofile") {
      this.router.navigate(["/application/home/parent/business-profile"]);
      this.activeTabId = "businessprofile";
    } else if (to === "workspace") {
      this.router.navigate(["/application/home/parent/my-workspace"]);
      this.activeTabId = "workspace";
    } else if (to === "services") {
      this.router.navigate(["/application/home/parent/services"]);
      this.activeTabId = "services";
    } else if (to === "email-notification") {
      this.router.navigate(["/application/home/parent/email-notification"]);
      this.activeTabId = "email-notification";
    } else if (to === "platform-billing") {
      this.router.navigate(["/application/home/parent/platform-billing"]);
      this.activeTabId = "platform-billing";
    } else if (to === "monetization") {
      this.router.navigate(["/application/home/parent/monetization"]);
      this.activeTabId = "monetization";
    } else if (to === "billing") {
      this.router.navigate(["/application/home/parent/billing"]);
      this.activeTabId = "billing";
    }
  }
}
