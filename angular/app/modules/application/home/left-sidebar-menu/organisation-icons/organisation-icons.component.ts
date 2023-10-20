import { Component, OnInit, Renderer2, Output, EventEmitter } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

import { OrganisationSetupComponent } from "../../content/organisation-setup/organisation-setup.component";
import { CreateWorkspaceComponent } from "../../content/create-workspace/create-workspace.component";
import { CreateAppComponent } from "../../content/create-app/create-app.component";
import { APIService, JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { HomeService } from "../../home.service";
import { environment } from "src/environments/environment";
import { Constants } from "../../../../../constants/constants";
import { RecordModalComponent } from "../../application-view/record-modal/record-modal.component";
@Component({
  selector: "app-organisation-icons",
  templateUrl: "./organisation-icons.component.html",
  styleUrls: ["./organisation-icons.component.scss"],
})
export class OrganisationIconsComponent implements OnInit {

  @Output() onClickOrgIconEvent = new EventEmitter<string>();

  isAdd = false;
  isShowOrgs = false;
  showWorkspacesFlag = false;
  orgList = [];
  orgId;
  MEDIA_URL: string;
  selectedOrganization;
  selectedOrganizationLiTag = "";
  showOrgForApp = false;
  isFirst = false;
  selectedItemId = "";
  workspaceList;
  newOrgOrder = [];
  modalRef: BsModalRef;
  sharedRecords: any;
  sharedRecordOrgIds: string[];
  orgRole:string = 'light_member';
  orgEvent:any;

  constructor(
    private router: Router,
    public helperService: HelperService,
    public homeService: HomeService,
    private apiService: APIService,
    private renderer: Renderer2,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute
  ) {}

  async ngOnInit() {

    this.orgRole = this.helperService.getLocalStore("orgRole")

    // To close menu on mouse click event outside the menu
    this.renderer.listen("window", "click", (event) => {
      if (
        event.target.id !== "add-org" &&
        event.target.id !== "add-org-plus" &&
        event.target.id !== "add-ws" &&
        event.target.id !== "add-app" &&
        event.target.id !== "org-list" &&
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
    });
    this.selectedItemId = this.helperService.getLocalStore("selectedOrgId");

    this.helperService.selectedItemId = this.helperService.getLocalStore(
      "selectedOrgId"
    );
    this.helperService.orgRole = localStorage.getItem("orgRole")
      ? localStorage.getItem("orgRole").split('"').join("")
      : "";
    this.MEDIA_URL = environment.MEDIA_URL;
    this.isFirst = true;
    if (!this.helperService.getLocalStore("organizations")) {
      this.homeService.activityOrgId = "";
      this.homeService.sendOrgIdForPost({ organization_id: "" });
      await this.getOrganizations();
    } else {
      this.orgList = this.helperService.getLocalStore("organizations");
      this.helperService.orgList = this.helperService.getLocalStore(
        "organizations"
      );
      const orgColor = this.helperService.getLocalStore("backgroundColor");
      this.setBackgroundColor(orgColor);
    }
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

    this.orgEvent = this.helperService.orgEvent;
  }

  ngOnChanges(){
    this.orgRole = this.helperService.getLocalStore("orgRole")
  }
  async ngDoCheck(){
    if(this.helperService.orgEvent && this.helperService.orgEvent._id){
      if(this.orgList.length){
        let bgColor = this.orgList.filter((data) => data._id === this.helperService.orgEvent._id)
        await this.getWorkspaces(this.helperService.orgEvent._id,this.helperService.orgEvent.role, bgColor ? bgColor[0].backrgoundColor : 'transparent','click')
      }
      
      this.helperService.orgEvent = {}
    }
    // console.log('change detected2')
    this.orgRole = this.helperService.getLocalStore("orgRole")
  }

  onClickOrgIconLoader(value: string) {
    this.onClickOrgIconEvent.emit(value);
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

  async getWorkspaces(orgId, orgRole, orgColor?, type?) {
    // LOADER 
    this.onClickOrgIconLoader('start');
    if (orgId) {
      if (type && type == "click") {
        this.homeService.activityOrgId = orgId;
        this.homeService.activityWsId = "";
        this.homeService.sendOrgIdForPost({
          organization_id: orgId,
          workspace_id: "",
        });
      }   
      this.homeService.toShow = "org";
      this.homeService.applicationList = [];
      if (
        this.router.url.split("?")[0] !=='/application/home'
       // "/application/home/app-view/applicationView"
      ) {
        this.router.navigateByUrl("/application/home");
      }
      this.selectedItemId = orgId;
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
        orgRole,
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
            this.homeService.sendFlagForOrgId(true);
            // LOADER 
            this.onClickOrgIconLoader('stop');
          }
        })
        .catch((err: any) => {
          // LOADER 
          this.onClickOrgIconLoader('stop');
          throw err;
        });
    }
    else{
      // LOADER 
      this.onClickOrgIconLoader('stop');
    }
  }

  getOrganizations() {
    this.apiService
      .getWithHeader("organization/getOrganizations")
      .then(async (jresponse: JReponse) => {
        if (jresponse) {
          this.orgList = jresponse.body;
          this.sharedRecords = await this.homeService.getSharedRecords();
          this.sharedRecordOrgIds = Object.keys(this.sharedRecords);
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

  showAppOrgs() {
    this.showOrgForApp = !this.showOrgForApp;
    this.showWorkspacesFlag = false;
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(
      this.helperService.orgList,
      event.previousIndex,
      event.currentIndex
    );
    const length = this.helperService.orgList.length;
    this.newOrgOrder = [];
    for (let i = 0; i < length; i++) {
      this.newOrgOrder.push(this.helperService.orgList[i]._id);
    }
    const data = {
      organizations: this.newOrgOrder,
    };
    this.apiService
      .postWithHeader("organization/changeOrder", data)
      .then((jresponse: JReponse) => {
        this.helperService.setLocalStore(
          "organizations",
          this.helperService.orgList
        );
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
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

  // getSharedRecords() {
  //   this.apiService
  //     .getWithHeader("record/sharedOrganization")
  //     .then((jresponse: JReponse) => {
  //       if (jresponse) {
  //         this.sharedRecords = jresponse.body;
  //         this.sharedRecordOrgIds = Object.keys(this.sharedRecords);
  //         this.helperService.setLocalStore("sharedRecords", this.sharedRecords);
  //         this.homeService.sharedRecords = jresponse.body;
  //       }
  //     })
  //     .catch((err: any) => {
  //       throw err;
  //     });
  // }

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
}
