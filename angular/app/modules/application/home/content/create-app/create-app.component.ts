import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

import { HelperService } from "src/app/services/helper.service";
import { CreateAppService } from "./create-app.service";
import { JReponse } from "src/app/services/api.service";
import { AppViewService } from "../../application-view/application-view.service";
import { HomeService } from "../../home.service";
@Component({
  selector: "app-create-app",
  templateUrl: "./create-app.component.html",
  styleUrls: ["./create-app.component.scss"],
})
export class CreateAppComponent implements OnInit {
  createAppForm: FormGroup;
  workspaceId: string;
  isSubmitted: boolean;
  modalRef: BsModalRef | null;
  isEdit;
  workspace_id_for_edit;
  application_id_for_edit;
  appName_for_edit;
  appDescription_for_edit;
  flagForContributed;

  constructor(
    private helperService: HelperService,
    private createAppService: CreateAppService,
    private router: Router,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
    public appViewService: AppViewService,
    private homeService: HomeService
  ) {
    this.resetForm();
  }

  ngOnInit() {
    if (this.isEdit) {
      this.setEditForm(this.appName_for_edit, this.appDescription_for_edit);
    }
  }

  resetForm() {
    this.createAppForm = new FormGroup({
      name: new FormControl("", [Validators.required]),
      description: new FormControl(""),
    });
  }

  setEditForm(name, desc) {
    this.createAppForm.get("name").setValue(name);
    this.createAppForm.get("description").setValue(desc);
  }

  setTextAreaLength(id) {
    const element = document.getElementById(id);
    element.style.height = "1px";
    element.style.height = 2 + element.scrollHeight + "px";
  }

  submitForm() {
    this.isSubmitted = true;
    const isValidForm = this.createAppForm.valid;
    if (isValidForm) {
      this.isSubmitted = false;
      const token = this.helperService.loggedUser.token;
      this.createAppForm.value.workspace_id = this.workspaceId;
      if (!this.isEdit) {

        var name = this.createAppForm.value.name;
        name=this.helperService.removeTags(name);
        this.createAppForm.value.name = name;
       var description= this.createAppForm.value.description;
       description=this.helperService.removeTags(description);
       this.createAppForm.value.description=description;

        this.createAppService
          .createApp(this.createAppForm.value, token)
          .then((jresponse: JReponse) => {
            if (jresponse.success) {
              this.modalService.hide(1);
              this.helperService.showSuccessToast(jresponse.message);
              const sendData = {
                appId: jresponse.body.application_id,
                orgId: jresponse.body.organization_id,
                workspaceId: this.workspaceId,
                flagForContributed: this.flagForContributed,
              };
              this.router.navigate(["application/home/application-builder"], {
                queryParams: sendData,
              });
            }
          })
          .catch((err: Error) => {
            this.modalService.hide(1);
            this.helperService.showErrorToast(err.message);
            throw err;
          });
      } else {
        var name= this.createAppForm.get("name").value;
        name=this.helperService.removeTags(name);
        var desc= this.createAppForm.get("description").value;
        desc=this.helperService.removeTags(desc);
        const data = {
          workspace_id: this.workspace_id_for_edit,
          application_id: this.application_id_for_edit,
          name: name,
          description: desc,
        };
        this.createAppService
          .editApp(data, token)
          .then((jresponse: JReponse) => {
            if (jresponse.success) {
              this.appViewService.refreshApps(
                this.workspace_id_for_edit,
                this.homeService.wsRole
              );
              this.modalService.hide(1);
              this.helperService.showSuccessToast(jresponse.message);
            }
          })
          .catch((err: Error) => {
            this.helperService.showErrorToast(err.message);
            throw err;
          });
      }
    }
  }
}
