import { Component, OnInit, OnDestroy, Renderer2, Input  } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormControl, FormBuilder } from "@angular/forms";
import { Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

import { HomeService } from "../../home.service";
import { JReponse, APIService } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { OrganisationSetupComponent } from "../../content/organisation-setup/organisation-setup.component";
import { CreateWorkspaceComponent } from "../../content/create-workspace/create-workspace.component";
import { CreateAppComponent } from "../../content/create-app/create-app.component";
import { UserManagementComponent } from "../../content/user-management/user-management.component";
import { OrgLeaveComponent } from "../../content/org-leave/org-leave.component";
import { OrganisationWorkspaceListComponent } from "../../content/organisation-workspaceList/organisation-workspaceList.component";
import { environment } from "src/environments/environment";
import { RecordModalComponent } from "../../application-view/record-modal/record-modal.component";
import { SaveWorkspacesComponent } from "../../content/parent/save-workspaces/save-workspaces.component";
import { AppViewService } from "../../application-view/application-view.service";
import { Constants } from "src/app/constants/constants";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-organisation-workspaces",
  templateUrl: "./organisation-workspaces.component.html",
  styleUrls: ["./organisation-workspaces.component.scss"],
})
export class OrganisationWorkspacesComponent implements OnInit, OnDestroy {

  @Input() loaderState = 'stop';

  openMenu;
  newWorkspaceOrder = [];
  restrictedDomain;
  isSettingsOpen;
  orgId;
  // openViewMenu = false;
  // openCreateViewMenu = false;
  ngUnsubscribe: Subject<any> = new Subject();
  modalRef: BsModalRef;
  appViews: any = {
    team: [],
    private: [],
  };
  orderMenu = {
    relationship: [],
    date: [],
    location: [],
    category: [],
    member: [],
  };
  hasViews: boolean;
  viewForm: any;
  showViewTypeMenu = false;
  selectedViewType = "";
  updateFilterSubs = new Subscription();
  openViewMenuSubs = new Subscription();
  selectedAppId: any;
  selectedViewOrder: any = {};
  appFields = [];
  showOrderMenu = false;
  showViewDateTypeMenu = false;
  showViewLocationTypeMenu = false;
  selectedViewDateType = "";
  selectedViewLocationType = "";
  fieldTypes = Constants.APP_FIELD_TYPES;
  dateOptions = Constants.VIEW_DATE_OPTIONS;
  locationOptions = Constants.VIEW_LOCATION_OPTIONS;
  showViewEditMenu = "";
  viewMode = "create";
  currentView: any = {};
  activateViewSubs: Subscription;
  showView = false;
  public employeeTab: boolean;
  // LOADERS 
  orgSwitchLoader:boolean = false;
  orgRole:string = 'light_member';
  groupEvent:any;
  isPaidActive: Boolean = true;

  constructor(
    public homeService: HomeService,
    public helperService: HelperService,
    private apiService: APIService,
    private modalService: BsModalService,
    private renderer: Renderer2,
    public appViewService: AppViewService,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
  ) { 
    this.employeeTab = false;
  }

