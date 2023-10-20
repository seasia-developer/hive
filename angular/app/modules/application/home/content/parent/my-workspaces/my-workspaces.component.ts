import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

import { HelperService } from "src/app/services/helper.service";
import { APIService, JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
import { MyProfileService } from "../my-profile/my-profile.service";
import { SaveWorkspacesComponent } from "../save-workspaces/save-workspaces.component";
import { HomeService } from "../../../home.service";
import { BusinessProfileService } from "../business-profile/business-profile.service";
@Component({
  selector: "app-my-workspaces",
  templateUrl: "./my-workspaces.component.html",
  styleUrls: ["./my-workspaces.component.scss"],
})
export class MyWorkspacesComponent implements OnInit {
  @ViewChild("editrestoreworkspace", { static: false })
  editWorkspace: ElementRef;
  businessName;
  env = environment;
  userId;
  myWorkspaces = [];
  modalRef: BsModalRef;
  workspaceData: any;

  constructor(
    private modalService: BsModalService,
    private helperService: HelperService,
    public homeService: HomeService,
    private apiService: APIService
  ) {}

  ngOnInit() {
    const userData = this.helperService.getLocalStore("userData");
    this.userId = userData.owner;
    this.homeService.getMyWorkspaces(this.userId);
  }

  async getWorkspaceDetail(id) {
    await this.apiService
      .getWithHeader(`market-workspaces/${id}/detail`)
      .then((jresponse: JReponse) => {
        this.workspaceData = jresponse.body.data;
      })
      .catch((err: any) => {
        throw err;
      });
  }

  goToSaveWorkspace(workspaceId) {
    this.apiService
      .getWithHeader(`market-workspaces/${workspaceId}/detail`)
      .then((jresponse: JReponse) => {
        this.workspaceData = jresponse.body.data;
        const initialState = {
          workspace: this.workspaceData,
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
      })
      .catch((err: any) => {
        throw err;
      });
  }
}
