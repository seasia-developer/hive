import { Component, OnInit } from "@angular/core";
import { IDropdownSettings } from "../../../../../node_modules/ng-multiselect-dropdown";
import { CommonService } from "src/app/services/common.service";
import { JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { Router } from "@angular/router";
import { SharedOnboardingService } from "../../onboarding/shared-onboarding.service";

@Component({
  selector: "app-category",
  templateUrl: "./category.component.html",
  styleUrls: ["./category.component.scss"],
})
export class CategoryComponent implements OnInit {
  industryData: any = [];
  category: any;
  isCategory = false;
  marketInfo;
  UserId;
  couponData;
  constructor(
    private common: CommonService,
    private helper: HelperService,
    private helperService: HelperService,
    private router: Router,
    private sharedOnboardingService: SharedOnboardingService
  ) {
    this.getCategoryList();
  }

  dropdownList = [];
  selectedItems = [];
  dropdownSettings: IDropdownSettings = {};
  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: true,
      idField: "item_id",
      textField: "item_text",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      itemsShowLimit: 3,
      allowSearchFilter: false,
    };
    this.marketInfo = this.helperService.getLocalStore("wpMarket");
  }
  onItemSelect(item: any) {}
  onSelectAll(items: any) {}
  getCategoryList() {
    this.common
      .categoriesList()
      .then((res: JReponse) => {
        this.industryData = res.body;
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  onCategory(event) {
    this.category = event;
    this.isCategory = false;
  }

  postOnboardingData() {
    if (this.category) {
      this.isCategory = false;
      const userType = this.helper.getLocalStore("userType");
      const onboardingData = this.helper.getLocalStore("onboardingData");
      const logo = this.helper.onboardingImg;
      const formData = new FormData();
      const userData = this.helper.loggedUser;
      formData.append("name", onboardingData.name);
      formData.append("type", userType);
      formData.append("size", onboardingData.size);
      formData.append("industryId", onboardingData.industry);
      formData.append("categoryId", this.category);
      if (logo) {
        formData.append("avatar", logo);
      }
      const token = this.helper.loggedUser.token;
      this.common
        .addOnboardingData(formData)
        .then((res: JReponse) => {
          userData.onboarding = true;
          this.helper.setLocalStore("userData", userData);
          this.helperService.notificationCount = 1;
          this.helperService.setLocalStore(
            "notificationCount",
            this.helperService.notificationCount
          );
          this.helper.showSuccessToast(res.message);
          this.helper.clearStorageFor("userType");
          this.helper.clearStorageFor("onboardingData");
          this.helper.clearStorageFor("image");
          if (this.marketInfo && this.marketInfo.marketId) {
            this.router.navigateByUrl(`application/home/market-detail?marketId=${this.marketInfo.marketId}&auth=true`)
          } else {
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
          this.helper.showErrorToast(err.message);
          throw err;
        });
    } else {
      this.isCategory = true;
    }
  }

}
