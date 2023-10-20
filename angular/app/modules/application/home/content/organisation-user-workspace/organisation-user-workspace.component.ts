import { Component, OnInit } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";

import { HelperService } from "src/app/services/helper.service";
import { APIService, JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
@Component({
  selector: "app-organisation-user-workspace",
  templateUrl: "./organisation-user-workspace.component.html",
  styleUrls: ["./organisation-user-workspace.component.scss"],
})
export class OrganisationUserWorkspaceComponent implements OnInit {
  orgId;
  userId;
  userData;
  workspaceData;
  mediaUrl;
  constructor(
    private helperService: HelperService,
    private apiService: APIService,
    public modalService: BsModalService
  ) {}

  async ngOnInit() {
    this.mediaUrl = environment.MEDIA_URL;
    this.orgId = await this.helperService.getLocalStore("selectedOrgId");
    const userData = this.helperService.getLocalStore("userData");
    this.userId = userData.owner;
    this.getUserWorkspaces();
  }

  closeModal(level) {
    this.modalService.hide(level);
  }

  getUserWorkspaces() {
    this.apiService
      .getWithHeader(
        `workspace/${this.orgId}/user-workspaces?user_id=${this.userId}`
      )
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.userData = jresponse.body.user;
          this.workspaceData = jresponse.body.workspaces;
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }
}