  async ngOnInit() {

    this.orgRole = (this.helperService.getLocalStore(
      "orgRole"
    ))
    const urlSegments = this.activatedRoute.snapshot["_urlSegment"].segments;
    if (urlSegments.length >= 3 && urlSegments[2].path === "app-view") {
      this.showView = true;
    } else {
      this.showView = false;
    }
    this.viewForm = this.fb.group({
      name: new FormControl(""),
    });
    this.updateFilterSubs = this.appViewService.updateAppFilters.subscribe(
      (data: any) => {
        this.appFields = data.fields;
        this.groupAppFieldsForOrderMenu();
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

    this.openViewMenuSubs = this.appViewService.openViewMenu.subscribe(
      (data: any) => {
        if (data.workspaceId) {
          this.openMenu = data.workspaceId;
          this.appViewService.showViewMenu = true;
          const view =
            this.appViews.private.find(
              (v) => v._id === this.appViewService.selectedView
            ) ||
            this.appViews.team.find(
              (v) => v._id === this.appViewService.selectedView
            );
          if (
            (this.appViews.team.length === 1 &&
              !this.appViews.private.length) ||
            !this.appViewService.selectedView ||
            (view && view.name === "All")
          ) {
            // this.openCreateViewMenu = true;
            // this.appViewService.showCreateViewMenu = true;
            // this.appViewService.isViewUnsaved = false;
          }
        }
      }
    );
    this.renderer.listen("window", "click", (event) => {
      // if (event.target.id !== "setting") {
      //   this.openMenu = "";
      // }
      if (event.target.id !== "view-menu") {
        this.showViewEditMenu = "";
      }
    });
    this.homeService.tempOrgId
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(async (data) => {
        if (data) {
          this.getWorkspaces(data.orgId, data.orgRole, data.orgColor);
        }
      });
    this.homeService.workSpaceList = this.helperService.getLocalStore(
      "workspaces"
    );
    const userData = this.helperService.getLocalStore("userData");
    this.restrictedDomain = userData.restrictedDomain;

    this.homeService.getSharedWSFlag().subscribe((flag) => {
      if (flag) {
        setTimeout(() => {
          this.getApplications(
            this.homeService.workSpaceList[0]._id,
            this.homeService.workSpaceList[0].role
          );
        }, 1000);
      }
    });

    this.groupEvent = this.helperService.groupEvent;
  }

  settingsOptions(option) {
    if (option) {
      this.isSettingsOpen = false;
    } else {
      this.isSettingsOpen = !this.isSettingsOpen;
    }
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

  async getWorkspaces(orgId, orgRole, orgColor?) {
    if (orgId) {
      this.homeService.orgId = orgId;
      this.helperService.setLocalStore("selectedOrgId", orgId);
      this.helperService.selectedOrgId = orgId;

      if(this.helperService.getLocalStore("orgRole") !== orgRole){
        this.helperService.setLocalStore("orgRole", orgRole);
        this.helperService.orgRole = orgRole;
      }
      this.homeService.backgroundColor = orgColor;
      if (
        this.homeService.backgroundColor &&
        this.homeService.backgroundColor !== undefined &&
        this.homeService.backgroundColor !== "undefined"
      ) {
        this.helperService.setLocalStore(
          "backgroundColor",
          this.homeService.backgroundColor
        );
      } else {
        this.helperService.setLocalStore("backgroundColor", "transparent");
      }
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
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(
      this.homeService.workSpaceList,
      event.previousIndex,
      event.currentIndex
    );
    const length = this.homeService.workSpaceList.length;
    this.newWorkspaceOrder = [];
    for (let i = 0; i < length; i++) {
      this.newWorkspaceOrder.push(this.homeService.workSpaceList[i]._id);
    }
    const data = {
      organization_id: this.homeService.workSpaceList[0].organization_id,
      workspaces: this.newWorkspaceOrder,
    };
    this.apiService
      .postWithHeader("workspace/changeOrder", data)
      .then((jresponse: JReponse) => { })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }

  toggleMenu(item) {
    this.homeService.wsRole = item.role;
    if (this.openMenu !== item._id) {
      this.openMenu = item._id;
    } else {
      this.openMenu = "";
    }
  }

  userManagement() {
    const initialState = {
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
    const initialState = {
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

  openOrgCalendar() {
    const selectedOrgId = this.helperService.getLocalStore("selectedOrgId");
    this.router.navigateByUrl(
      `/application/home/calendar?orgId=${selectedOrgId}`
    );
  }

  goToAddWorkspace() {
    const selectedOrgId = this.helperService.getLocalStore("selectedOrgId");
    const initialState = {
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

  async goToLeaveWorkspace(wsId) {
    await this.appViewService
      .leaveWorkspace(wsId)
      .then((jresponse: JReponse) => {
        this.helperService.showSuccessToast(jresponse.message);
        if (jresponse.success) {
          this.getWorkspaces(
            this.helperService.getLocalStore("selectedOrgId"),
            this.helperService.getLocalStore("orgRole")
          );
          this.router.navigateByUrl("application/home");
          this.homeService.applicationList = [];
          document.location.href = 'application/home';
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  goToAddApp(workspaceId) {
    // this.router.navigateByUrl(
    //   `application/home/create-app?workspaceId=${workspaceId}`
    // );
    const initialState = {
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

  async getApplications(workspaceId, role, type?, isPaidGroup:any = false,workspace:any = null) {
    this.homeService.activeWorkspaceId = workspaceId;
    this.homeService.wsRole = role;

    if(workspace && workspace._id){
      this.homeService.activeWorkspace = workspace;
      this.helperService.setLocalStore('activeWorkspace',workspace)
    }

    if (type && type == "click") {
      this.homeService.activityWsId = workspaceId;
      this.homeService.activityOrgId = "";
      const data = {
        workspace_id: workspaceId,
      };
      this.homeService.sendOrgIdForPost(data);
    }
    
    console.log('workspaceId',workspaceId)

    if(!isPaidGroup){

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

    else{
      this.router.navigateByUrl(`/application/home/subscribe/paid-groups/${workspaceId}`);
    }

  }

  goToSaveWorkspace(workspaceId) {
    const workspaceList = this.helperService.getLocalStore("workspaces");
    const finalWorkspace = workspaceList.filter((e) => e._id === workspaceId);
    if (finalWorkspace.length > 0) {
      const initialState = {
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

  groupAppFieldsForOrderMenu() {
    this.appFields.forEach((field) => {
      switch (field.type) {
        case this.fieldTypes.CATEGORY:
          this.orderMenu.category.push(field);
          break;
        case this.fieldTypes.DATE:
          this.orderMenu.date.push(field);
          break;
        case this.fieldTypes.LOCATION:
          this.orderMenu.location.push(field);
          break;
        case this.fieldTypes.MEMBER:
          this.orderMenu.member.push(field);
          break;
      }
    });
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
          resolve(true);
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
  }

  ngAfterContentInit(){
    this.matchAdminAndAuthDomain();
  }

  async ngDoCheck(){
    this.matchAdminAndAuthDomain();

    if(this.helperService.groupEvent && this.helperService.groupEvent._id){
      if(this.homeService.workSpaceList.length){
        await this.getApplications(this.helperService.groupEvent._id,this.helperService.groupEvent.role,'click')
      }
      
      this.helperService.groupEvent = {}
    }

  }

  ngOnChanges(){
    // LOADER START 
    if(this.loaderState == 'start'){
      this.orgSwitchLoader = true;
      this.spinner.show("org_switch_loader");
    }
    // LOADER STOP 
    if(this.loaderState == 'stop'){
      setTimeout(() => {
        this.spinner.hide();
        this.orgSwitchLoader = false;
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.updateFilterSubs.unsubscribe();
    this.openViewMenuSubs.unsubscribe();
  }
}
