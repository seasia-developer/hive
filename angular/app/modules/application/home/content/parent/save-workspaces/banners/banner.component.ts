import { Component, OnInit, TemplateRef, ChangeDetectionStrategy, ViewChild, ElementRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { HelperService } from "src/app/services/helper.service";
import { JReponse ,APIService} from "src/app/services/api.service";
import { environment } from "src/environments/environment";
import {SaveWorkspacesComponent} from "../save-workspaces.component";
import { HomeService } from '../../../../../home/home.service';
@Component({
  selector: "banners",
  templateUrl: "./banner.component.html",
  styleUrls: ["./banner.component.scss"],
})
export class BannersComponent implements OnInit {

  env = environment;
  userId;
  workspace;
  mediaURL;
  modalRef: BsModalRef | null;
  workspaceBanner = [];
  constructor(private modalService: BsModalService, 
    private apiService:APIService,
    private helperService: HelperService,

    private homeService: HomeService,
     ) {
  }


  ngOnInit() {
    if (this.homeService.addWSModalRef) {
      this.homeService.addWSModalRef.hide();
    }
   this.mediaURL = environment.MEDIA_URL;
    this.getWorkspaceBanner();
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
  
  closeModal() {
    this.homeService.uploadWSModalRef.hide();
    let initialState={
      workspace:this.workspace
    }
    this.homeService.addWSModalRef = this.modalService.show(SaveWorkspacesComponent, {initialState, class: 'big-custom-modal',animated: true,
    keyboard: true,
    backdrop: false,
    ignoreBackdropClick: true });
 
  }
  selectImage(image){
    this.workspace.name=this.helperService.wsName;
    this.workspace.description=this.helperService.wsdescription
  
    let initialState={
      bannerImage:image,
      workspace:this.workspace
    }
   // this.modalService.hide(2)
   const modalParams = Object.assign({}, { initialState, class: 'big-custom-modal',animated: true,
   keyboard: true,
   backdrop: false,
   ignoreBackdropClick: true });
  
   this.homeService.addWSModalRef = this.modalService.show(SaveWorkspacesComponent, modalParams);


  }
}
