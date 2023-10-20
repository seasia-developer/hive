import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { APIService } from "../../../../../../services/api.service";
import { HelperService } from "../../../../../../services/helper.service";

@Injectable({
  providedIn: "root",
})
export class BusinessProfileService {
  constructor(
    private http: HttpClient,
    private apiservice: APIService,
    private helperservice: HelperService
  ) {}

  getIndustryList() {
    return this.apiservice.get(`/user/industryList`);
  }

  getBusinessProfileData() {
    return this.apiservice.getWithHeader(`/user/getBusinessProfile`);
  }

  updateBusinessProfileData(data) {
    return this.apiservice.postWithHeader(`/user/updateBusinessProfile`, data);
  }
}
