import { Injectable } from "@angular/core";
import { APIService } from "./api.service";
import { HelperService } from "./helper.service";

@Injectable({
  providedIn: "root"
})
export class CommonService {
  token: any;
  constructor(public apiService: APIService, private helper: HelperService) {
    this.token = this.helper.getLocalStore("token");
  }

  categoriesList() {
    return this.apiService.get("/user/categoryList");
  }

  industriesList() {
    return this.apiService.get("/user/industryList");
  }

  addOnboardingData(data) {
    return this.apiService.postWithHeader("/organization/onboarding", data);
  }
}
