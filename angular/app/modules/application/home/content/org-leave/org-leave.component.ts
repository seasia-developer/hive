import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

import { HelperService } from "src/app/services/helper.service";
import { APIService, JReponse } from "src/app/services/api.service";
import { HomeService } from "../../../home/home.service";
import { Constants } from "src/app/constants/constants";
import { AppViewService } from "../../application-view/application-view.service";

@Component({
  selector: "app-org-leave",
  templateUrl: "./org-leave.component.html",
  styleUrls: ["./org-leave.component.scss"],
})
export class OrgLeaveComponent implements OnInit {
  orgId;
  orgRole;
  orgList;
  selectedOrgId;
  selectedOrg;
  selectedColor;
  orgName = "";
  iAmLeaving = "";
  deleteThisApp = "";
  modalRef: BsModalRef | null;
  isDeleteApp: boolean;
  deleteAppName: string;
  deleteAppId;
  isDeleteWorkspace: boolean;
  deleteWsName: string;
  deleteWsId;

  constructor(
    private helperService: HelperService,
    private apiService: APIService,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
    public homeService: HomeService,
    public appViewService: AppViewService,
    private router: Router
  ) {}

  ngOnInit() {
    this.orgId = this.helperService.getLocalStore("selectedOrgId");
    this.orgRole = localStorage.getItem("orgRole")
      ? localStorage.getItem("orgRole")
      : "";
    this.helperService.getLocalStore("organizations").filter((elem, index) => {
      if (elem._id === this.orgId) {
        this.orgName = elem.name;
      }
    });
  }

  leave() {
    if (this.iAmLeaving === "I am leaving") {
      this.leaveOrg();
    } else {
      this.helperService.showErrorToast("Type the exact text I am leaving");
    }
  }

  deleteThisAppFunction() {
    if (this.deleteThisApp === "delete this app") {
      this.deleteApplication(this.deleteAppId);
    } else {
      this.helperService.showErrorToast("Type the exact text delete this app");
    }
  }

  deleteThisWorkspaceFunction() {
    if (this.deleteThisApp === "delete this group") {
      this.deleteWorkspace(this.deleteWsId);
    } else {
      this.helperService.showErrorToast(
        "Type the exact text delete this group"
      );
    }
  }

  leaveOrg() {
    this.apiService
      .deleteWithHeader(`organization/${this.orgId}/leave-organization`)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.modalService.hide(1);
          this.helperService.showSuccessToast(jresponse.message);
          this.helperService.setLocalStore("organizations", "");
          this.apiService
            .getWithHeader("organization/getOrganizations")
            .then((jresponse: JReponse) => {
              if (jresponse) {
                this.helperService.orgList = jresponse.body;
                if (
                  this.helperService.orgList &&
                  this.helperService.orgList.length > 0
                ) {
                  this.helperService.setLocalStore(
                    "organizations",
                    this.helperService.orgList
                  );
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
                  const orgColor = this.helperService.getLocalStore(
                    "backgroundColor"
                  );
                  this.setBackgroundColorAfterAdd(orgColor);
                  this.selectedOrgId = this.helperService.getLocalStore(
                    "selectedOrgId"
                  );
                  this.orgRole = this.helperService.getLocalStore("orgRole");
                  this.helperService.selectedItemId = this.selectedOrgId;
                  this.helperService.orgRole = this.orgRole;
                  this.selectedOrg = this.helperService.orgList.filter(
                    (e) => e._id === this.selectedOrgId
                  );
                  this.homeService.activityOrgId = this.helperService.orgList[0]._id;
                  this.homeService.sendOrgIdForPost({
                    organization_id: this.helperService.orgList[0]._id,
                  });
                  this.getWorkspaces(
                    this.selectedOrgId,
                    this.orgRole,
                    orgColor
                  );
                } else {
                  this.homeService.activityWsId = "";
                  this.homeService.activityOrgId = "";
                  this.homeService.sendOrgIdForPost({
                    organization_id: "",
                  });
                }
              }
            })
            .catch((err: any) => {
              throw err;
            });
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  deleteApplication(appId) {
    this.appViewService
      .deleteApp(appId)
      .then((jresponse: JReponse) => {
        this.helperService.showSuccessToast(jresponse.message);
        this.bsModalRef.hide();
        if (jresponse.success) {
          this.appViewService.refreshAfterDelete.next(appId);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  async deleteWorkspace(wsId) {
    await this.appViewService
      .deleteWorkspace(wsId)
      .then((jresponse: JReponse) => {
        this.helperService.showSuccessToast(jresponse.message);
        this.bsModalRef.hide();
        if (jresponse.success) {
          this.homeService.activityOrgId = this.helperService.getLocalStore(
            "selectedOrgId"
          );
          this.homeService.activityWsId = "";
          this.homeService.sendOrgIdForPost({
            organization_id: this.homeService.activityOrgId,
          });
          this.getWorkspaces(
            this.helperService.getLocalStore("selectedOrgId"),
            this.helperService.getLocalStore("orgRole")
          );
          this.router.navigateByUrl("application/home");
          this.homeService.applicationList = [];
        }
      })
      .catch((err: Error) => {
        throw err;
      });
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
      await this.apiService
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

  setBackgroundColorAfterAdd(orgColor) {
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
}
