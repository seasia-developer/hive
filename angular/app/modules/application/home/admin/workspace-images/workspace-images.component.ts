import { Component, OnInit } from "@angular/core";

import { JReponse, APIService } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { environment } from "src/environments/environment";
import { HomeService } from '../../home.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ParentService } from '../../content/parent/parent.service';
import { UploadOrgContentComponent } from '../../content/organisation-setup/upload-org-content/upload-org-content.component';

@Component({
  selector: "app-workspace-images",
  templateUrl: "./workspace-images.component.html",
  styleUrls: ["./workspace-images.component.scss"],
})
export class WorkspaceImagesComponent implements OnInit {
  workspaceBanner = [];
  imageData: any;
  imagePreview: any;
  mediaURL;

  constructor(
    private apiService: APIService,
    private helperService: HelperService,
    private homeService: HomeService,
    private modalService: BsModalService,
    private parentService: ParentService
  ) {}

  ngOnInit() {
    this.getBanners();
    this.mediaURL = environment.MEDIA_URL;
    this.getWorkspaceBanner();
  }

  // callFileUpload() {
  //   document.getElementById("addOrgAvatar").click();
  // }

  openUploadModal() {
    const initialState = {caller: "banners", uploadType: "single"};
    const modalParams = { initialState, class: "small-custom-modal",animated: true,
    keyboard: true,
    backdrop: false,
    ignoreBackdropClick: true };
    this.homeService.uploadModalRef = this.modalService.show(UploadOrgContentComponent, modalParams);
  }

  getBanners() {
    this.parentService.banners.subscribe( image => {
      this.fileupload(image);
      this.homeService.uploadModalRef.hide();
    });
  }

  fileupload(image) {
    this.imageData = image;
    if (image) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // this.imagePreview = e.target.result;
        this.addWorkspaceBanner();
      };
      reader.readAsDataURL(image);
    }
  }

  removeImage(id) {
    this.imageData = "";
    this.imagePreview = "";
    this.deleteWorkspaceBanner(id);
  }

  async getWorkspaceBanner() {
    await this.apiService
      .getWithHeader(`admin/addWorkspaceBanner`)
      .then((jresponse: JReponse) => {
        this.workspaceBanner = jresponse.body;
      })
      .catch((err: any) => {
        throw err;
      });
  }

  async deleteWorkspaceBanner(id) {
    await this.apiService
      .deleteWithHeader(`admin/${id}/deleteWorkspaceBanner`)
      .then((jresponse: JReponse) => {
        this.getWorkspaceBanner();
        this.helperService.showSuccessToast(jresponse.message);
      })
      .catch((err: any) => {
        throw err;
      });
  }

  addWorkspaceBanner() {
    const formData = new FormData();
    formData.append("image", this.imageData);
    this.apiService
      .postWithHeader(`admin/addWorkspaceBanner`, formData)
      .then((jresponse: JReponse) => {
        this.helperService.showSuccessToast(jresponse.message);
        this.getWorkspaceBanner();
      })
      .catch((err: any) => {
        throw err;
      });
  }
}
