import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { HelperService } from "src/app/services/helper.service";
import { APIService, JReponse } from "src/app/services/api.service";
import { HomeService } from "../../home.service";
import { environment } from "src/environments/environment";
import { Constants } from "src/app/constants/constants";
import { UploadOrgContentComponent } from "../../content/organisation-setup/upload-org-content/upload-org-content.component";

@Component({
  selector: "app-organisation-setup",
  templateUrl: "./organisation-setup.component.html",
  styleUrls: ["./organisation-setup.component.scss"],
})
export class OrganisationSetupComponent implements OnInit {
  isEdit;
  isEditOrg;
  addOrganizationForm: FormGroup;
  submitted = false;
  orgList;
  selectedOrgId;
  selectedOrg;
  selectedColor;
  isLatestUploaded;
  isNewOrg;
  firstRowColor = Constants.ORGANIZATION_BG_COLOR.ROW1;
  secondRowColor = Constants.ORGANIZATION_BG_COLOR.ROW2;
  thirdRowColor = Constants.ORGANIZATION_BG_COLOR.ROW3;
  // bsModalRef: BsModalRef;
  isAddedOrg = false;
  organizationname: any;

  constructor(
    private fb: FormBuilder,
    public helperService: HelperService,
    private apiService: APIService,
    private router: Router,
    public homeService: HomeService,
    private route: ActivatedRoute,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
    this.addOrganizationForm = this.fb.group({
      name: [
        this.helperService.orgName ? this.helperService.orgName : "",
        [Validators.required],
      ],
    });
    if (this.isNewOrg) {
      this.helperService.orgImage = "";
      this.helperService.orgImagePreview = "";
      this.addOrganizationForm.reset();
      this.selectedColor = "";
    }
    if (this.homeService.uploadModalRef) {
      this.homeService.uploadModalRef.hide();
    }
    this.isEdit = this.isEditOrg;
    if (!this.selectedOrgId && !this.helperService.editOrgId) {
      this.selectedOrgId = this.helperService.getLocalStore("selectedOrgId");
    }
    this.orgList = this.helperService.getLocalStore("organizations");
    this.selectedOrg = this.orgList.filter((e) => e._id === this.selectedOrgId);
    // this.route.queryParamMap.subscribe((params) => {
    //   this.isEdit = params.get("isEditOrg");
    // });
    // this.route.queryParamMap.subscribe((params) => {
    //   this.isLatestUploaded = params.get("isLatestUploaded");
    // });

    if (this.isEdit) {
      if (!this.isLatestUploaded) {
        this.addOrganizationForm.controls["name"].setValue(
          this.selectedOrg[0].name
        );
      }
      if (!this.isLatestUploaded && !this.helperService.updateImg) {
        this.helperService.orgImagePreview =
          this.selectedOrg[0].avatar != ""
            ? environment.MEDIA_URL + this.selectedOrg[0].avatar
            : "";
      }
    }
  }

  get form() {
    return this.addOrganizationForm.controls;
  }

  upload() {
    this.helperService.orgName = this.addOrganizationForm.get("name").value;
    // this.homeService.addOrgModalRef.hide();
    if (!this.isEdit) {
      this.homeService.uploadModalRef = this.modalService.show(
        UploadOrgContentComponent,
        { class: "small-custom-modal",animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true }
      );
    } else {
      let initialState = {
        isEditOrg: true,
        caller: "addOrg"
      };
      const modalParams = Object.assign(
        {},
        { initialState, class: "small-custom-modal",animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true }
      );
      this.homeService.uploadModalRef = this.modalService.show(
        UploadOrgContentComponent,
        modalParams
      );
    }
  }

