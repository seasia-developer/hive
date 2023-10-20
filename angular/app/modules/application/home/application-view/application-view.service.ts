import { Injectable } from "@angular/core";
import { APIService, JReponse } from "../../../../services/api.service";
import { Subject } from "rxjs";
import { HelperService } from "src/app/services/helper.service";
@Injectable({
  providedIn: "root",
})
export class AppViewService {
  workspaceAppsList = [];
  selectedAppTab: number;
  activeAppId = new Subject();
  rowOption = new Subject();
  columnOption = new Subject();
  newCategoryRecord = new Subject();
  newCategoryMemberRecord = new Subject();
  editCategoryRecord = new Subject();
  editCalendarRecord = new Subject();
  addCalendarRecord = new Subject();
  changeApplication = new Subject();
  refreshAppFields = new Subject();
  openViewMenu = new Subject();
  showViewMenu = false;
  showCreateViewMenu = false;
  hasCategoryField: boolean;
  displayColumnOption: any;
  displayRowOption: any;
  apiCalled = false;
  members = [];
  wsMembers = [];
  activeApp: any;
  activeAppRecords = [];
  selectedLayoutOptions: any = [{}, {}, {}];
  private subjectForCalendar = new Subject<any>();
  private subjectForChangeAppId = new Subject<any>();
  private subjectForChangeWsIdForContributedWS = new Subject<any>();
  deleteCalendarRecord = new Subject();
  refreshAfterDelete = new Subject();
  uploadedImages = new Subject();
  updateAppFilters = new Subject();
  activateViewAfterRefresh = new Subject();
  applyFiltersInCalendar = new Subject();
  updateCalendarView = new Subject();
  activeView = new Subject();
  selectedAppFilters = [];
  selectedAppId = "";
  isViewUnsaved = false;
  selectedView = "";
  allViews: { team: any[]; private: any[] };
  marketInfo;
  private subjectForComment = new Subject<any>();
  private subjectForRecordComment = new Subject<any>();
  private subjectForMention= new Subject<any>();
  private subjectForRecordMention= new Subject<any>();

  // selectedAppFilters = new Subject();
  // currentAppId = "";
  // tempBool = false;

  constructor(
    private apiservice: APIService,
    private helperService: HelperService
  ) {}

  sendAppId(data) {
    this.subjectForChangeAppId.next(data);
  }

  getAppId() {
    return this.subjectForChangeAppId.asObservable();
  }

  sendWorkspaceIdForContributedWS(data, flagForContributed: boolean) {
    const obj = {
      data,
      flagForContributed,
    };
    this.subjectForChangeWsIdForContributedWS.next(obj);
  }

  getWorkspaceIdForContributedWS() {
    return this.subjectForChangeWsIdForContributedWS.asObservable();
  }

  sendCalendarData(data) {
    this.subjectForCalendar.next(data);
  }
  sendCommentData(data) {
    this.subjectForComment.next(data);
  }
  getCommentFlag() {
    return this.subjectForComment.asObservable();
  }
  sendRecordCommentData(data) {
    this.subjectForRecordComment.next(data);
  }
  getRecordCommentFlag() {
    return this.subjectForRecordComment.asObservable();
  }
  sendMentionData(data) {
    this.subjectForMention.next(data);
  }
  sendRecordMentionData(data){
    this.subjectForRecordMention.next(data);
  }
  getRecordMentionFlag() {
    return this.subjectForRecordMention.asObservable();
  }
  getMentionFlag() {
    return this.subjectForMention.asObservable();
  }
  getCalendarData() {
    return this.subjectForCalendar.asObservable();
  }

