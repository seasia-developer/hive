import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";

import { APIService, JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { environment } from "src/environments/environment";
@Injectable({
  providedIn: 'root'
})
export class SharedOnboardingService {
  constructor(
    private apiService: APIService,
    private helperService: HelperService
  ) {}

  getValidateLifetimeCoupon(coupon) {
    return this.apiService.get(`/user/${coupon}/validateLifetimeCoupon`);
  }

  consumelifetimeCoupon(data) {
    return this.apiService.postWithHeader(`/user/consumelifetimeCoupon`, data);
  }
}