  async add() {
    this.isAddedOrg = true;
    this.submitted = true;
    const userData = this.helperService.getLocalStore("userData");
    this.organizationname=this.addOrganizationForm.get("name").value;
    this.organizationname=this.helperService.removeTags(this.organizationname);

    if (this.addOrganizationForm.valid) {
      const orgImage = this.helperService.orgImage;
      const formData = new FormData();
      formData.append("name",  this.organizationname );
      formData.append("backrgoundColor", this.selectedColor);
      if (this.isEdit) {
        formData.append("organization_id", this.selectedOrgId || this.helperService.editOrgId);
        formData.append("owner", userData.owner);
      }
      if (orgImage) {
        formData.append("avatar", orgImage);
        formData.append("fileName", orgImage.name);
      }

      if (!this.isEdit) {
        await this.apiService
          .postWithHeader("organization/addOrganization", formData)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              this.helperService.orgName = "";
              this.helperService.orgImage = "";
              this.helperService.orgImagePreview = "";
              this.helperService.showSuccessToast(jresponse.message);
              this.isAddedOrg = false;
            }
            this.helperService.editOrgId = "";
            this.modalService.hide(1);
            this.helperService.setLocalStore("organizations", "");
            //document.getElementById("mainBody").classList.value = "";
            this.getOrganizations(jresponse.body, "click");

            this.addOrganizationForm.reset();
            
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.message);
            throw err;
          });
      } else {
        this.apiService
          .postWithHeader("organization/editOrganization", formData)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              this.helperService.orgName = "";
              this.helperService.orgImage = "";
              this.helperService.orgImagePreview = "";
              this.helperService.updateImg = "";
              this.helperService.showSuccessToast(jresponse.message);
            }
            this.helperService.editOrgId = "";
            this.modalService.hide(1);
            // this.modalService.onHidden.subscribe((reason: string) => {
            this.helperService.setLocalStore("organizations", "");
            this.getOrganizations(jresponse.body);
            // this.router.navigateByUrl("application/home");
            // document.getElementById("mainBody").classList.value = "";
            this.addOrganizationForm.reset();
            // });
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.message);
            throw err;
          });
      }
      this.submitted = false;
    } else {
      this.isAddedOrg = false;
    }
  }

  getOrganizations(orgData, type?) {
    this.apiService
      .getWithHeader("organization/getOrganizations")
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.orgList = jresponse.body;
          this.helperService.orgList = this.orgList;
          this.helperService.setLocalStore("organizations", this.orgList);
          this.helperService.setLocalStore("selectedOrgId", orgData._id);
          console.log('orgData._idorgData._id',orgData._id)
          this.helperService.selectedOrgId = orgData._id;
          this.helperService.setLocalStore(
            "backgroundColor",
            orgData.backrgoundColor
          );
          this.setBackgroundColorAfterAdd(orgData.backrgoundColor);
          this.helperService.selectedItemId = orgData._id;
          this.selectedOrg = this.orgList.filter(
            (e) => e._id === this.selectedOrgId
          );
          if (type && type == "click") {
            this.homeService.activityOrgId = orgData._id;
            this.homeService.activityWsId = "";
            this.homeService.sendOrgIdForPost({ organization_id: orgData._id });
          }
          this.getWorkspaces(orgData._id, "admin", orgData.backrgoundColor);
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }
  getWorkspaces(orgId, orgRole, orgColor?, type?) {
    if (orgId) {
      if (type && type == "click") {
        this.homeService.activityOrgId = orgId;
        this.homeService.sendOrgIdForPost({ organization_id: orgId });
      }
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
  setBackgroundColor(item, color) {
    this.homeService.backgroundColor = color;
    this.selectedColor = color;
    document.getElementById("mainBody").classList.value = item;
    document.getElementById("mainBody").classList.add("border-none");
  }

  setDefaultBgColor(item) {
    this.helperService.setLocalStore("backgroundColor", item);
    this.homeService.backgroundColor = "";
    this.selectedColor = "";
    document.getElementById("mainBody").classList.value = item;
    document.getElementById("mainBody").classList.add("border-none");
  }
  removeBackgroundColor() {
    // document.getElementById("mainBody").classList.value = "";
    // this.bsModalRef.hide({"name": "a"});

    this.modalService.hide(1);
    // this.modalService.onHidden.subscribe((reason: string) => {
    // })
  }
}
