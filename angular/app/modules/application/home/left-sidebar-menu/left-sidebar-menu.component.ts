import { Component, OnInit, Input } from '@angular/core';
import { HelperService } from "src/app/services/helper.service";
import { SharedOnboardingService } from "src/app/modules/onboarding/shared-onboarding.service";
import { JReponse } from "src/app/services/api.service";

@Component({
  selector: 'app-left-sidebar-menu',
  templateUrl: './left-sidebar-menu.component.html',
  styleUrls: ['./left-sidebar-menu.component.scss']
})
export class LeftSidebarMenuComponent implements OnInit {

  @Input() loaderState = 'stop';

  constructor(
    public helperService: HelperService,
    private sharedOnboardingService: SharedOnboardingService
  ) {}

  ngOnInit() {
    setInterval(()=>{
      if(this.helperService.getLocalStore("isCouponApplied")){
        if(this.helperService.getLocalStore("selectedOrgId")){
          this.helperService.setLocalStore("isCouponApplied", false);
          this.consumelifetimeCoupon();
          clearInterval();
        }
      }
    },5000);
}

  consumelifetimeCoupon() {
    const userId = this.helperService.getLocalStore("userData").owner;
    const couponCode = this.helperService.getLocalStore("couponData");
    const organization_id = this.helperService.getLocalStore("selectedOrgId");
    let data = {};
    data['couponCode'] =  couponCode;
    data['userId'] =  userId;
    data['organization_id'] =  organization_id;
    this.sharedOnboardingService.consumelifetimeCoupon(data)
      .then((jresponse: JReponse) => {
        this.helperService.setLocalStore("isCouponApplied", false);
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  onClickOrgIconEventHander($event: any) {
    this.loaderState = $event;
  }

}
