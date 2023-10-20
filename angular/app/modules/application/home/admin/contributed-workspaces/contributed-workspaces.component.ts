import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";

import { APIService, JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
import { HelperService } from "src/app/services/helper.service";
import { AppViewService } from "../../application-view/application-view.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-contributed-workspaces",
  templateUrl: "./contributed-workspaces.component.html",
  styleUrls: ["./contributed-workspaces.component.scss"],
})
export class ContributedWorkspacesComponent implements OnInit, OnDestroy {
  contributedWorkspaces;
  mainContributedWorkspaceDetail;
  contributedWorkspaceDetail;
  contributedWorkspaceApplications = [];
  mediaUrl;
  modalRef: BsModalRef;
  selectedWorkspaceId: any;
  isDisplayGridview = false;
  currentWSId;
  flagForContributed;
  @ViewChild("contributedWSDetail", { static: false })
  contributedWSDetail: TemplateRef<any>;

  constructor(
    private apiService: APIService,
    private modalService: BsModalService,
    private helperService: HelperService,
    public appViewService: AppViewService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.router.navigateByUrl("/application/home/admin/contributed-workspaces");
    this.mediaUrl = environment.MEDIA_URL;
    this.flagForContributed = this.activatedRoute.snapshot.queryParams.flagForContributed;
    // if (this.flagForContributed === true) {
    // this.openModal(this.contributedWSDetail, "");
    // }
    this.getContributedWorkspaces();
  }

  search(data) {
    if (data.target.value) {
      this.getContributedWorkspaces(data.target.value);
    }
  }

  getContributedWorkspaces(keyword?) {
    const data = {
      format: "all",
      type: "contributed",
      keyword: keyword,
    };
    this.apiService
      .postWithHeader("market-workspaces/market-workspaces", data)
      .then((jresponse: JReponse) => {
        this.contributedWorkspaces = jresponse.body.workspaces;
      })
      .catch((err: any) => {
        throw err;
      });
  }

  async openModal(template: TemplateRef<any>, id) {
    this.selectedWorkspaceId = id;
    await this.getContributedWorkspaceDetail(id);
    const initialState = { class: "contributed-workspaces-modal",animated: true,
    keyboard: true,
    backdrop: false,
    ignoreBackdropClick: true };
    this.modalRef = this.modalService.show(template, initialState);
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  changeApp(app, index) {
    this.appViewService.sendAppId(app);
    this.contributedWorkspaceApplications.forEach((element) => {
      element.isSelected = false;
    });
    this.contributedWorkspaceApplications[index].isSelected = true;
  }

  createApp() {
    this.contributedWorkspaceApplications.forEach((element) => {
      if (element.isSelected) {
        this.currentWSId = element.workspace_id;
      }
    });
    this.appViewService.sendWorkspaceIdForContributedWS(this.currentWSId, true);
  }

  async getContributedWorkspaceDetail(id) {
    await this.apiService
      .getWithHeader(`market-workspaces/${id}/detail`)
      .then((jresponse: JReponse) => {
        this.mainContributedWorkspaceDetail = jresponse.body;
        this.contributedWorkspaceDetail = this.mainContributedWorkspaceDetail.data;
        this.contributedWorkspaceApplications = this.mainContributedWorkspaceDetail.applications;
        if (this.contributedWorkspaceApplications) {
          this.contributedWorkspaceApplications.forEach((element) => {
            element.isSelected = false;
          });
        }
        let appData;
        if (this.contributedWorkspaceApplications && this.contributedWorkspaceApplications.length>0) {
         
          this.contributedWorkspaceApplications[0].isSelected = true;
          appData = {
            wsId: this.contributedWorkspaceApplications
              ? this.contributedWorkspaceApplications[0].workspace_id
              : "",
            appId: this.contributedWorkspaceApplications
              ? this.contributedWorkspaceApplications[0]._id
              : "",
            viewId: this.contributedWorkspaceApplications
              ? this.contributedWorkspaceApplications[0].viewId
                ? this.contributedWorkspaceApplications[0].viewId
                : ""
              : "",
          };
        }
        this.helperService.setLocalStore("contributedAppData", appData);
        this.isDisplayGridview = true;
      })
      .catch((err: any) => {
        throw err;
      });
  }

  async setStatus(status) {
    const data = {
      workspace_id: this.selectedWorkspaceId,
      type: status,
    };
    await this.apiService
      .postWithHeader("market-workspaces/workspace-approval", data)
      .then((jresponse: JReponse) => {
        this.helperService.showSuccessToast(jresponse.message);
        this.closeModal();
        this.getContributedWorkspaces();
      })
      .catch((err: any) => {
        throw err;
      });
  }

  ngOnDestroy(): void {
    this.closeModal();
  }
}
