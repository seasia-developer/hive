import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";

import { APIService, JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class HomeService {
  orgId;
  addOrgModalRef: BsModalRef;
  uploadModalRef: BsModalRef | null;
  recordModalRef: BsModalRef;
  addWSModalRef: BsModalRef;
  uploadWSModalRef: BsModalRef | null;
  workSpaceList;
  applicationList = [];
  backgroundColor;
  activeWorkspaceId;
  wsRole;
  showApps = false;
  sharedRecords = [];
  toShow = "org";
  private data = new BehaviorSubject(null);
  taskImages = new Subject();
  postImages = new Subject();
  commentImages = new Subject();

  tempOrgId = this.data.asObservable();
  firstOrgId = this.data.asObservable();
  orgSharedRecords: any;
  myWorkspaces = [];
  activityOrgId;
  activityWsId;
  activeWorkspace:any = {};
  private subjectForSharedWS = new Subject<any>();
  private subjectForPost = new Subject<any>();
  private subjectForChangeAppId = new Subject<any>();
  private subjectForOrgId = new Subject<any>();

  plans: { monthly: { pro: {}; plus: {} }; yearly: { pro: {}; plus: {} } };

  constructor(
    private apiService: APIService,
    private helperService: HelperService
  ) {}

  sendFlagForOrgId(data) {
    this.subjectForOrgId.next(data);
  }

  getFlagForOrgId() {
    return this.subjectForOrgId.asObservable();
  }

  sendAppIdForMarketPlcae(data) {
    this.subjectForChangeAppId.next(data);
  }

  getAppIdForMarketPlcae() {
    return this.subjectForChangeAppId.asObservable();
  }

  sendSharedWSFlag(data) {
    this.subjectForSharedWS.next(data);
  }

  getSharedWSFlag() {
    return this.subjectForSharedWS.asObservable();
  }

  setOrgId(data) {
    this.data.next(data);
  }

  setTempOrgId(data) {
    this.data.next(data);
  }
  sendOrgIdForPost(data) {
    this.subjectForPost.next(data);
  }
  getPostFlag() {
    return this.subjectForPost.asObservable();
  }
  async getSharedRecords(id = "") {
    return new Promise((resolve, reject) => {
      this.apiService
        .getWithHeader("record/sharedOrganization")
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.sharedRecords = jresponse.body;
            this.helperService.setLocalStore(
              "sharedRecords",
              this.sharedRecords
            );
            if (id) {
              Object.values(this.sharedRecords).forEach((orgs) => {
                const org = orgs.find((org) => org.record.record_id._id === id);
                if (org) {
                  orgs = orgs.map((record) => {
                    const title = record.data.find((field) => field.value.text);
                    record.title = title ? title.value.text : "Shared Record";
                    return record;
                  });
                  this.orgSharedRecords = orgs;
                }
              });
            }
            resolve(this.sharedRecords);
          }
        })
        .catch((err: any) => {
          reject();
          throw err;
        });
    });
  }

  getApps(workspaceId) {
    return this.apiService.post(`/application/getApplications`, {
      workspace_id: workspaceId,
    });
  }

  getOrgWsList() {
    return this.apiService.getWithHeader(`/organization/getAllOrganization`);
  }

  getOrgWsListWithRole() {
    return this.apiService.getWithHeader(`/organization/getAllOrganizationWithWorkspace`);
  }

  cloneWorkspaceByName(data) {
    return this.apiService.postWithHeader(
      "/market-workspaces/clone-workspace-by-name",
      data
    );
  }

  cloneWorkspaceById(data) {
    return this.apiService.postWithHeader(
      "/market-workspaces/clone-workspace-by-choose-option",
      data
    );
  }

  refreshApps(workspaceId, role) {
    return new Promise((resolve, reject) => {
      this.getApps(workspaceId)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.applicationList = jresponse.body;
            resolve();
          }
        })
        .catch((err: Error) => {
          reject();
          throw err;
        });
    });
  }

  getWs(data) {
    return this.apiService.postWithHeader(
      `/market-workspaces/market-workspaces`,
      data
    );
  }

  getMyWorkspaces(userId) {
    this.getWs({ owner: userId, format: "all", type: "profile" })
      .then((jresponse: JReponse) => {
        if (jresponse) {
          let result;
          let workspaces = jresponse.body.workspaces;
          let cloneWorkspaces = jresponse.body.mappedWorkspaces;
          if (cloneWorkspaces && cloneWorkspaces.length > 0) {
            result = workspaces.filter(function (o1) {
              return !cloneWorkspaces.some(function (o2) {
                return o1._id === o2; // return the ones with equal id
              });
            });
          } else {
            result = workspaces;
          }
          this.myWorkspaces = result;
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  getNotifications(skipCount,type) {
    return this.apiService.getWithHeader(`/user/notifications?type=${type}&skip=${skipCount}`);
  }

  getNotificationCount() {
    return this.apiService.getWithHeader(`/user/notificationsCount`);
  }

  getPlans() {
    return this.apiService.getWithHeader(`/user/getStripePlans`);
  }

  getCouponAvailability(data) {
    return this.apiService.postWithHeader(`/user/checkCouponAvailability`, data);
  }

  addBillingInfo(data) {
    return this.apiService.postWithHeader(`/user/addBillingInfo`, data);
  }

  updateStarNotifications(data) {
    return this.apiService.postWithHeader(
      `/user/notifications/updateStar`,
      data
    );
  }

  updateViewedNotifications(data) {
    return this.apiService.postWithHeader(`/user/notifications/is-read`, data);
  }

  getCategory() {
    return this.apiService.get(`/user/categoryList`);
  }
  getMarketWorkspace(data) {
    return this.apiService.postWithHeader(
      `/market-workspaces/market-workspaces`,
      data
    );
  }
  getWpMarketWorkspace(data) {
    return this.apiService.post(
      `/market-workspaces/wp-market-workspaces`,
      data
    );
  }
  getMarketWorkspacesDetail(id, isPublic = false) {
   
    return isPublic ? this.apiService.get(`/market-workspaces/${id}/publicDetail`):
     this.apiService.getWithHeader(`/market-workspaces/${id}/detail`);
  }

  addComment(data) {
    return this.apiService.postWithHeader(
      `/market-workspaces/add/comment`,
      data
    );
  }

  getAllComment(id) {
    return this.apiService.get(`/market-workspaces/getAllComment/${id}`);
  }

  addRatingOnMarketPlace(id, data) {
    return this.apiService.postWithHeader(
      `/market-workspaces/add-rating-on-market-place/${id}`,
      data
    );
  }

  overallRatingMarketPlace(id) {
    return this.apiService.get(`/market-workspaces/overallRating/${id}`);
  }

  getOrgProfile(id) {
    return this.apiService.get(`/organization/getOrgProfile/${id}`);
  }

  addFollowing(data) {
    return this.apiService.postWithHeader(`/market-workspaces/followOrg`, data);
  }

  getFollowingUser(data) {
    return this.apiService.postWithHeader(
      `/market-workspaces/getFollowOrg`,
      data
    );
  }
  orgBannerChange(data) {
    return this.apiService.postWithHeader(`organization/orgBannerIng`, data);
  }
  getOrgDetail(id) {
    return this.apiService.getWithHeader(
      `/organization/${id}/getOrgDetail`
    );
  }

  gets3Attachment(data) {
    return this.apiService.postWithHeaderAndUrl(`${environment.DOWNLOAD_MEDIA_URL}/download`, data);
  }

  getWorkspaces(query:any) {
    return this.apiService.getWithHeader(`/organization/getAllWorkspaces?search=${query}`);
  }

  storePaidWorkspaces(data:any) {
    return this.apiService.postWithHeader(`/organization/storePaidWorkspaces`,data);
  }

  getStripeConnection() {
    return this.apiService.getWithHeader(`/user/stripe/connection`);
  }

  connectStripe(data:any){
    return this.apiService.postWithHeader(`/user/stripe/connect`,data);
    // return this.apiService.postWithAuthHeader(URL,data,authToken);
  }

  resetStripeConnection() {
    return this.apiService.getWithHeader(`/user/stripe/connection/reset`);
  }

  getPaidGroups() {
    return this.apiService.getWithHeader(`/workspace/getPaidWorkspaces`);
  }
  
  getPaidGroup(groupId:any) {
    return this.apiService.getWithHeader(`/workspace/getPaidWorkspace/${groupId}`);
  }

  deletePaidGroup(groupId:any) {
    return this.apiService.getWithHeader(`/workspace/deletePaidWorkspaces/${groupId}`);
  }

  getPlatformSubscriptions() {
    return this.apiService.getWithHeader(`/subscriptions/platform`);
  }
  
  cancelSubscription(subscriptionId:any) {
    return this.apiService.getWithHeader(`/subscriptions/platform/cancel/${subscriptionId}`);
  }
  
}
