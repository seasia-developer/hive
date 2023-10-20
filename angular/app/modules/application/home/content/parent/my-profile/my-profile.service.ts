import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { APIService } from "../../../../../../services/api.service";
import { HelperService } from "../../../../../../services/helper.service";

import { Subject } from 'rxjs';
@Injectable({
  providedIn: "root",
})
export class MyProfileService {

  editMarketWorkspace = new Subject();
  constructor(
    private http: HttpClient,
    private apiservice: APIService,
    private helperservice: HelperService
  ) {}

  getIndustryList() {
    return this.apiservice.get(`/user/industryList`);
  }

  getProfileData() {
    return this.apiservice.getWithHeader(`/user/getMyProfile`);
  }

  updateProfileData(data) {
    return this.apiservice.postWithHeader(`/user/updateProfile`, data);
  }
  getMyWorkspaces(data) {
    return this.apiservice.postWithHeader(`/market-workspaces/market-workspaces`,data);
  }
  saveMyWorkspaces(data) {
    return this.apiservice.postWithHeader(`/market-workspaces/save`,data);
  }
  editMyWorkspaces(id,data) {
    return this.apiservice.postWithHeader(`/market-workspaces/${id}/edit`,data);
  }
}
