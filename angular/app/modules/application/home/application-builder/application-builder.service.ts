import { Injectable } from '@angular/core';
import { APIService } from '../../../../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class AppBuilderService {

  constructor(
    private apiservice: APIService,
  ) { }

  createAppBuilder(data) {
    return this.apiservice.postWithHeader(`/application/addApplicationBuilder`, data);
  }

  getFields(appId) {
    return this.apiservice.getWithHeader(`/record/${appId}/fields`);
  }
  getAppList(orgId, keyword) {
    return this.apiservice.getWithHeader(`/application/${orgId}/application-list${keyword}`);
  }
  getWsList(keyword) {
    return this.apiservice.getWithHeader(`/record/workspaceList${keyword}`);
  }
  getViewList(appId) {
    return this.apiservice.get(`/view/${appId}/views`);

  }
  getAppDetail(appId) {
    return this.apiservice.getWithHeader(`/application/${appId}/detail`);

  }
  removeAppFromField(data) {
    return this.apiservice.postWithHeader(`/record/removeAppField`, data);
  }
  getAppRelationRecords(data){
    return this.apiservice.postWithHeader(`/record/getFieldRecords`, data);
  }
}
