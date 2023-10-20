import { Component, OnInit } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

import { HelperService } from "src/app/services/helper.service";
import { APIService, JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
@Component({
  selector: "app-organisation-workspaceList",
  templateUrl: "./organisation-workspaceList.component.html",
  styleUrls: ["./organisation-workspaceList.component.scss"],
})
export class OrganisationWorkspaceListComponent implements OnInit {
  orgId;
  keyword = "";
  workspaceData;
  mediaUrl = "";
  modalRef: BsModalRef | null;
  constructor(
    private helperService: HelperService,
    private apiService: APIService,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
    this.mediaUrl = environment.MEDIA_URL;
    this.orgId = this.helperService.getLocalStore("selectedOrgId");
    this.getWorkspaceUserListForOrganization(this.keyword);
  }

  search(data) {
    this.keyword = data.target.value;
    this.getWorkspaceUserListForOrganization(this.keyword);
  }

  getWorkspaceUserListForOrganization(keyword) {
    let query = "";
    if (keyword) {
      query = `?keyword=${keyword}`;
    }
    this.apiService
      .getWithHeader(`workspace/${this.orgId}/workspaces${query}`)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.workspaceData = jresponse.body.workspaces;
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }
}