  refreshAppRecords(appId) {
    return new Promise((resolve, reject) => {
      this.getAppRecords(appId)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.activeAppRecords = jresponse.body;
            resolve();
          }
        })
        .catch((err: Error) => {
          reject();
          throw err;
        });
    });
  }

  refreshApps(workspaceId, role) {
    return new Promise((resolve, reject) => {
      this.getApps(workspaceId)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.workspaceAppsList = jresponse.body;
            resolve();
          }
        })
        .catch((err: Error) => {
          reject();
          throw err;
        });
    });
  }

  setField(data) {
    return this.apiservice.postWithHeader(`/record/editRecord`, data);
  }

  deleteAttachment(data) {
    return this.apiservice.postWithHeader(
      `/record/deleteRecordAttachment`,
      data
    );
  }

  getRecordId(data, removeHeader = false) {
    if (removeHeader) {
      return this.apiservice.post(`/record/addRecord`, data);
    }
    return this.apiservice.postWithHeader(`/record/addRecord`, data);
  }

  getFields(appId, removeHeader = false) {
    if (removeHeader) {
      return this.apiservice.get(`/record/${appId}/fields`);
    }
    return this.apiservice.get(`/record/${appId}/fields`);
  }

  getApps(workspaceId) {
    return this.apiservice.post(`/application/getApplications`, {
      workspace_id: workspaceId,
    });
  }
  changeAppOrder(data) {
    return this.apiservice.postWithHeader(`/application/changeOrder`, data);
  }
  getMembers(orgId, keyword = "", removeHeader = false) {
    let url = `/organization/${orgId}/members`;
    if (keyword) {
      url += `?name=${keyword}`;
    }
    if (removeHeader) {
      return this.apiservice.get(url);
    }
    return this.apiservice.get(url);
  }

  getLinkPreview(url, removeHeader = false) {
    if (removeHeader) {
      return this.apiservice.post(`/record/previewLink`, { url });
    }
    return this.apiservice.postWithHeader(`/record/previewLink`, { url });
  }

   getPreviewLink(url) {
    return this.apiservice.post(`/record/linkPreview`, { url });
  }

  getAppRecords(appId, additional = "", view: any = {}, applyFilters = false) {
    this.marketInfo = this.helperService.getLocalStore("wpMarket");
    let url = `/record/getRecords/${appId}?${additional}`;
    if (view._id) {
      url += `view=${view._id}`;
    }
    let filters = JSON.parse(JSON.stringify(this.selectedAppFilters));
    filters = filters.map((filter) => {
      if (filter.type === "member") {
        filter.value = filter.value.map((member) => member._id);
      }
      if (filter.id === "createdBy") {
        filter.type = "createdby";
      }
      return filter;
    });
    const data: any = { appId };
    data.filters = filters;
    // if (applyFilters && this.selectedAppFilters.length) {
    // }
    if (this.marketInfo && this.marketInfo.marketAuth === false) {
      return this.apiservice.post(
        `/record/getWpRecords/${appId}?${additional}`,
        data
      );
    } else {
      return this.apiservice.postWithHeader(url, data);
    }
  }

  addComment(data) {
    return this.apiservice.postWithHeader(`/record/addRecordComment`, data);
  }

  getCalendar(workspaceId) {
    return this.apiservice.getWithHeader(
      `/application/getCalender/${workspaceId}`
    );
  }

  getCalendarEvents(data) {
    return this.apiservice.postWithHeader(`/home/getCalenderDetail`, data);
  }

  getOrgCalendar(orgId) {
    return this.apiservice.getWithHeader(
      `/application/getOrgCalender/${orgId}`
    );
  }

  getUserCalendar() {
    return this.apiservice.getWithHeader(`/application/getUserCalender`);
  }

  getComments(appId) {
    return this.apiservice.getWithHeader(`/record/${appId}/comments`);
  }

  getActivities(workspaceId, appId, recordId) {
    return this.apiservice.getWithHeader(
      `/record/activity/${workspaceId}/${appId}/${recordId}`
    );
  }

  deleteRecord(recordId) {
    return this.apiservice.deleteWithHeader(`/record/${recordId}`);
  }

  getGeoCode(keyword, removeHeader = false) {
    if (removeHeader) {
      return this.apiservice.get(`/record/location/geoCode?keyword=${keyword}`);
    }
    return this.apiservice.getWithHeader(
      `/record/location/geoCode?keyword=${keyword}`
    );
  }

  getMap(coordinate, removeHeader = false) {
    if (removeHeader) {
      return this.apiservice.get(
        `/record/location/map?latitude=${coordinate.latitude}&longitude=${coordinate.longitude}`
      );
    }
    return this.apiservice.getWithHeader(
      `/record/location/map?latitude=${coordinate.latitude}&longitude=${coordinate.longitude}`
    );
  }

  updateSortingOrder(data) {
    return this.apiservice.postWithHeader(`/record/editRecordFilter`, data);
  }

  updateAppView(data) {
    return this.apiservice.postWithHeader(`/application/editApplication`, data);
  }

  getUsers(orgId, name) {
    return this.apiservice.get(`organization/${orgId}/members?name=${name}`);
  }

  shareRecord(data) {
    return this.apiservice.postWithHeader(`/record/shareRecord`, data);
  }

  workspaceInvitation(data) {
    return this.apiservice.postWithHeader(`workspace/assign-users`, data);
  }

  appRecordComments(id) {
    return this.apiservice.getWithHeader(`record/${id}/appComment`);
  }

  deleteApp(appId) {
    return this.apiservice.deleteWithHeader(`/application/${appId}`);
  }

  deleteWorkspace(wsId) {
    return this.apiservice.deleteWithHeader(`/workspace/${wsId}`);
  }

  leaveWorkspace(wsId) {
    return this.apiservice.deleteWithHeader(`/workspace/leave/${wsId}`);
  }

  mentionUserForComment(wsId: string, keyword: string) {
    return this.apiservice.getWithHeader(
      `workspace/${wsId}/organization-users?keyword=${keyword}`
    );
  }

  getLocationsForFilter(appId, type) {
    return this.apiservice.getWithHeader(
      `record/${appId}/location?type=${type}`
    );
  }

  getViews(appId) {
    return this.apiservice.get(`view/${appId}/views`);
  }

  getViewCounts(appId, viewId) {
    return this.apiservice.get(`view/${appId}/${viewId}/recordCount`);
  }

  addView(data) {
    return this.apiservice.postWithHeader(`view/addView`, data);
  }

  editView(id, data) {
    return this.apiservice.postWithHeader(`view/${id}/editView`, data);
  }

  deleteView(id) {
    return this.apiservice.deleteWithHeader(`view/${id}`);
  }
  searchResult(skipCount, keyword) {
    return this.apiservice.getWithHeader(
      `user/search?keyword=${keyword}&skip=${skipCount}`
    );
  }
  getAppList(data, query) {
    return this.apiservice.postWithHeader(
      `/application/applications${query}`,
      data
    );
  }
  createAppBuilder(data) {
    return this.apiservice.postWithHeader(
      `/application/addApplicationBuilder`,
      data
    );
  }

  getRecordData(data) {
    return this.apiservice.postWithHeader(`/record/getRelationRecords`, data);
  }
  getAppRelationRecords(data) {
    return this.apiservice.postWithHeader(`/record/getFieldRecords`, data);
  }
  getAllActivities(data) {
    return this.apiservice.getWithHeader(
      `/home/getActivities?organization_id=${data.organization_id}&workspace_id=${data.workspace_id}&skip=${data.skip}&user_id=${data.user_id}&is_search=${data.user_id !== '' && data.workspace_id  === '' ? 'true' : ''}`
    );
  }
  getSubActivities(skip, id) {
    return this.apiservice.getWithHeader(
      `/home/${id}/getSubActivity?skip=${skip}`
    );
  }
  getMoreComments(skip, limit, id,record_id) {
    return this.apiservice.getWithHeader(
      `/home/${id}/getAllComments?skip=${skip}&limit=${limit}&record_id=${record_id}`
    );
  }
  addPost(data) {
    return this.apiservice.postWithHeader(`/home/addPost`, data);
  }
  editPost(id, data) {
    return this.apiservice.postWithHeader(`/home/${id}/editPost`, data);
  }
  getMentionUsers() {
    return this.apiservice.getWithHeader(`/user/getUsers`);
  }
  getAllMembersEmployeesOfOrgsAndWS() {
    return this.apiservice.getWithHeader(`/organization/getAllMembersEmployeesOfOrgsAndWS`);
  }
  getAllMembersEmployeesOfOrgAndWS(orgId) {
    return this.apiservice.getWithHeader(`/organization//${orgId}/getAllMembersEmployeesOfOrgAndWS`);
  }
  getAllMembersOfWS(WsId) {
    return this.apiservice.getWithHeader(`/organization//${WsId}/getAllMembersOfWS`);
  }
  deletePost(postId) {
    return this.apiservice.deleteWithHeader(`/home/${postId}/deletePost`);
  }
  deleteSharedPost(postId) {
    return this.apiservice.deleteWithHeader(`/home/${postId}/deleteSharedPost`);
  }
  addActivityComment(data) {
    return this.apiservice.postWithHeader(`/home/addActivityComment`, data);
  }
  editActivityComment(id, data) {
    return this.apiservice.postWithHeader(`/home/${id}/editComment`, data);
  }
  getSubComments(id) {
    return this.apiservice.getWithHeader(`/home/${id}/getCommentDetail`);
  }
  getOrgPlan(orgId) {
    return this.apiservice.getWithHeader(`/user/${orgId}/plan`);
  } 
  addLikes(id) {
    return this.apiservice.getWithHeader(`/home/${id}/likes`);
  }
  addCommentLikes(id) {
    return this.apiservice.getWithHeader(`/home/${id}/commentLikes`);
  }
  getComment(id) {
    return this.apiservice.getWithHeader(`/home/${id}/getComment`);
  }
  deleteComment(id) {
    return this.apiservice.deleteWithHeader(`/home/${id}/deleteComment`);
  }
  getSingleRecord(id) {
    return this.apiservice.getWithHeader(`/application/getSingleRecord/${id}`);
  }
  sharePost(data) {
    return this.apiservice.postWithHeader(`/home/sharePost`, data);
  }
}
