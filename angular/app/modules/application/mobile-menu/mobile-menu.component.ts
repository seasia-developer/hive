import { Component, OnInit, Renderer2, Input } from "@angular/core";
import { HelperService } from "src/app/services/helper.service";
import { Router, ActivatedRoute } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { Constants } from "../../../constants/constants";
import { APIService, JReponse } from "src/app/services/api.service";
import { HomeService } from "../../application/home/home.service";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { RecordModalComponent } from "../../application/home/application-view/record-modal/record-modal.component";

import { Subject, Subscription } from "rxjs";
import { OrganisationSetupComponent } from "../../application/home/content/organisation-setup/organisation-setup.component";
import { CreateWorkspaceComponent } from "../../application/home/content/create-workspace/create-workspace.component";
import { CreateAppComponent } from "../../application/home/content/create-app/create-app.component";
import { UserManagementComponent } from "../../application/home/content/user-management/user-management.component";
import { OrgLeaveComponent } from "../../application/home/content/org-leave/org-leave.component";
import { OrganisationWorkspaceListComponent } from "../../application/home/content/organisation-workspaceList/organisation-workspaceList.component";
import { SaveWorkspacesComponent } from "../../application/home/content/parent/save-workspaces/save-workspaces.component";
import { AppViewService } from "../home/application-view/application-view.service";
import { FormBuilder, FormControl } from "@angular/forms";
import { SocketService } from 'src/app/services/socketio.service';
import { BusinessProfileService } from "../home/content/parent/business-profile/business-profile.service";
import { MyProfileService } from "../home/content/parent/my-profile/my-profile.service";

@Component({
  selector: "mobile-menu",
  templateUrl: "./mobile-menu.component.html",
  styleUrls: ["./mobile-menu.component.scss"],
})
export class MobileMenuComponent implements OnInit {
  statusArray = [];
  businessName = "";

  titlePosition = "";
  selectedOrganizationLiTag = "";
  displayFlag = false;
  showProfile = false;
  isSuperAdmin = false;
  env = environment;
  isAdd = false;
  isShowOrgs = false;
  showWorkspacesFlag = false;
  orgList = [];
  orgId;
  MEDIA_URL: string;
  selectedOrganization;
  showOrgForApp = false;
  isFirst = false;
  selectedItemId = "";
  workspaceList;
  newOrgOrder = [];
  modalRef: BsModalRef;
  openMenu;
  newWorkspaceOrder = [];
  restrictedDomain;
  isSettingsOpen;
  isMainMenuOpen = false;
  ngUnsubscribe: Subject<any> = new Subject();
  showViewEditMenu = "";
  viewMode = "create";
  currentView: any = {};
  showView = false;
  showViewTypeMenu = false;
  selectedViewType = "";
  appViews: any = {
    team: [],
    private: [],
  };
  appFields = [];
  activateViewSubs: Subscription;
  updateFilterSubs = new Subscription();
  openViewMenuSubs = new Subscription();
  selectedAppId: any;
  hasViews: boolean;
  viewForm: any;
  selectedViewOrder: any = {};
  percentCount: any = 0;
  @Input() userIdFromPostList;
  userIdFromSubscribe;
  userId;
  avatar;
  followType;
  userInfo;
  mediaUrl;
  businessRelationshipStatus;
  sharedRecords: any;
  sharedRecordOrgIds: string[];
  public employeeTab:boolean;

  constructor(
    public helperService: HelperService,
    private router: Router,
    private apiService: APIService,
    public homeService: HomeService,
    private modalService: BsModalService,
    private renderer: Renderer2,
    public appViewService: AppViewService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    public socketService: SocketService,
    private businessProfileService: BusinessProfileService,
    private myProfileService: MyProfileService,
  ) { 
    this.employeeTab = false;
  }

