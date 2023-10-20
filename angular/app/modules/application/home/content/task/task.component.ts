import {
  Component,
  OnInit,
  TemplateRef,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from "moment";

import { APIService, JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { Constants } from "src/app/constants/constants";
import { environment } from "src/environments/environment";
import { HomeService } from "../../home.service";
import { UploadOrgContentComponent } from "../organisation-setup/upload-org-content/upload-org-content.component";
export let selectedMentionUsers = [];
import { Subscription } from "rxjs";
import { AppViewService } from '../../application-view/application-view.service';

@Component({
  selector: "app-task",
  templateUrl: "./task.component.html",
  styleUrls: ["./task.component.scss"],
})
export class TaskComponent implements OnInit, OnDestroy {
  modalRef: BsModalRef;
  addTaskForm: FormGroup;
  submitted = false;
  applications = [];
  tasks = [];
  applicationUsers = [];
  selectedApps = [];
  displayApps = false;
  displayAppUsers = false;
  statusList = [];
  activeTab = "";
  isEdit = false;
  selectedTaskId;
  imageData = [];
  updatedImageData = [];
  imageDataPreview = [];
  imagePreview;
  tomorroww = new Date();
  mediaUrl;
  imagePrevOfRes = false;
  taskType = "my";
  attachmentData: any;
  updateNewImage = [];
  mainObj;
  type = "edit";
  temp = [];
  isActivity = true;
  activities = [];
  comments = [];
  userData;
  completedTask = [];
  emptyComment = "&nbsp;";
  mentionUserList = [];
  isMentionUserSelect = true;
  canAddComment = true;
  refreshCommentSubscription = new Subscription();

  @ViewChild("myDiv", { static: false }) myDiv: ElementRef<HTMLElement>;

  constructor(
    private modalService: BsModalService,
    private fb: FormBuilder,
    private apiService: APIService,
    private helperService: HelperService,
    private homeService: HomeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appViewService: AppViewService,
  ) {
    this.activeTab = "my";
    this.statusList = Constants.TASK_STATUS;
  }

  ngOnInit() {
    this.refreshCommentSubscription = this.apiService
    .getTaskCommentFlag()
    .subscribe(async (flag) => {
      this.addComment(flag)
    });
    this.getImages();
    this.userData = this.helperService.getLocalStore("userData");
    this.mediaUrl = environment.MEDIA_URL;
    this.getTasks("my");
    this.getApplications();
    this.addTaskForm = this.fb.group({
      title: ["", [Validators.required]],
      description: ["", [Validators.required]],
      status: ["", [Validators.required]],
      dueDate: ["", [Validators.required]],
      dueTime: [""],
      avatar: [""]
    });
    if (this.activatedRoute.snapshot.queryParams.openTaskModal) {
      document.getElementById("add-task-button").click();
    }
  }

  goToPublicProfile(id) {
    this.router.navigate(["/application/home/parent/public-profile"], {
      queryParams: {
        userId: id,
      },
    });
  }

  activeTabChange(status: string) {
    this.activeTab = status;
  }

  get form() {
    return this.addTaskForm.controls;
  }

  getApplications() {
    this.apiService
      .getWithHeader("task/appList")
      .then((jresponse: JReponse) => {
        this.applications = jresponse.body;
        if (this.applications.length) {
          this.applications = this.applications.filter((element) => {
            return element !== null;
          });
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  openUploadModal() {
    const initialState = { caller: "addTask", uploadType: "multiple" };
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
    // document.getElementById("myFile").click();
  }

  addRecord(event) {
    this.imagePrevOfRes = false;
    if (event.addedFiles) {
      this.imagePreview = event.addedFiles[0];
      event.addedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (!this.isEdit) {
            this.imageData.push({
              source: e.target.result,
              sendingData: file,
            });
          } else {
            this.updateNewImage.push({
              source: e.target.result,
              sendingData: file,
            });
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      this.imagePreview = event.target.files[0];
      if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (!this.isEdit) {
            this.imageData.push({
              source: e.target.result,
              sendingData: this.imagePreview,
            });
          } else {
            this.updateNewImage.push({
              source: e.target.result,
              sendingData: this.imagePreview,
            });
          }
        };
        reader.readAsDataURL(event.target.files[0]);
      }
    }
  }

  async getApplicationUsers(appId) {
    await this.apiService
      .getWithHeader(`task/${appId}/userList`)
      .then((jresponse: JReponse) => {
        this.applicationUsers = jresponse.body;
        this.applicationUsers = this.applicationUsers.map((element) => {
          return { ...element, isSelected: false };
        });
      })
      .catch((err: any) => {
        throw err;
      });
  }

  get selectedAppUsersTrue() {
    return this.applicationUsers.filter((e) => e.isSelected === true);
  }

  get selectedAppUsersFalse() {
    return this.applicationUsers.filter((e) => e.isSelected === false);
  }

  hideShowApps(option) {
    if (option) {
      this.displayApps = false;
    } else {
      this.displayApps = !this.displayApps;
    }
  }

  hideShowAppUsers(option) {
    if (option) {
      this.displayAppUsers = false;
    } else {
      if (this.selectedApps.length > 0) {
        this.displayAppUsers = !this.displayAppUsers;
      } else {
        this.helperService.showErrorToast("Please select app record first");
      }
    }
  }

  selectApp(app, innerApp) {
    if (app) {
      this.applications.forEach((elem) => {
        if (elem.workspace_id === app.workspace_id) {
          elem.application.forEach((e) => {
            if (e._id === innerApp._id) {
              this.selectedApps = [];
              this.selectedApps.push({
                ...e,
                workspaceName: elem.workspaceName,
                workspace_id: elem.workspace_id,
              });
              this.getApplicationUsers(this.selectedApps[0]._id);
            }
          });
        }
      });
    }
  }

  selectAppUser(appUser) {
    this.applicationUsers.forEach((element) => {
      if (element._id === appUser._id) {
        element.isSelected = true;
      }
    });
  }

  removeSelectedAppUser(user) {
    this.applicationUsers.forEach((element) => {
      if (element._id === user._id) {
        element.isSelected = false;
      }
    });
  }

  add() {
    this.submitted = true;
    if (
      this.addTaskForm.valid &&
      this.selectedApps.length > 0 &&
      this.selectedAppUsersTrue.length > 0
    ) {
      const formData = new FormData();
      formData.append("title", this.addTaskForm.get("title").value);
      formData.append("description", this.addTaskForm.get("description").value);
      formData.append(
        "application_id",
        this.selectedApps.length > 0 ? this.selectedApps[0]._id : ""
      );
      formData.append("status", this.addTaskForm.get("status").value);
      if (!this.isEdit) {
        for (let index = 0; index < this.imageData.length; index++) {
          const element = this.imageData[index];
          formData.append("avatar[]", element.sendingData);
        }
      } else {
        for (let index = 0; index < this.updateNewImage.length; index++) {
          const element = this.updateNewImage[index];
          formData.append("avatar[]", element.sendingData);
        }
      }
      formData.append(
        "dueDate",
        moment(this.addTaskForm.get("dueDate").value).format("DD/MM/yyyy")
      );
      formData.append("dueTime", this.addTaskForm.get("dueTime").value);
      for (let index = 0; index < this.selectedAppUsersTrue.length; index++) {
        const element = this.selectedAppUsersTrue[index];
        formData.append("assignedTo[" + index + "]", element._id);
      }
      if (!this.isEdit) {
        this.apiService
          .postWithHeader("task/addTask", formData)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              this.helperService.showSuccessToast(jresponse.message);
            }
            this.addTaskForm.reset();
            this.selectedApps = [];
            this.imageData = [];
            this.applicationUsers = this.applicationUsers.map((element) => {
              return { ...element, isSelected: false };
            });
            this.getTasks(this.taskType);
            this.triggerFalseClick();
            this.closeModal();
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.error);
            throw err;
          });
      } else {
        if (this.type === "remove") {
          formData.append("attachmentData", JSON.stringify(this.mainObj));
        } else {
          formData.append(
            "attachmentData",
            JSON.stringify(this.attachmentData)
          );
        }
        formData.append("type", this.type);
        this.apiService
          .postWithHeader(`task/${this.selectedTaskId}/editTask`, formData)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              this.helperService.showSuccessToast(jresponse.message);
            }
            this.addTaskForm.reset();
            this.selectedApps = [];
            this.applicationUsers = this.applicationUsers.map((element) => {
              return { ...element, isSelected: false };
            });
            this.getTasks(this.taskType);
            this.closeModal();
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.error);
            throw err;
          });
      }
      this.submitted = false;
    }
  }

  async getUsersForMention(wsId: string) {
    const orgId = this.helperService.getLocalStore("selectedOrgId");
    await this.appViewService
      // .get(`/organization/${orgId}/members`)
      .getAllMembersEmployeesOfOrgAndWS(orgId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.mentionUserList = [];
          this.mentionUserList = jresponse.body;
          this.apiService.members = this.mentionUserList;
          this.mentionUserList = this.mentionUserList.filter((element) => {
            return element !== null;
          });
          if (this.mentionUserList.length) {
            this.mentionUserList = this.mentionUserList.map((e) => {
              return {
                fullName: e.firstName + " " + e.lastName,
              };
            });
          }
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  async getTasks(type) {
    await this.apiService
      .getWithHeader("task/taskList?type=" + type)
      .then((jresponse: JReponse) => {
        if (type === "all") {
          this.completedTask = jresponse.body;
        } else {
          this.tasks = jresponse.body;
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  get overdue() {
    const todaysTask = [];
    this.tasks.forEach((element) => {
      if (
        moment().isAfter(element.dueDate) &&
        !moment().isSame(element.dueDate, "day")
      ) {
        todaysTask.push(element);
      }
    });
    return todaysTask;
  }

  get today() {
    const todaysTask = [];
    this.tasks.forEach((element) => {
      if (moment().isSame(element.dueDate, "day")) {
        todaysTask.push(element);
      }
    });
    return todaysTask;
  }

  get tomorrow() {
    const todaysTask = [];
    this.tasks.forEach((element) => {
      if (moment().add(1, "days").isSame(element.dueDate, "day")) {
        todaysTask.push(element);
      }
    });
    return todaysTask;
  }

  triggerFalseClick() {
    const el: HTMLElement = this.myDiv.nativeElement;
    el.click();
  }

  get later() {
    const todaysTask = [];
    this.tasks.forEach((element) => {
      if (
        !moment().add(1, "days").isSame(element.dueDate, "day") &&
        moment().isBefore(element.dueDate)
      ) {
        todaysTask.push(element);
      }
    });
    return todaysTask;
  }

  removeImg(index) {
    this.imageData.splice(index, 1);
  }

  removeUpdatedNewImg(index) {
    this.updateNewImage.splice(index, 1);
  }

  removeUpdatedImg(index) {
    this.temp.push(this.attachmentData[index]);
    this.attachmentData.splice(index, 1);
    this.updatedImageData.splice(index, 1);
    this.mainObj = {
      toRemove: this.temp,
      toSave: this.attachmentData,
    };
    this.type = "remove";
  }

  async setEditForm(data) {
    this.updatedImageData = [];
    this.attachmentData = [...data.avatar];
    this.imagePrevOfRes = true;
    this.addTaskForm.get("title").setValue(data.title);
    this.addTaskForm.get("description").setValue(data.description);
    this.selectedApps = [];
    this.applications.forEach((element) => {
      element.application.forEach((elem) => {
        if (elem.name === data.applicationId.name) {
          this.selectedApps.push({
            ...elem,
            workspaceName: element.workspaceName,
            workspace_id: element.workspace_id,
          });
        }
      });
    });
    await this.getApplicationUsers(this.selectedApps[0]._id);
    const tempAssignedUsers = data.assigned_to_id.split(",");
    this.applicationUsers.forEach((element) => {
      if (tempAssignedUsers.length > 1) {
        tempAssignedUsers.forEach((innerElement) => {
          if (element._id === innerElement) {
            element.isSelected = true;
            this.selectedAppUsersTrue.push(element);
          }
        });
      } else {
        if (element._id === tempAssignedUsers[0]) {
          element.isSelected = true;
          this.selectedAppUsersTrue.push(element);
        }
      }
    });
    data.avatar.forEach((element) => {
      this.updatedImageData.push({
        source: element.attachment.path,
        sendingData: element.attachment.path,
      });
    });
    this.addTaskForm.get("status").setValue(data.status);
    this.addTaskForm.get("dueDate").setValue(new Date(data.dueDate));
    this.addTaskForm.get("dueTime").patchValue(data.dueTime);
  }

  openModal(template: TemplateRef<any>, item?, status?, taskType?) {
    this.submitted = false;
    if (taskType) {
      this.taskType = taskType;
    }
    if (status === "edit") {
      if (item.applicationId.workspace_id) {
        this.getUsersForMention(item.applicationId.workspace_id);
      }
      this.selectedTaskId = item._id;
      this.isEdit = true;
      this.setEditForm(item);
      this.getTaskComments(this.selectedTaskId);
      this.getTaskActivities(this.selectedTaskId);
      const initialState = { class: "task-modal",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true };
      this.modalRef = this.modalService.show(template, initialState);
    } else {
      this.isEdit = false;
      this.clearForm();
      const initialState = { class: "task-modal-add",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true };
      this.modalRef = this.modalService.show(template, initialState);
    }
  }
  falseMentionUserSelect() {
    this.isMentionUserSelect = false;
  }

  trueMentionUserSelect() {
    setTimeout(() => {
      this.isMentionUserSelect = true;
    }, 250);
  }

  async getTaskComments(taskId) {
    await this.apiService
      .getWithHeader(`task/${taskId}/comments`)
      .then((jresponse: JReponse) => {
        this.comments = jresponse.body;
      })
      .catch((err: any) => {
        throw err;
      });
  }

  itemMentioned(tag) {
    const data = {
      id: `{{${tag._id}}}`,
      name: tag.fullName,
    };
    selectedMentionUsers.push(data);
    const el = document.getElementById("commentBox");

    let image = "../../../../../assets/images/user.png";
    if (tag.avatar) {
      image = `${environment.MEDIA_URL}/${tag.avatar}`;
    }
    // let formatedText = `<b>${tag.fullName}</b>&nbsp;`;
    // const formatedText = `
    // <div contenteditable="false" class="commnet-mention-wrrapper">
    //     <img class="commnet-mention-user-image" src="${image}">
    //     <label class="commnet-mention-user-label">
    //       ${tag.fullName}
    //     </label>
    // </div>&nbsp;`;
    const formatedText = `<div contenteditable="false" class="client-name"><img src="${image}"> ${tag.fullName} </div>`;

    let oldValue = el.innerHTML;
    el.innerHTML = "";
    // oldValue = oldValue.replace("@", "");
    var atIndex = oldValue.indexOf("@");
    oldValue = oldValue.substring(0, atIndex);
    oldValue = oldValue + " " + formatedText;
    el.innerHTML = oldValue;
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
    range.detach(); // optimization
    // set scroll to the end if multiline
    el.scrollTop = el.scrollHeight;
    return "";
  }
  async addComment(commentText) {

    const data = {
      comment: commentText,
    };
    await this.apiService
      .postWithHeader(`task/${this.selectedTaskId}/addTaskComment`, data)
      .then((jresponse: JReponse) => {
        this.canAddComment = true;
        this.apiService.sendMentionData({ comment: "", comment_for_update: "", selectedMentionUsers:[] });
        this.getTaskActivities(this.selectedTaskId);
        this.getTaskComments(this.selectedTaskId);
        this.helperService.showSuccessToast(jresponse.message);
      })
      .catch((err: any) => {
        this.canAddComment = true;
        this.helperService.showErrorToast(err.error);

        throw err;
      });


  }
  async addTaskComments(event) {
    let commentText = event.target.innerText;
    selectedMentionUsers.forEach((element) => {
      commentText = commentText.replace(element.name, element.id);
    });
    commentText = commentText.trim()
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 13 && event.shiftKey) {
      this.canAddComment = true;
      event.stopPropagation();
    } else if (charCode == 13 && this.isMentionUserSelect && commentText.length && this.canAddComment) {
      event.preventDefault();
      this.canAddComment = false;
      const data = {
        comment: commentText,
      };
      await this.apiService
        .postWithHeader(`task/${this.selectedTaskId}/addTaskComment`, data)
        .then((jresponse: JReponse) => {
          this.canAddComment = true;
          event.srcElement.value = "";
          event.target.innerText = "";
          this.getTaskActivities(this.selectedTaskId);
          this.getTaskComments(this.selectedTaskId);
          this.helperService.showSuccessToast(jresponse.message);
        })
        .catch((err: any) => {
          this.helperService.showErrorToast(err.error);
          event.srcElement.value = "";
          throw err;
        });
    }

  }

  getImages() {
    this.homeService.taskImages.subscribe((images) => {
      this.addRecord({ addedFiles: images });
      this.homeService.uploadModalRef.hide();
    });
  }

  callTaskActivities() {
    this.isActivity = true;
    this.getTaskActivities(this.selectedTaskId);
  }

  callTaskComments() {
    this.isActivity = false;
    this.getTaskComments(this.selectedTaskId);
  }

  async getTaskActivities(taskId) {
    await this.apiService
      .getWithHeader(`task/${taskId}/activities`)
      .then((jresponse: JReponse) => {
        this.activities = jresponse.body;
      })
      .catch((err: any) => {
        throw err;
      });
  }

  clearForm() {
    this.addTaskForm.reset();
    this.selectedApps = [];
    this.imageData = [];
    this.applicationUsers = this.applicationUsers.map((element) => {
      return { ...element, isSelected: false };
    });
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  ngOnDestroy() {
    this.closeModal();
  }
}
