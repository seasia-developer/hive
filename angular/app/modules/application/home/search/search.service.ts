import { Injectable } from "@angular/core";
import { APIService } from "src/app/services/api.service";
import { Subject } from 'rxjs';

@Injectable({
  providedIn: "root",
})
export class SearchService {
  loadMoreData = new Subject();

  constructor(
    private apiService: APIService
  ) {}

  getUsers(skipCount, keyword) {
    return this.apiService.getWithHeader(`/user/getUsers?type=people&skip=${skipCount}&keyword=${keyword}`);
  }

  getOrgOptions(keyword) {
    let url = "/organization/getOrganizations?type=organization";
    if (keyword) {
        url += `&name=${keyword}`;
    }
    return this.apiService.getWithHeader(url);
  }

  getOrganizations(skipCount,keyword) {
    return this.apiService.getWithHeader(`user/getSearchOrganizations?skip=${skipCount}&keyword=${keyword}`);
  }

  getIndustries(keyword,skipCount) {
    return this.apiService.getWithHeader(`/user/industry-filter?skip=${skipCount}&keyword=${keyword}`);
  }

  getIndustryFilterOptions() {
    return this.apiService.getWithHeader("/user/industryList");
  }
  
  getOrgIndustryFilterOptions() {
    return this.apiService.getWithHeader("/user/orgindustryList");
  }
  updateSettings(data) {
    return this.apiService.postWithHeader("/user/email-setup", data);
  }

  getLocationOptions(keyword, type = "") {
    let url = `/user/nearBy?type=${type}`;
    if (keyword) {
        url += `&keyword=${keyword}`;
    }
    return this.apiService.getWithHeader(url);
  }
  getPost(skipCount, keyword) {
    return this.apiService.getWithHeader(`/home/getSearchPost?type=post&skip=${skipCount}&keyword=${keyword}`);
  }
}