  async ngOnInit() {
    this.mediaUrl = environment.MEDIA_URL;
    const urlSegments = this.activatedRoute.snapshot["_urlSegment"].segments;
    if (urlSegments.length >= 3 && urlSegments[2].path === "app-view") {
      this.showView = true;
    } else {
      this.showView = false;
    }
    this.viewForm = this.fb.group({
      name: new FormControl(""),
    });

    // To close menu on mouse click event outside the menu
    this.renderer.listen("window", "click", (event) => {
      if (
        event.target.id !== "add-org" &&
        event.target.id !== "add-org-plus" &&
        event.target.id !== "add-ws" &&
        event.target.id !== "add-app" &&
        event.target.id !== "org-list" &&
        event.target.id !== "tasks" &&
        event.target.id !== "ws-list" &&
        event.target.id !== "plusIconWorkspaces" &&
        event.target.id !== "plusIconOrgs" &&
        event.target.id !== "showOrgsForWS"
      ) {
        this.isAdd = false;
        this.showWorkspacesFlag = false;
        this.showOrgForApp = false;
        this.isShowOrgs = false;
      }
      if (event.target.id === "plusIconWorkspaces") {
        this.displayFlag = true;
      } else {
        this.displayFlag = false;
      }
      if (event.target.id === "appList") {
        document.getElementById("mobile-menu").classList.value =
          "collapse hide";
      }
      if (event.target.id !== "setting" && event.target.id !== "view-menu") {
        this.openMenu = "";
      }
    });
    this.selectedItemId = this.helperService.getLocalStore("selectedOrgId");
    this.helperService.selectedItemId = this.helperService.getLocalStore(
      "selectedOrgId"
    );
    this.MEDIA_URL = environment.MEDIA_URL;
    this.isFirst = true;
    const userData = this.helperService.getLocalStore("userData");
    if (userData) {


      this.restrictedDomain = userData.restrictedDomain;

      this.userId = userData.owner;
      this.avatar = userData.avatar;
      await this.getBusinessProfileData();
      await this.getProfileData();
      if (userData.avatar && userData.avatar !== "") {
        this.statusArray[0] = true;
      }
      if (this.titlePosition && this.titlePosition !== "") {
        this.statusArray[1] = true;
      }
      if (this.businessName && this.businessName !== "") {
        this.statusArray[2] = true;
      }
      let count = 0;
      this.statusArray.forEach((element) => {
        if (element) {
          count++;
        }
      });
      this.percentCount = ((100 / 3) * count).toFixed(1);
      if (this.userIdFromPostList) {
        this.getUserInfo(this.userIdFromPostList);
      }
      this.helperService.getUserIdForPublicProfile().subscribe((data) => {
        this.userIdFromSubscribe = data;
        const userIds = [...Object.keys(this.helperService.userActiveStatuses)];
        if (!userIds.includes(data)) {
          userIds.push(data);
        }
        this.socketService.getOnlineStatuses(userIds);
        this.getUserInfo(data);
      });

      this.updateFilterSubs = this.appViewService.updateAppFilters.subscribe(
        (data: any) => {
          this.appFields = data.fields;
          // this.groupAppFieldsForOrderMenu();
          this.getViews(data.id);
        }
      );

      this.activateViewSubs = this.appViewService.activateViewAfterRefresh.subscribe(
        async (data: any) => {
          let view =
            this.appViews.private.find((v) => v._id === data.viewId) ||
            this.appViews.team.find((v) => v._id === data.viewId);
          if (!view) {
            await this.getViews(data.appId);
            view =
              this.appViews.private.find((v) => v._id === data.viewId) ||
              this.appViews.team.find((v) => v._id === data.viewId);
          }
          this.appViewService.selectedAppFilters = view.filters;
          this.appViewService.selectedView = view._id;
          this.appViewService.activeView.next(view);
        }
      );

      if (!this.helperService.getLocalStore("sharedRecords")) {
        this.sharedRecords = await this.homeService.getSharedRecords();
        this.sharedRecordOrgIds = Object.keys(this.sharedRecords);
      } else {
        this.sharedRecords = this.helperService.getLocalStore("sharedRecords");
        this.homeService.sharedRecords = this.sharedRecords;
        this.sharedRecordOrgIds = Object.keys(this.sharedRecords);
      }
      if (this.activatedRoute.snapshot.queryParams.guestLogin) {
        if (this.sharedRecordOrgIds.length > 0) {
          await this.getOrgSharedRecords(this.sharedRecordOrgIds[0]);
          this.openRecordModal(this.homeService.orgSharedRecords[0]);
        } else {
          this.homeService.sendSharedWSFlag(true);
        }
      }
    }
  }
  getMessages(user) {
    const isChatOpen = this.helperService.openedChat.find(u => u.id === user.id);
    if (!isChatOpen) {
      this.helperService.selectedRecipient = user.id;
      this.helperService.openedChat.unshift(user);
      this.helperService.showChat.push(user.id);
      this.socketService.getMessages({ recipient: user.id, skip: this.helperService.messages[user.id] ? this.helperService.messages[user.id].length : 0 });
    }
    if (this.helperService.openedChat.length === 1) {
      document.getElementById("mainBody").classList.add("chat-open");
    }
  }
  async getProfileData() {
    await this.myProfileService
      .getProfileData()
      .then((jresponse: JReponse) => {
        if (jresponse) {
          if (jresponse.body.position && jresponse.body.position !== "") {
            this.titlePosition = jresponse.body.position;
          }
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  async getBusinessProfileData() {
    await this.businessProfileService
      .getBusinessProfileData()
      .then((jresponse: JReponse) => {
        this.businessName = jresponse.body.businessName;
      })
      .catch((err: Error) => {
        throw err;
      });
  }
  async getUserInfo(id) {
    await this.apiService
      .getWithHeader(`/user/${id}/getuserInfo`)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.userInfo = jresponse.body;
          this.businessRelationshipStatus = this.userInfo.businessRelation;
          if (this.userInfo.follow) {
            this.followType = "follow";
          } else {
            this.followType = "unfollow";
          }
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }
  goToMyProfile() {
    this.router.navigateByUrl("/application/home/parent/my-profile");
  }

  goToBusinessProfile() {
    this.router.navigateByUrl("/application/home/parent/business-profile");
  }
  toggleMobileMenu() {
    this.isMainMenuOpen = !this.isMainMenuOpen;
  }

  toggleWorkspaceMenu() {
    this.displayFlag = true;
  }

  getOrganizations() {
    this.apiService
      .getWithHeader("organization/getOrganizations")
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.orgList = jresponse.body;
          this.helperService.orgList = this.orgList;
          this.helperService.setLocalStore("organizations", this.orgList);
          if (this.orgList.length > 0) {
            this.helperService.setLocalStore(
              "selectedOrgId",
              this.helperService.orgList[0]._id
            );
            this.helperService.setLocalStore(
              "orgRole",
              this.helperService.orgList[0].role
                ? this.helperService.orgList[0].role
                : ""
            );
            this.helperService.setLocalStore(
              "backgroundColor",
              this.helperService.orgList[0].backrgoundColor
            );
            this.setBackgroundColor(
              this.helperService.orgList[0].backrgoundColor
            );
          }


          this.getWorkspaces(
            this.helperService.getLocalStore("selectedOrgId"),
            this.helperService.getLocalStore("orgRole"),
            this.helperService.getLocalStore("backgroundColor")
          );
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }
  editWorkspace(item) {
    const initialState = {
      selectedOrgId: this.helperService.getLocalStore("selectedOrgId"),
      isEdit: true,
      wsName: item.name,
      wsDescription: item.description,
      wsId: item._id,
    };
    const modalParams = Object.assign(
      {},
      { initialState, class: "small-custom-modal",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
    this.modalRef = this.modalService.show(
      CreateWorkspaceComponent,
      modalParams
    );
  }

  getWorkspaces(orgId, orgRole, orgColor?, type?) {
    if (type && type == "click") {
      this.homeService.activityOrgId = orgId;
      this.homeService.sendOrgIdForPost({ organization_id: orgId });
    }
    this.homeService.toShow = "org";
    this.homeService.applicationList = [];
    if (
      this.router.url.split("?")[0] ===
      "/application/home/app-view/applicationView"
    ) {
      this.router.navigateByUrl("/application/home");
    }
    this.selectedItemId = orgId;
    this.helperService.selectedItemId = orgId;

    this.helperService.selectedItemId = orgId;
    this.helperService.orgRole = orgRole;
    this.homeService.showApps = false;
    this.homeService.orgId = orgId;
    this.helperService.setLocalStore("selectedOrgId", orgId);
    this.helperService.selectedOrgId = orgId;
    if(this.helperService.getLocalStore("orgRole") !== orgRole){
      this.helperService.setLocalStore("orgRole", orgRole);
      this.helperService.orgRole = orgRole;
    }
   
    this.homeService.backgroundColor = orgColor;
    this.setBackgroundColor(orgColor);
    const data1 = {
      orgId,
      orgColor: this.helperService.getLocalStore("backgroundColor"),
    };
    this.homeService.setTempOrgId(data1);
    const data = {
      organization_id: orgId,
    };
    this.apiService
      .postWithHeader("workspace/getWorkspaces", data)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.helperService.setLocalStore("workspaces", "");
          this.homeService.workSpaceList = jresponse.body;
          this.helperService.setLocalStore(
            "workspaces",
            this.homeService.workSpaceList
          );
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  setBackgroundColor(orgColor) {
    if (
      orgColor &&
      orgColor !== undefined &&
      orgColor !== "undefined" &&
      orgColor !== "transparent"
    ) {
      this.helperService.setLocalStore("backgroundColor", orgColor);
      let colorClass = "";
      if (Constants.ORGANIZATION_BG_COLOR.ROW1.includes(orgColor)) {
        colorClass = `bg${
          Constants.ORGANIZATION_BG_COLOR.ROW1.indexOf(orgColor) + 1
          }`;
      } else if (Constants.ORGANIZATION_BG_COLOR.ROW2.includes(orgColor)) {
        colorClass = `bg${
          Constants.ORGANIZATION_BG_COLOR.ROW2.indexOf(orgColor) + 11
          }`;
      } else {
        colorClass = `bg${
          Constants.ORGANIZATION_BG_COLOR.ROW3.indexOf(orgColor) + 21
          }`;
      }
      document.getElementById("mainBody").classList.value = colorClass;
      document.getElementById("mainBody").classList.add("border-none");
    } else {
      this.helperService.setLocalStore("backgroundColor", "transparent");
      document.getElementById("mainBody").classList.value = "";
    }
  }

  showOptions(option) {
    if (option) {
      this.isAdd = false;
    } else {
      this.isAdd = !this.isAdd;
    }
  }

  showOrgs() {
    this.isAdd = true;
    this.isShowOrgs = !this.isShowOrgs;
  }

  goToAddOrg() {
    this.isAdd = false;
    this.modalService.onShown.subscribe((reason: string) => {
      if (document.getElementById("name")) {
        document.getElementById("name").focus();
      }
    });
    const initialState = {
      isNewOrg: true,
    };
    this.homeService.addOrgModalRef = this.modalService.show(
      OrganisationSetupComponent,
      { initialState, class: "small-custom-modal",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
  }

  showAppOrgs() {
    this.showOrgForApp = !this.showOrgForApp;
    this.showWorkspacesFlag = false;
  }

  addWorkSpace(orgId, orgRole, orgColor) {
    this.isAdd = false;
    this.selectedOrganization = orgId;
    this.getWorkspaces(orgId, orgRole, orgColor);
    // this.router.navigateByUrl(`application/home/create-workspace/${orgId}`);
    let initialState = {
      selectedOrgId: orgId,
    };
    this.modalService.onShown.subscribe((reason: string) => {
      if (document.getElementById("wsname")) {
        document.getElementById("wsname").focus();
      }
    });
    const modalParams = Object.assign(
      {},
      { initialState, class: "small-custom-modal",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
    this.modalRef = this.modalService.show(
      CreateWorkspaceComponent,
      modalParams
    );
  }

  addApp(workspaceId) {
    this.isAdd = false;
    let initialState = {
      workspaceId: workspaceId,
    };
    this.modalService.onShown.subscribe((reason: string) => {
      if (document.getElementById("appname")) {
        document.getElementById("appname").focus();
      }
    });
    const modalParams = Object.assign(
      {},
      { initialState, class: "small-custom-modal",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
    this.modalRef = this.modalService.show(CreateAppComponent, modalParams);
  }

  showOrgWorkSpaces(org) {
    this.selectedOrganizationLiTag = org._id;
    const data = {
      organization_id: org._id,
    };
    this.apiService
      .postWithHeader("workspace/getWorkspaces", data)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.workspaceList = jresponse.body;
          this.showWorkspacesFlag = true;
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  toggleMenu(item) {
    if (this.openMenu !== item._id) {
      this.openMenu = item._id;
    } else {
      this.openMenu = "";
    }
  }

  settingsOptions(option) {
    if (option) {
      this.isSettingsOpen = false;
    } else {
      this.isSettingsOpen = !this.isSettingsOpen;
    }
  }

  userManagement() {
    let initialState = {
      IsEmployee: true,
    };
    const modalParams = Object.assign(
      {},
      { initialState, class: "right-custom-popup",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
    this.modalRef = this.modalService.show(
      UserManagementComponent,
      modalParams
    );
  }

  goToEditOrg() {
    let initialState = {
      isEditOrg: true,
      selectedColor: this.homeService.backgroundColor,
    };
    if (
      this.helperService.orgList.find(
        (org) => org._id === this.helperService.selectedItemId
      ).avatar
    ) {
      this.helperService.orgImagePreview =
        environment.MEDIA_URL +
        this.helperService.orgList.find(
          (org) => org._id === this.helperService.selectedItemId
        ).avatar;
    } else {
      this.helperService.orgImagePreview = "";
    }
    this.modalService.onShown.subscribe((reason: string) => {
      if (document.getElementById("name")) {
        document.getElementById("name").focus();
      }
    });
    this.helperService.updateImg = true;
    const modalParams = Object.assign(
      {},
      { initialState, class: "small-custom-modal",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
    this.homeService.addOrgModalRef = this.modalService.show(
      OrganisationSetupComponent,
      modalParams
    );
  }

  goToAddWorkspace() {
    const selectedOrgId = this.helperService.getLocalStore("selectedOrgId");
    let initialState = {
      selectedOrgId: selectedOrgId,
    };
    this.modalService.onShown.subscribe((reason: string) => {
      if (document.getElementById("wsname")) {
        document.getElementById("wsname").focus();
      }
    });
    const modalParams = Object.assign(
      {},
      { initialState, class: "small-custom-modal",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
    this.modalRef = this.modalService.show(
      CreateWorkspaceComponent,
      modalParams
    );
  }

  goToAddApp(workspaceId) {
    let initialState = {
      workspaceId: workspaceId,
    };
    this.modalService.onShown.subscribe((reason: string) => {
      if (document.getElementById("appname")) {
        document.getElementById("appname").focus();
      }
    });
    const modalParams = Object.assign(
      {},
      { initialState, class: "small-custom-modal",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
    this.modalRef = this.modalService.show(CreateAppComponent, modalParams);
  }

  goToUserManagement() {
    this.modalRef = this.modalService.show(UserManagementComponent, {
      class: "right-custom-popup",
      animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true
    });
  }

  goToWorkspaceUserManagement(id) {
    const initialState = {
      IsWorkspaceUserManagement: true,
      wsIdForUM: id,
    };
    const modalParams = Object.assign(
      {},
      { initialState, class: "right-custom-popup",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
    this.modalRef = this.modalService.show(
      UserManagementComponent,
      modalParams
    );
  }

  goToDeleteWorkspace(wsName, wsId) {
    const initialState = {
      isDeleteWorkspace: true,
      deleteWsName: wsName,
      deleteWsId: wsId,
    };
    this.modalRef = this.modalService.show(OrgLeaveComponent, {
      initialState,
      class: "right-custom-popup leave-right-custom-popup",
      animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true
    });
  }

  goToOrgLeave() {
    this.modalRef = this.modalService.show(OrgLeaveComponent, {
      class: "right-custom-popup leave-right-custom-popup",
      animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true
    });
  }

  goToOrgWorkspaces() {
    this.modalRef = this.modalService.show(OrganisationWorkspaceListComponent, {
      class: "right-custom-popup",
      animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true
    });
  }

  getApplications(workspaceId, role, type?) {
    this.homeService.activeWorkspaceId = workspaceId;
    if (type && type == "click") {
      this.homeService.activityWsId = workspaceId;
      this.homeService.activityOrgId = "";
      let data = {
        workspace_id: workspaceId,
      };
      this.homeService.sendOrgIdForPost(data);
    }
    this.homeService.wsRole = role;
    this.apiService
      .post(`/application/getApplications`, {
        workspace_id: workspaceId,
      })
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.homeService.applicationList = jresponse.body;
          if (jresponse.body && jresponse.body.length) {
            this.homeService.showApps = true;
          }
          this.router.navigateByUrl("application/home");
        }
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }

  goToSaveWorkspace(workspace_id) {
    let workspaceList = this.helperService.getLocalStore("workspaces");
    let finalWorkspace = workspaceList.filter((e) => e._id === workspace_id);
    if (finalWorkspace.length > 0) {
      let initialState = {
        workspace: finalWorkspace[0],
      };
      const modalParams = Object.assign(
        {},
        { initialState, class: "big-custom-modal",animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true }
      );
      this.homeService.addWSModalRef = this.modalService.show(
        SaveWorkspacesComponent,
        modalParams
      );
    }
  }

  openOrgCalendar() {
    const selectedOrgId = this.helperService.getLocalStore("selectedOrgId");
    this.router.navigateByUrl(
      `/application/home/calendar?orgId=${selectedOrgId}`
    );
  }

  getViews(id) {
    // this.appViews = {
    //   private: [],
    //   team: [],
    // };
    return new Promise((resolve, reject) => {
      this.appViewService
        .getViews(id)
        .then((jresponse: JReponse) => {
          this.selectedAppId = id;
          const views = { private: [], team: [] };
          if (jresponse.body.length) {
            views[jresponse.body[0].type] = jresponse.body[0].list;
            this.hasViews = true;
            if (jresponse.body[1]) {
              views[jresponse.body[1].type] = jresponse.body[1].list;
            }
            this.appViews = views;
            this.getViewCounts();
            this.appViewService.allViews = this.appViews;
          } else {
            this.appViews = {
              team: [],
              private: [],
            };
          }
          if (this.selectedViewType) {
            this.appViewService.selectedView = this.appViews[
              this.selectedViewType
            ][this.appViews[this.selectedViewType].length - 1]._id;
          }
          this.selectedViewType = "";
          // views.forEach(view => {
          //   (view.type === "team") ? this.appViews.team.push(view) : this.appViews.private.push(view);
          // });
          resolve();
        })
        .catch((err: Error) => {
          reject();
          throw err;
        });
    });
  }

  getViewCounts() {
    if (this.appViews.team) {
      for (const view of this.appViews.team) {
        this.appViewService
          .getViewCounts(this.selectedAppId, view._id)
          .then((jresponse: JReponse) => {
            view.count = jresponse.body.records;
            // if (
            //   this.router.url.split("?")[0] ===
            //   "/application/home/app-view/applicationView/calender-view"
            // ) {
            //   this.appViewService.tempBool = true;
            // }
          })
          .catch((err: Error) => {
            throw err;
          });
      }
    }
    if (this.appViews.private) {
      for (const view of this.appViews.private) {
        this.appViewService
          .getViewCounts(this.selectedAppId, view._id)
          .then((jresponse: JReponse) => {
            view.count = jresponse.body.records;
          })
          .catch((err: Error) => {
            throw err;
          });
      }
    }
  }

  addView() {
    if (this.viewMode === "edit") {
      this.currentView.name = this.viewForm.controls.name.value;
      this.appViewService
        .editView(this.currentView._id, this.currentView)
        .then((jresponse: JReponse) => {
          this.getViews(this.selectedAppId);
          // this.openCreateViewMenu = false;
          this.appViewService.showCreateViewMenu = false;
        })
        .catch((err: Error) => {
          throw err;
        });
    } else {
      let filters = JSON.parse(
        JSON.stringify(this.appViewService.selectedAppFilters)
      );
      filters = filters.map((filter) => {
        if (filter.type === "member") {
          filter.value = filter.value.map((member) => member._id);
        }
        if (filter.id === "createdBy") {
          filter.type = "createdby";
        }
        return filter;
      });
      if (!this.selectedViewType) {
        this.selectedViewType = "private";
      }
      const data = {
        name: this.viewForm.controls.name.value,
        type: this.selectedViewType,
        application_id: this.appViewService.selectedAppId,
        filters,
      };
      this.appViewService
        .addView(data)
        .then((jresponse: JReponse) => {
          this.getViews(this.selectedAppId);
          this.viewForm.reset();
          this.selectedViewType = "";
          this.appViewService.isViewUnsaved = false;
          // this.openCreateViewMenu = false;
          this.appViewService.showCreateViewMenu = false;
        })
        .catch((err: Error) => {
          throw err;
        });
    }
  }

  selectView(view) {
    this.appViewService.isViewUnsaved = false;
    if (!this.router.url.includes("viewId")) {
      this.router.navigateByUrl(`${this.router.url}&viewId=${view._id}`);
    } else {
      const url = this.router.url.substring(
        0,
        this.router.url.lastIndexOf("=")
      );
      this.router.navigateByUrl(`${url}=${view._id}`);
    }
    this.appViewService.selectedAppFilters = view.filters;
    this.appViewService.activeView.next(view);
    this.appViewService.selectedView = view._id;
  }

  updateViewFilters() {
    this.appViewService.showCreateViewMenu = true;
    // let data = this.appViews.private.find(
    //   (view) => view._id === this.appViewService.selectedView
    // );
    // if (!data) {
    //   data = this.appViews.team.find(
    //     (view) => view._id === this.appViewService.selectedView
    //   );
    // }
    // let filters = JSON.parse(
    //   JSON.stringify(this.appViewService.selectedAppFilters)
    // );
    // filters = filters.map((filter) => {
    //   if (filter.type === "member") {
    //     filter.value = filter.value.map((member) => member._id);
    //   }
    //   if (filter.id === "createdBy") {
    //     filter.type = "createdby";
    //   }
    //   return filter;
    // });
    // data.filters = filters;
    // this.appViewService
    //   .editView(this.appViewService.selectedView, data)
    //   .then((jresponse: JReponse) => {
    //     this.getViews(this.selectedAppId);
    //     this.appViewService.activeView.next(data);
    //     this.appViewService.isViewUnsaved = false;
    //   })
    //   .catch((err: Error) => {
    //     throw err;
    //   });
  }

  toggleViewMenu(view) {
    if (this.showViewEditMenu !== view._id) {
      this.showViewEditMenu = view._id;
    } else {
      this.showViewEditMenu = "";
    }
  }

  deleteView(view) {
    if (
      !this.appViewService.selectedView ||
      this.appViewService.selectedView === view._id
    ) {
      this.appViewService.selectedView = "";
      this.appViewService.selectedAppFilters = [];
    }
    this.showViewEditMenu = "";
    this.appViewService
      .deleteView(view._id)
      .then((jresponse: JReponse) => {
        this.getViews(this.selectedAppId);
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  editView(view, type) {
    this.showViewEditMenu = "";
    view.type = type;
    this.appViewService
      .editView(view._id, view)
      .then((jresponse: JReponse) => {
        this.getViews(this.selectedAppId);
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  createViewMenu() {
    // this.openCreateViewMenu = true;
    this.appViewService.showCreateViewMenu = true;
    this.viewMode = "create";
    this.viewForm.reset();
  }

  openEditViewMenu(view) {
    this.showViewEditMenu = "";
    this.viewMode = "edit";
    // this.openCreateViewMenu = true;
    this.appViewService.showCreateViewMenu = true;
    this.viewForm.controls.name.setValue(view.name);
    this.viewForm.updateValueAndValidity();
    this.currentView = view;
  }
  getOrgSharedRecords(id) {
    this.helperService.selectedItemId = id;
    this.homeService.toShow = "sharedRecord";
    let records = this.homeService.sharedRecords[id];
    records = records.map((record) => {
      const title = record.data.find((field) => field.value.text);
      record.title = title ? title.value.text : "Shared Record";
      return record;
    });
    this.homeService.orgSharedRecords = records;
  }
  openRecordModal(recordData) {
    const initialState = { recordData };
    this.homeService.recordModalRef = this.modalService.show(
      RecordModalComponent,
      { initialState, class: "modal-lg",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
  }

  matchAdminAndAuthDomain() {
    const AdminDomain = this.helperService.getLocalStore("storeAdminDomain");
    const AdminDomainEmail = this.helperService.getLocalStore("storeAdminDomainEmail");
    const AuthUserUser = this.helperService.getLocalStore("userData");
    const AuthUserEmail = AuthUserUser.email;
    const AuthUserDomain = AuthUserEmail.substring(AuthUserEmail.lastIndexOf("@") + 1);
    if(AdminDomain === AuthUserDomain || AdminDomainEmail === AuthUserEmail){
      this.employeeTab = true;
    }
    if(AdminDomain !== AuthUserDomain){
      this.employeeTab = false;
    }
    // console.log('AdminDomainEmail--------',AdminDomainEmail)
    // console.log('AuthUserEmail=======',AuthUserEmail)
    // console.log('AdminDomain',AdminDomain)
    // console.log('AuthUserDomain',AuthUserDomain)
  }

  ngAfterContentInit(){
    this.matchAdminAndAuthDomain();
  }

  ngDoCheck(){
    this.matchAdminAndAuthDomain();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.updateFilterSubs.unsubscribe();
    this.openViewMenuSubs.unsubscribe();
  }
}
