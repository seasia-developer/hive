import {
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import * as _ from "lodash";

import { HelperService } from "src/app/services/helper.service";
import { JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
import { MyProfileService } from "../my-profile/my-profile.service";
import { AdminService } from "src/app/modules/application/home/admin/admin.service";
import { BannersComponent } from "./banners/banner.component";
import { HomeService } from "../../../../home/home.service";
@Component({
  selector: "app-save-workspaces",
  templateUrl: "./save-workspaces.component.html",
  styleUrls: ["./save-workspaces.component.scss"],
})
export class SaveWorkspacesComponent implements OnInit {
  @ViewChild("editrestoreworkspace", { static: false })
  editWorkspace: ElementRef;
  saveWorkspaceForm: FormGroup;
  env = environment;
  userId;
  myWorkspaces = [];
  workspace;
  modalData;
  submitted = false;
  modalRef: BsModalRef | null;
  categoryList: any;
  displayApps = false;
  selectedMembers = [];
  bannerImage;
  mediaURL;
  showHelpText;
  isDisplay = false;
  constructor(
    private modalService: BsModalService,
    private myProfileService: MyProfileService,
    public helperService: HelperService,
    private fb: FormBuilder,
    private adminService: AdminService,
    private homeService: HomeService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.helperService.wsName = this.workspace.name
      ? this.workspace.name
      : this.workspace.title;
    this.helperService.wsdescription = this.workspace.description;
    if (this.workspace.image) {
      this.bannerImage = this.bannerImage
        ? this.bannerImage
        : this.workspace.image;
    }
    if (this.workspace.categories) {
      this.selectedMembers = this.workspace.categories;
    }
    this.renderer.listen("window", "click", (event) => {
      if (event.target.id !== "tooltip-info") {
        this.showHelpText = "";
      }
    });
    this.mediaURL = environment.MEDIA_URL;
    if (this.homeService.uploadWSModalRef) {
      this.homeService.uploadWSModalRef.hide();
    }
    this.saveWorkspaceForm = this.fb.group({
      title: [
        this.helperService.wsName ? this.helperService.wsName : "",
        [Validators.required],
      ],
      description: [
        this.helperService.wsdescription
          ? this.helperService.wsdescription
          : "",
        [Validators.required],
      ],
      image: [],
      categories: [],
      published: [this.workspace.published ? this.workspace.published : ""],
    });
    const userData = this.helperService.getLocalStore("userData");
    this.userId = userData.owner;
    this.getCategoriesList();
  }

  get form() {
    return this.saveWorkspaceForm.controls;
  }

  getCategoriesList() {
    const workspaceData = this.workspace.categories
      ? this.workspace.categories
      : "";
    this.adminService
      .getCategoryList()
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.categoryList = jresponse.body;
          if (workspaceData) {
            this.categoryList = _.pullAllBy(
              this.categoryList,
              workspaceData,
              "_id"
            );
          }
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  submitForm() {
    this.submitted = true;
    // return false
    if (this.saveWorkspaceForm.valid) {
      if (this.selectedMembers.length < 1) {
        this.helperService.showErrorToast("Please select category");
        return false;
      }
      if (!this.bannerImage) {
        this.helperService.showErrorToast("Image is required");
        return false;
      }
      const formData = new FormData();
      formData.append("title", this.saveWorkspaceForm.get("title").value);
      formData.append(
        "description",
        this.saveWorkspaceForm.get("description").value
      );
      formData.append("image", this.bannerImage);
      formData.append(
        "published",
        this.saveWorkspaceForm.get("published").value
      );
      formData.append("categories", JSON.stringify(this.selectedMembers));
      formData.append("workspace_id", this.workspace._id);
      if (this.workspace.status) {
        this.myProfileService
          .editMyWorkspaces(this.workspace._id, formData)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              this.helperService.showSuccessToast(jresponse.message);
              this.modalService.hide(1);
              this.helperService.wsdescription = "";
              this.helperService.wsName = "";
              this.homeService.getMyWorkspaces(this.userId);
              // this.saveWorkspaceForm.reset();
            }
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.message);
            throw err;
          });
      } else {
        this.myProfileService
          .saveMyWorkspaces(formData)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              this.helperService.showSuccessToast(jresponse.message);
              this.modalService.hide(1);
              this.helperService.wsdescription = "";
              this.helperService.wsName = "";
              this.homeService.getMyWorkspaces(this.userId);
              // this.saveWorkspaceForm.reset();
            }
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.message);
            throw err;
          });
      }
      this.submitted = false;
    }
  }
  hideShowApps(option) {
    if (option) {
      this.displayApps = false;
    } else {
      this.displayApps = !this.displayApps;
    }
  }
  removeSelectedAppUser(user) {
    this.categoryList.forEach((element) => {
      if (element._id === user._id) {
        element.isSelected = false;
      }
    });
  }
  selectApp(app) {
    this.categoryList.forEach((element) => {
      if (element._id === app._id) {
        element.isSelected = true;
      }
    });
  }

  addRecord(event, type = "", index = "") {
    if (this.selectedMembers.length > 3) {
      this.helperService.showErrorToast("You can choose up to 4 categories");
    } else {
      this.categoryList.splice(index, 1);
      this.selectedMembers.push(event);
    }
  }
  removeMember(member, index) {
    this.selectedMembers.splice(index, 1);
    this.categoryList.push(member);
  }
  closeModal(level) {
    this.modalService.hide(level);
  }
  getBannerImage() {
    this.helperService.wsName = this.saveWorkspaceForm.get("title").value;
    this.helperService.wsdescription = this.saveWorkspaceForm.get(
      "description"
    ).value;
    this.workspace.categories = this.selectedMembers;
    this.workspace.published = this.saveWorkspaceForm.get("published").value;
    let initialState = {
      workspace: this.workspace,
    };
    const modalParams = Object.assign(
      {},
      { initialState, class: "small-custom-modal",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
    this.homeService.uploadWSModalRef = this.modalService.show(
      BannersComponent,
      modalParams
    );
  }
  toggleHelpText(label) {
    if (this.showHelpText === label) {
      this.showHelpText = "";
    } else {
      this.showHelpText = label;
    }
  }
}
