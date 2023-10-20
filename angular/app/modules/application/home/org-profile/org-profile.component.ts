import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalService } from "ngx-bootstrap/modal";
import { HomeService } from "../home.service";
import { JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
import { HelperService } from "src/app/services/helper.service";
import { ParentService } from "../content/parent/parent.service";
import { UploadOrgContentComponent } from "../content/organisation-setup/upload-org-content/upload-org-content.component";
import { OrganisationSetupComponent } from "../content/organisation-setup/organisation-setup.component";
@Component({
  selector: "app-org-profile",
  templateUrl: "./org-profile.component.html",
  styleUrls: ["./org-profile.component.scss"],
})
export class OrgProfileComponent implements OnInit {
  profile: any;
  userInfo: any;
  mediaUrl = environment.MEDIA_URL;
  workspaceIdFromURL;
  organizationIdFromURL;
  parentIdFromURL;
  categoryIdFromURL;
  workspaceInfo = [];
  selectedOrgId;
  orgList;
  selectedOrg;
  followUser = false;
  active = "";
  inactive = "";
  loggedUser;
  validUser = false;
  businessProfileImageData: any = "";
  organizationId;
  profileEmail;
  profileWebsite;
  type;
  constructor(
    private homeService: HomeService,
    public helperService: HelperService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalService: BsModalService,
    private parentService: ParentService
  ) { }

  ngOnInit() {
    this.type = this.activatedRoute.snapshot.queryParams.type;
    this.workspaceIdFromURL = this.activatedRoute.snapshot.queryParams.workspaceId;
    this.organizationIdFromURL = this.activatedRoute.snapshot.queryParams.organizationId;
    this.loggedUser = this.helperService.getLocalStore("userData");
    if (this.type == 'market') {
      this.categoryIdFromURL = this.activatedRoute.snapshot.queryParams.categoryId;
      this.parentIdFromURL = this.activatedRoute.snapshot.queryParams.parentId;
      if (this.workspaceIdFromURL) {
        this.getOrgProfile(this.parentIdFromURL);
      }
      if (this.categoryIdFromURL) {
        this.getMarketWorkspace(this.organizationIdFromURL);
      }
    } else {
      this.getOrgDetail(this.organizationIdFromURL);
    }

    this.getFollowingUser();
    this.activeClass("profile");
    this.getBusinessAvatar();
  }

  getOrgProfile(id) {
    this.homeService.getOrgProfile(id)
      .then((jresponse: JReponse) => {
        this.profile = jresponse.body;
        this.organizationId = jresponse.body._id;
        this.getFollowingUser();
        if (this.loggedUser.email == jresponse.body.owner.email) {
          this.validUser = true;
        }
        if (jresponse.body) {
          this.helperService.setLocalStore("selectedOrgId", jresponse.body._id);
          console.log('jresponse.body._idjresponse.body._id',jresponse.body._id)
          this.helperService.selectedOrgId = jresponse.body._id;
        }
        if (jresponse.body.userInfo) {
          if (jresponse.body.userInfo.email) {
            this.profileEmail = jresponse.body.userInfo.email;
          } else {
            this.profileEmail = jresponse.body.owner.email;
          }
          if (jresponse.body.userInfo.businessURL) {
            this.profileWebsite = jresponse.body.userInfo.businessURL;
          } else {
            this.profileWebsite = jresponse.body.owner.website;
          }
          this.userInfo = jresponse.body.userInfo;
        } else {
          this.profileEmail = jresponse.body.owner.email;
          this.profileWebsite = jresponse.body.owner.website;
          this.userInfo = jresponse.body.owner;
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }


  getMarketWorkspace(id) {
    // this.homeService
    //   .getMarketWorkspace({
    //     category_id: id,
    //     format: "all",
    //     type: "profile",
    //     keyword: "",
    //   })
    this.homeService.getOrgDetail(id)
      .then((jresponse: JReponse) => {
        if (jresponse.body && jresponse.body.workspaces && jresponse.body.workspaces) {
          this.workspaceInfo = jresponse.body.workspaces;
        }
        // jresponse.body.workspaces.forEach((workspace) => {
        //   if (workspace.clone) {
        //     this.workspaceInfo.push(workspace);
        //   }
        // });
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  openUploadModal() {
    this.selectedOrgId = this.organizationId || this.organizationIdFromURL;
    this.orgList = this.helperService.getLocalStore("organizations");
    this.selectedOrg = this.orgList.filter((e) => e._id === this.selectedOrgId);
    this.helperService.editOrgId = this.selectedOrgId;
    this.helperService.orgImagePreview =
      this.selectedOrg[0].avatar != ""
        ? environment.MEDIA_URL + this.selectedOrg[0].avatar
        : "";
    this.modalService.onShown.subscribe((reason: string) => {
      if (document.getElementById("name")) {
        document.getElementById("name").focus();
      }
    });

    this.helperService.updateImg = true;
    const initialState = {
      isEditOrg: true,
      selectedColor: this.homeService.backgroundColor,
      selectedOrgId: this.selectedOrgId
    };
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

  following(followingId, type) {
    if (followingId && type) {
      this.homeService
        .addFollowing({
          organization_id: this.organizationId,
          followType: "organization",
          type: type,
        })
        .then((jresponse: JReponse) => {
          this.getFollowingUser();
          this.helperService.showSuccessToast(jresponse.message);
        })
        .catch((err: Error) => {
          throw err;
        });
    }
  }

  getFollowingUser() {
    this.homeService
      .getFollowingUser({
        organization_id: this.organizationId,
        followType: "organization",
      })
      .then((jresponse: JReponse) => {
        if (jresponse.body) {
          this.followUser = true;
        } else {
          this.followUser = false;
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  activeClass(type) {
    if (type === "workspace") {
      this.active = "active";
      this.inactive = "";
    } else if (type === "profile") {
      this.inactive = "active";
      this.active = "";
    }
  }

  openUploadBannerModal() {
    const initialState = { caller: "business", uploadType: "single" };
    const modalParams = { initialState, class: "small-custom-modal",animated: true,
    keyboard: true,
    backdrop: false,
    ignoreBackdropClick: true };
    this.homeService.uploadModalRef = this.modalService.show(
      UploadOrgContentComponent,
      modalParams
    );
  }

  getBusinessAvatar() {
    this.parentService.businessAvatar.subscribe((image) => {
      this.fileupload(image);
      this.homeService.uploadModalRef.hide();
    });
  }

  fileupload(image) {
    this.businessProfileImageData = image;
    this.submitForm();
  }

  submitForm() {
    const formData = new FormData();
    formData.append("banner", this.businessProfileImageData);
    formData.append("organization_id", this.organizationId);
    this.homeService
      .orgBannerChange(formData)
      .then((jresponse: JReponse) => {
        if (this.type == 'market') {
          if (this.workspaceIdFromURL) {
            this.getOrgProfile(this.parentIdFromURL);
          }
          if (this.categoryIdFromURL) {
            this.getMarketWorkspace(this.organizationIdFromURL);
          }
        } else {
          this.getOrgDetail(this.organizationIdFromURL);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }
  getOrgDetail(id) {
    this.homeService.getOrgDetail(id)
      .then((jresponse: JReponse) => {
        this.profile = jresponse.body;
        this.organizationId = jresponse.body._id;
        this.getFollowingUser();
        if (this.loggedUser.email == jresponse.body.owner.email) {
          this.validUser = true;
        }
        if (jresponse.body.workspaces && jresponse.body.workspaces) {
          this.workspaceInfo = jresponse.body.workspaces;
        }
        if (jresponse.body.userInfo) {
          if (jresponse.body.userInfo.email) {
            this.profileEmail = jresponse.body.userInfo.email;
          } else {
            this.profileEmail = jresponse.body.owner.email;
          }
          if (jresponse.body.userInfo.businessURL) {
            this.profileWebsite = jresponse.body.userInfo.businessURL;
          } else {
            this.profileWebsite = jresponse.body.owner.website;
          }
          this.userInfo = jresponse.body.userInfo;
        } else {
          this.profileEmail = jresponse.body.owner.email;
          this.profileWebsite = jresponse.body.owner.website;
          this.userInfo = jresponse.body.owner;
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }
}
