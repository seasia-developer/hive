import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormArray, Validators, FormGroup } from '@angular/forms';
import { HomeService } from '../../home.service';
import { Constants } from 'src/app/constants/constants';
import { environment } from 'src/environments/environment';
import { AppViewService } from '../application-view.service';
import { JReponse, APIService } from 'src/app/services/api.service';
import { v4 as uuid } from "uuid";
import { HelperService } from 'src/app/services/helper.service';
import * as _ from "lodash";
import { MentionDirective } from 'angular-mentions';
import { UploadOrgContentComponent } from '../../content/organisation-setup/upload-org-content/upload-org-content.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import diff from "simple-text-diff";
import * as moment from "moment";
import { Router } from '@angular/router';
import { UpgradePopupComponent } from '../../upgrade/upgrade-popup/upgrade-popup.component';
import { IfStmt } from '@angular/compiler';
import { HelperFunctions } from "../../../../helpers/index.service";
export let selectedMentionUsers = [];

@Component({
  selector: 'app-record-modal',
  templateUrl: './record-modal.component.html',
  styleUrls: ['./record-modal.component.scss']
})
export class RecordModalComponent implements OnInit, OnDestroy {
  @ViewChild("recordScrollContainer", { static: false }) private myScrollContainer: ElementRef;
  @ViewChild(MentionDirective, { static: false }) mention: MentionDirective;

  // Field types related variables
  phoneTypes = Constants.PHONE_TYPES;
  emailTypes = Constants.EMAIL_TYPES;
  moneyTypes = Constants.CURRENCY_TYPES;
  appFieldTypes = Constants.APP_FIELD_TYPES;
  appRecords;
  displayApps = false;
  selectedRecord = [];
  appForm: any;
  recordData: any;
  phoneArray: FormArray;
  emailArray: FormArray;
  members: any;
  membersList = {};
  appComments: any;
  appActivities: any;
  editSessionId: any;
  appFields: any;
  recordFormValues: any;
  linkPreviewData: any;
  progressData: any = {};
  mapData: any = {};
  selectedItems: any = {};
  selectedMembers: any = {};
  setTextArea = [];
  formSet = false;
  membersListMenu: any;
  imageData: File[] = [];
  mapSuggestion: any = {};
  imageDisplayData: any = {};
  attachmentData: any = {};
  recordId: any;
  appId: any;
  workspaceId: any;
  selectedModalTab = "activity";
  canAddComment: any = true;
  selectedCategoryOptions = {};
  selectedCategoryMultipleOptions = {};
  showCategoryDropdown = '';
  showHelpText;
  type = "shared";
  orgId = "";
  dpValue: { event: any; field: any; type: any };
  dpValueChanged = false;
  dpShown = false;
  followers = [];
  userData: any = {};
  editComment = "&nbsp;";
  commentId = "";
  createdByUserList = [];
  isMentionUserSelect = true;
  mentionUsersList = [];
  showProgress: boolean;
  progress: number;
  prevIndex;
  nextIndex;
  currentLeftIndex;
  currentRightIndex;
  leftRecord;
  rightRecord;
  revisionRecord;
  leftVal = "";
  rightVal = "";
  leftValue: any;
  recordName = "";
  revisionModalRef: BsModalRef | null;
  modalRef: BsModalRef | null;
  mediaUrl = environment.MEDIA_URL;
  selectedImageField: any = {};
  uploadImageSubscription = new Subscription();
  carouselImages = [];
  filterFields: any[];
  createdByUserKeyword = "";
  showValidationErrors = false;

  recordCategory: any;
  showModal = false;
  newMultiValueRecordData: any;
  activeApplication: any;
  selectedWorkspace: any;
  openingModal = true;

  isModalOpen: boolean;


  suggestedUsers: any;
  shareRecordMessage: any;
  selectedShareRecordUsers: any;
  selectedShareRecordUserIds: any;
  shareRecordEmailOnly: string;
  showRecordEmailOnly = false;
  shareRecordModalType = "record";
  shareWorkspaceRole = "member";
  showWorkspaceRoleOptions = false;
  workspaceAppsList = [];
  showUpgradePlanPopup = false;
  orgPlan: any;
  relationSearch = false;
  refreshCommentSubscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private homeService: HomeService,
    private appViewService: AppViewService,
    private helperService: HelperService,
    private apiService: APIService,
    private cdRef: ChangeDetectorRef,
    private modalService: BsModalService,
    private router: Router,
    public helperFunctions: HelperFunctions,
  ) { }

  async ngOnInit() {
    this.refreshCommentSubscription = this.appViewService
      .getRecordCommentFlag()
      .subscribe(async (flag) => {
        this.addRecordComment(flag)
      });
    this.editSessionId = uuid();
    this.appForm = this.fb.group({});
    this.userData = this.helperService.getLocalStore("userData");
    if (this.type === "shared") {
      this.orgId = this.recordData.record.record_id.organization_id;
      this.followers = this.recordData.record.record_id.followers;
      this.recordId = this.recordData.record.record_id._id;
      this.appFields = this.recordData.record.record_id.application_id.fields;
      this.recordFormValues = this.recordData.data;
      this.appId = this.recordData.record.record_id.application_id._id;
      this.workspaceId = this.recordData.record.record_id.workspace_id;
    }
    this.members = await this.getWsUsers(this.workspaceId);
    await this.getMembers();
    this.setForm(this.appFields);
    this.uploadedImages();
    this.setFilterFields();
    console.log('test123')
  }

  closeModal() {
    this.homeService.recordModalRef.hide();
  }

  followRecord(recordId = this.recordId) {
    this.apiService.postWithHeader(`record/follow`, { recordId })
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          if (this.followers.includes(this.userData.owner)) {
            this.followers.splice(this.followers.indexOf(this.userData.owner), 1);
          } else {
            this.followers.push(this.userData.owner);
          }
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  getMembers() {
    return new Promise((resolve, reject) => {
      const orgId = this.type === "shared" ? this.recordData.record.organization_id._id : this.orgId;
      this.appViewService
        .getAllMembersEmployeesOfOrgAndWS(orgId)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.mentionUsersList = jresponse.body;
            this.appViewService.members = this.mentionUsersList;
            this.mentionUsersList = this.mentionUsersList.filter(
              (element) => {
                return element !== null;
              }
            );
            if (this.mentionUsersList.length) {
              this.mentionUsersList = this.mentionUsersList.map((e) => {
                return {
                  fullName: e.lastName && !_.isEmpty(e.lastName) ? e.firstName + ' ' + e.lastName : e.firstName,
                };
              });
            }
            resolve(jresponse.body);
          }
        })
        .catch((err: Error) => {
          reject(err);
          throw err;
        });
    })
  }

  itemMentioned(tag) {
    const data = {
      id: `{{${tag._id}}}`,
      name: tag.fullName,
    };

    selectedMentionUsers.push(data);
    const el = document.getElementById("commentSectionRecord");

    let image = "../../../../../assets/images/user.png";
    if (tag.avatar) {
      image = `${environment.MEDIA_URL}/${tag.avatar}`;
    }
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

  openUploadModal(field) {

    if ((this.recordData && !this.recordData.record.readOnly) || (!this.recordData)) {
      this.selectedImageField = field;
      const initialState = { caller: "addRecord", uploadType: "multiple" };
      const modalParams = Object.assign(
        {},
        { initialState, class: "small-custom-modal",animated: true,
        keyboard: true,
        backdrop: true,
          ignoreBackdropClick: false }
      );
      this.homeService.uploadModalRef = this.modalService.show(
        UploadOrgContentComponent,
        modalParams
      );
    }
  }

  uploadedImages() {
    this.uploadImageSubscription = this.appViewService.uploadedImages.subscribe(
      async (images) => {
        if (this.selectedImageField) {
          this.showProgress = true;
          this.progress = 1;
          const interval = setInterval(() => {
            if (this.progress < 80) {
              this.progress += 1;
            }
          }, 500);

          await this.addRecord({ addedFiles: images }, this.selectedImageField);
          clearInterval(interval);
          for (let i = this.progress; i <= 100; i++) {
            setTimeout(() => {
              this.progress = i;
              if (this.progress === 100) {
                this.showProgress = false;
              }
            }, 0);
          }
        }
      }
    );
  }

  async getWsUsers(wsId: string) {
    return new Promise((resolve, reject) => {
      this.appViewService
        .mentionUserForComment(wsId, "")
        .then((jresponse: JReponse) => {
          resolve(jresponse.body);
        })
        .catch((err: Error) => {
          throw err;
        });
    });
  }

  setForm(appFields, hiddenFieldsOnly = false) {
    appFields.forEach((field) => {
      switch (field.type) {
        case Constants.APP_FIELD_TYPES.RELATIONSHIP:


        case Constants.APP_FIELD_TYPES.TEXT:
        case Constants.APP_FIELD_TYPES.NUMBER:

        case Constants.APP_FIELD_TYPES.LINK:
          this.appForm.addControl(
            field.label,
            new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }, { updateOn: "blur" })
          );
          break;

        case Constants.APP_FIELD_TYPES.PHONE:
          this.appForm.addControl(
            field.label,
            new FormArray([this.addPhoneArrayControl()])
          );
          break;

        case Constants.APP_FIELD_TYPES.EMAIL:
          this.appForm.addControl(
            field.label,
            new FormArray([this.addEmailArrayControl()])
          );
          break;

        case Constants.APP_FIELD_TYPES.MONEY:
          this.appForm.addControl(
            field.label,
            new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }, { updateOn: "blur" })
          );
          this.appForm.addControl(
            `${field.label}Type`,
            new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "Select Type" })
          );
          break;

        case Constants.APP_FIELD_TYPES.MEMBER:
          this.membersList[field.label] = JSON.parse(
            JSON.stringify(this.members)
          );
          this.membersList[field.label].map((member) => {
            if (
              member.avatar &&
              member.avatar !== "undefined"
            ) {
              member.avatar =
                environment.MEDIA_URL + member.avatar;
            } else {
              member.avatar = "../../../../../assets/images/user.png";
            }
          });
          break;

        case Constants.APP_FIELD_TYPES.CATEGORY:
          this.appForm.addControl(
            field.label,
            new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" })
          );
          break;

        case Constants.APP_FIELD_TYPES.DURATION:
          this.appForm.addControl(
            field.label,
            this.durationControl(field.options)
          );
          break;

        case Constants.APP_FIELD_TYPES.PROGRESS:
          this.appForm.addControl(field.label, new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }));
          break;
        case Constants.APP_FIELD_TYPES.IMAGE:
          this.appForm.addControl(field.label, new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }));
          break;
        case Constants.APP_FIELD_TYPES.LOCATION:
          if (field.options.display === "Single line address") {
            this.appForm.addControl(field.label, new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }));
          } else {
            this.appForm.addControl(field.label, this.locationControl());
          }
          break;

        case Constants.APP_FIELD_TYPES.DATE:
          this.appForm.addControl(
            field.label,
            new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }, { updateOn: "blur" })
          );
          if (field.options.display === "Show end date") {
            this.appForm.addControl(
              field.label + "End",
              new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }, { updateOn: "blur" })
            );
          }
          break;
      }
    });
    this.formSet = true;
    this.setFormValues();
  }


  arrayControl(label) {
    return (this.appForm.get(label) as FormArray).controls;
  }

  // For phone array controls
  addAnotherPhone(label, data = {}) {
    this.phoneArray = this.appForm.get(label) as FormArray;
    this.phoneArray.push(this.addPhoneArrayControl(data));
  }

  addPhoneArrayControl(data: any = {}) {
    if (Object.keys(data).length) {
      return this.fb.group({
        type: [{ disabled: this.recordData ? this.recordData.record.readOnly : "", value: data.type }, Validators.required],
        number: [{ disabled: this.recordData ? this.recordData.record.readOnly : "", value: data.number }, Validators.required],
      });
    } else {
      return this.fb.group({
        type: [{ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "Select Type" }, Validators.required],
        number: [{ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }, Validators.required],
      });
    }
  }

  durationControl(options) {
    const fg = new FormGroup({});
    if (options["Display days"]) {
      fg.addControl("days", new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: 0 }));
    }
    if (options["Display hours"]) {
      fg.addControl("hours", new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: 0 }));
    }
    if (options["Display minutes"]) {
      fg.addControl("minutes", new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: 0 }));
    }
    if (options["Display seconds"]) {
      fg.addControl("seconds", new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: 0 }));
    }
    return fg;
  }

  locationControl() {
    return this.fb.group({
      streetAddress: new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }, { updateOn: "blur" }),
      postalCode: new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }, { updateOn: "blur" }),
      city: new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }, { updateOn: "blur" }),
      state: new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }, { updateOn: "blur" }),
      country: new FormControl({ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }, { updateOn: "blur" }),
    });
  }

  durationChange(event, field) {
    let dayFlag = false;
    let hourFlag = false;
    let minuteFlag = false;
    let secondFlag = false;
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (field.options["Display days"]) {
      days = this.appForm.controls[field.label]["controls"].days.value;
      dayFlag = true;
    }
    if (field.options["Display hours"]) {
      hours = this.appForm.controls[field.label]["controls"].hours.value;
      hourFlag = true;
    }
    if (field.options["Display minutes"]) {
      minutes = this.appForm.controls[field.label]["controls"].minutes.value;
      minuteFlag = true;
    }
    if (field.options["Display seconds"]) {
      seconds = this.appForm.controls[field.label]["controls"].seconds.value;
      secondFlag = true;
    }
    const secondsToMinutes = secondFlag ? Math.floor(seconds / 60) : 0;
    const minutesToHours = minuteFlag
      ? Math.floor((minutes + secondsToMinutes) / 60)
      : 0;
    const hoursToDays = hourFlag
      ? Math.floor((hours + minutesToHours) / 24)
      : 0;
    const modSeconds = seconds % 60;
    const modMinutes = (minutes + secondsToMinutes) % 60;
    const modHours = (hours + minutesToHours) % 24;
    if (minuteFlag) {
      if (secondsToMinutes > 0) {
        seconds = modSeconds;
        minutes += secondsToMinutes;
      }
    } else {
      minutes = 0;
    }
    if (hourFlag) {
      if (minutesToHours > 0) {
        seconds = modSeconds;
        minutes = modMinutes;
        hours += minutesToHours;
      }
    } else {
      hours = 0;
    }
    if (dayFlag) {
      if (hoursToDays > 0) {
        seconds = modSeconds;
        minutes = modMinutes;
        hours = modHours;
        days += hoursToDays;
      }
    } else {
      days = 0;
    }

    if (dayFlag) {
      this.appForm.controls[field.label]["controls"].days.setValue(days);
    }
    if (hourFlag) {
      this.appForm.controls[field.label]["controls"].hours.setValue(hours);
    }
    if (minuteFlag) {
      this.appForm.controls[field.label]["controls"].minutes.setValue(minutes);
    }
    if (secondFlag) {
      this.appForm.controls[field.label]["controls"].seconds.setValue(seconds);
    }
    this.appForm.updateValueAndValidity();
    // this.addRecord(event, field);
  }
  // For email array controls
  addAnotherEmail(label, data = {}) {
    this.emailArray = this.appForm.get(label) as FormArray;
    this.emailArray.push(this.addEmailArrayControl(data));
  }

  addEmailArrayControl(data: any = {}) {
    if (Object.keys(data).length) {
      return this.fb.group({
        type: [{ disabled: this.recordData ? this.recordData.record.readOnly : "", value: data.type }, Validators.required],
        text: [{ disabled: this.recordData ? this.recordData.record.readOnly : "", value: data.text }, Validators.required],
      });
    } else {
      return this.fb.group({
        type: [{ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "Select Type" }, Validators.required],
        text: [{ disabled: this.recordData ? this.recordData.record.readOnly : "", value: "" }, Validators.required],
      });
    }
  }

  getActivities() {
    this.appViewService
      .getActivities(this.workspaceId, this.appId, this.recordId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.appActivities = jresponse.body;
          this.appActivities.map((activity) => {
            if (activity.cells && activity.cells.length) {
              activity.cells.map((cell) => {
                if (cell.old_value[0].text) {
                  cell.record = _.map(cell.old_value[0].text, function (val) {
                    if (val.hasOwnProperty("recordName")) {
                      return val.recordName;
                    }
                  })
                  cell.record = _.compact(cell.record).toString();
                  cell.type =
                    typeof cell.old_value[0].text === "string"
                      ? "string"
                      : "object";
                }
              });
            }
            if (activity.user.avatar && activity.user.avatar !== "undefined") {
              activity.user.avatar =
                environment.MEDIA_URL + activity.user.avatar;
            } else {
              activity.user.avatar = "../../../../../assets/images/user.png";
            }
          });
          setTimeout(() => {
            this.scrollToBottom();
          }, 0);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  getComments() {
    this.appViewService
      .getComments(this.recordId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.appComments = jresponse.body;
          if (this.appComments) {
            this.appComments.map((comment) => {
              if (
                comment.user_id.avatar &&
                comment.user_id.avatar !== "undefined"
              ) {
                comment.user_id.avatar =
                  environment.MEDIA_URL + comment.user_id.avatar;
              } else {
                comment.user_id.avatar = "../../../../../assets/images/user.png";
              }
            });
          }
          setTimeout(() => {
            this.scrollToBottom();
          }, 0);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  scrollToBottom() {
    // console.log(this.myScrollContainer.nativeElement.scrollHeight)
    this.myScrollContainer.nativeElement.scrollTop =
    this.myScrollContainer.nativeElement.scrollHeight + 100;
  }

  setFormValues() {

    this.getComments();
    this.getActivities();
    // // To set current record's id
    // this.recordId = record.id;
    // // Reset selected members
    // this.selectedItems = {};
    // // Reset link html data
    this.linkPreviewData = {};
    // const particularRecord = this.recordData.find(
    //   (fieldRecord) => fieldRecord._id === record.id
    // );
    // For category fields
    // tslint:disable-next-line: max-line-length
    this.recordFormValues
      .filter((data) => Object.keys(data.value).includes("select"))
      .forEach((field) => {
        const label = this.appFields.find(
          (appField) => appField._id === field.field_id
        ).label;
        this.appForm.controls[label].setValue(field.value.select);
      });
    // For image fields
    // particularRecord.data
    //   .filter((data) => Object.keys(data.value).includes("image"))
    //   .forEach((field) => {
    //     const label = this.appFields.find(
    //       (appField) => appField._id === field.field_id
    //     ).label;
    //     // this.imageData[this.recordId] = {};
    //     // this.imageData[this.recordId][label] =
    //     //   environment.MEDIA_URL + field.value.image;
    //   });
    // For rest of the fields

    this.recordFormValues.forEach((record) => {
      const fieldData = this.appFields.find(field => field._id === record.field_id);

      switch (fieldData.type) {
        case Constants.APP_FIELD_TYPES.NUMBER:
        case Constants.APP_FIELD_TYPES.TEXT:
        case Constants.APP_FIELD_TYPES.RELATIONSHIP:

          this.appForm.controls[fieldData.label].setValue(record.value.text);
          if (fieldData.options.lines === "Multi line") {
            this.setTextArea.push(fieldData.label);
          }
          if (fieldData.options.selectedApps) {

            this.selectedRecord[fieldData.label] = record.value.text;
            this.selectedRecord[fieldData.label].forEach(record => {
              if (record && record.categoryObj) {
                const cat = record.categoryObj.find(c => c.id === record.selectedCategory);
                if (cat) {
                  record.selectedCategoryColor = cat.color;
                }
              }
            });
          }
          break;

        case Constants.APP_FIELD_TYPES.CATEGORY:
          // this.appForm.controls[fieldData.label].setValue(record.value.select);
          this.selectedCategoryOptions[fieldData._id] = [];
          if (fieldData.options.choice === "Single choice") {
            const option = fieldData.options.selectOptions.find(op => op.id === record.value.select);
            this.selectedCategoryOptions[fieldData._id].push(option.id);
          } else {
            this.selectedCategoryOptions[fieldData._id] = record.value.select;
            // tslint:disable-next-line: max-line-length
            this.selectedCategoryMultipleOptions[fieldData._id] = this.selectedCategoryOptions[fieldData._id].reduce((result, optionId, ind) => {
              const optionData = fieldData.options.selectOptions.find(op => op.id === optionId);
              result += ` ${optionData.label}${ind !== this.selectedCategoryOptions[fieldData._id].length - 1 ? "," : ""}`;
              return result;
            }, "");
          }
          break;

        case Constants.APP_FIELD_TYPES.LINK:
          this.appForm.controls[fieldData.label].setValue(record.value.text);
          this.getLinkPreview(record.value.text, fieldData.label);
          break;

        case Constants.APP_FIELD_TYPES.DATE:
          this.appForm.controls[fieldData.label].setValue(new Date(record.value.date));
          if (record.value.end) {
            this.appForm.controls[fieldData.label + "End"].setValue(
              new Date(record.value.end)
            );
          }
          break;

        case Constants.APP_FIELD_TYPES.DURATION:
          Object.keys(record.value).forEach((key) => {
            this.appForm.controls[fieldData.label]["controls"][
              key
            ].setValue(record.value[key]);
          });
          break;

        case Constants.APP_FIELD_TYPES.EMAIL:
          this.emailArray = this.appForm.get(fieldData.label) as FormArray;
          this.emailArray.removeAt(0);
          record.value.text.forEach((data) => {
            this.addAnotherEmail(fieldData.label, data);
          });
          break;

        case Constants.APP_FIELD_TYPES.PHONE:
          this.phoneArray = this.appForm.get(fieldData.label) as FormArray;
          this.phoneArray.removeAt(0);
          record.value.tel.forEach((data) => {
            this.addAnotherPhone(fieldData.label, data);
          });
          break;

        case Constants.APP_FIELD_TYPES.MONEY:
          this.appForm.controls[fieldData.label].setValue(record.value.number);
          this.appForm.controls[`${fieldData.label}Type`].setValue(
            record.value[`${fieldData.label}Type`]
          );
          break;

        case Constants.APP_FIELD_TYPES.MEMBER:
          const selectedMembers = [];

          record.value.members.forEach(member => {
            const m = this.members.find((mem) => mem._id === member);
            selectedMembers.push({
              id: m._id,
              // tslint:disable-next-line: max-line-length
              avatar:
                m.avatar && m.avatar !== "undefined"
                  ? environment.MEDIA_URL + m.avatar
                  : "../../../../../assets/images/user.png",
              name: `${m.firstName} ${m.lastName}`,
            });
            this.membersList[fieldData.label].splice(this.membersList[fieldData.label].findIndex(member => m._id === member._id), 1);
          });
          this.selectedMembers[fieldData.label] = selectedMembers;
          break;

        case Constants.APP_FIELD_TYPES.LOCATION:
          this.mapData[fieldData.label] = record.value;
          if (fieldData.options.display === "Single line address") {
            this.appForm.controls[fieldData.label].setValue(record.value.address);
          } else {
            this.appForm.controls[fieldData.label]["controls"].streetAddress.setValue(record.value.street);
            this.appForm.controls[fieldData.label]["controls"].postalCode.setValue(record.value.postal);
            this.appForm.controls[fieldData.label]["controls"].city.setValue(record.value.city);
            this.appForm.controls[fieldData.label]["controls"].state.setValue(record.value.state);
            this.appForm.controls[fieldData.label]["controls"].country.setValue(record.value.country);
          }
          break;

        case Constants.APP_FIELD_TYPES.PROGRESS:
          this.progressData[fieldData.label] = record.value.number;
          this.appForm.controls[fieldData.label].setValue(record.value.number);
          break;

        case Constants.APP_FIELD_TYPES.IMAGE:
          this.attachmentData[fieldData.label] = [];
          this.imageDisplayData[fieldData.label] = [];

          record.value.image.forEach((img) => {
            let src = environment.MEDIA_URL;
            src +=
              img.attachment.type === "img"
                ? img.attachment.path
                : img.attachment.type === "vid" ? img.thumbs[1].thumbPath : (img.thumbs && img.thumbs.length)
                  ? img.thumbs[0].thumbPath
                  : (img.attachment.path + ',' + img.attachment.type);
            this.attachmentData[fieldData.label].push(img);
            
            this.imageDisplayData[fieldData.label].push({
              source: src,
              type: img.attachment.type,
              path: environment.MEDIA_URL+img.attachment.path,
              ext: img.attachment.ext
            });
          });
        // record.value.image.forEach((img) => {
        //   this.attachmentData[fieldData.label].push(img);
        //   this.imageDisplayData[fieldData.label].push({
        //     source: environment.MEDIA_URL + img.attachment.path,
        //   });
        // });

      }
      // if (record) {
      //   if (record.displayType === "multi") {
      //     // To remove the empty control
      //     if (record.value.fieldType === "phone") {
      //       this.phoneArray = this.appForm.get(record.value.label) as FormArray;
      //       this.phoneArray.removeAt(0);
      //     } else {
      //       this.emailArray = this.appForm.get(record.value.label) as FormArray;
      //       this.emailArray.removeAt(0);
      //     }
      //     // To set values in form array
      //     record.displayVal.forEach((data) => {
      //       if (record.value.fieldType === "phone") {
      //         this.addAnotherPhone(record.value.label, data);
      //       } else {
      //         this.addAnotherEmail(record.value.label, data);
      //       }
      //     });
      //   } else if (
      //     record.displayType === "single" &&
      //     record.value.fieldType !== "duration" &&
      //     record.value.fieldType !== "member" &&
      //     record.value.fieldType !== "location"
      //   ) {
      //     this.appForm.controls[record.value.label].setValue(record.displayVal);
      //     if (record.value[`${record.value.label}Type`]) {
      //       this.appForm.controls[`${record.value.label}Type`].setValue(
      //         record.value[`${record.value.label}Type`]
      //       );
      //     }
      //     if (
      //       this.appFields.find((field) => field._id === record.field_id)
      //         .options.lines === "Multi line"
      //     ) {
      //       this.setTextArea.push(record.value.label);
      //     }
      //   } else if (record.value.fieldType === "duration") {
      //     Object.keys(record.displayVal).forEach((key) => {
      //       if (record.value[key]) {
      //         this.appForm.controls[record.value.label]["controls"][
      //           key
      //         ].setValue(record.value[key]);
      //       }
      //     });
      //     // this.appForm.controls[record.value.label]["controls"].hours.setValue(record.value.hours);
      //     // this.appForm.controls[record.value.label]["controls"].minutes.setValue(record.value.minutes);
      //     // this.appForm.controls[record.value.label]["controls"].seconds.setValue(record.value.seconds);
      //   } else if (record.value.fieldType === "member" && record.displayVal) {
      //     const members = [];
      //     const selectedMembers = [];
      //     // record.displayVal.forEach((member, ind) => {
      //     //   // this.dropdownList.find(el => el.item_text === member.name);
      //     //   members.push({
      //     //     item_id: this.dropdownList.find(
      //     //       (el) => el.item_text === member.name
      //     //     ).item_id,
      //     //     item_text: member.name,
      //     //   });
      //     //   const m = this.members.find((mem) => mem.user_id._id === member.id);
      //     //   selectedMembers.push({
      //     //     id: m.user_id._id,
      //     //     // tslint:disable-next-line: max-line-length
      //     //     avatar:
      //     //       m.user_id.avatar && m.user_id.avatar !== "undefined"
      //     //         ? environment.MEDIA_URL + m.user_id.avatar
      //     //         : "../../../../../assets/images/user.png",
      //     //     name: `${m.user_id.firstName} ${m.user_id.lastName}`,
      //     //   });
      //     // });
      //     // this.selectedItems = members;
      //     // this.selectedMembers = selectedMembers;
      //     // this.appForm.controls[record.value.label].setValue(this.selectedItems);
      //   } else if (record.value.fieldType === "location") {
      //     this.mapData = record.value;
      //     if (record.locationType === "single") {
      //       this.appForm.controls[record.value.label].setValue(
      //         record.value.address
      //       );
      //     } else {
      //       this.appForm.controls[record.value.label][
      //         "controls"
      //       ].streetAddress.setValue(record.value.street);
      //       this.appForm.controls[record.value.label][
      //         "controls"
      //       ].postalCode.setValue(record.value.postal);
      //       this.appForm.controls[record.value.label]["controls"].city.setValue(
      //         record.value.city
      //       );
      //       this.appForm.controls[record.value.label][
      //         "controls"
      //       ].state.setValue(record.value.state);
      //       this.appForm.controls[record.value.label][
      //         "controls"
      //       ].country.setValue(record.value.country);
      //     }
      //   }
      //   if (record.value.fieldType === 'link') {
      //     // this.linkPreviewData[this.recordId] = {};
      //     // this.linkPreviewData[this.recordId][record.value.label] = { html: record.displayVal };
      //     this.getLinkPreview(record.displayVal);
      //   }
      //   if (record.value.fieldType === "progress") {
      //     this.progressData = record.displayVal;
      //   }
      //   if (record.value.fieldType === "date") {
      //     this.appForm.controls[record.value.label].setValue(record.date);
      //     if (record.end) {
      //       this.appForm.controls[record.value.label + "End"].setValue(
      //         record.end
      //       );
      //     }
      //   }
      // }
    });
    this.appForm.updateValueAndValidity();

    // document.getElementById("recordModalButton").click();
    setTimeout(() => {
      this.setTextArea.forEach((label) => {
        this.setTextAreaLength(label);
      });
    }, 150);
  }

  closeDp() {
    if (this.dpValueChanged) {
      this.dpValueChanged = false;
      this.dpShown = false;
      this.addRecord(this.dpValue.event, this.dpValue.field, this.dpValue.type);
    }
    this.dpShown = false;
  }

  dpValueChange(event, field, type) {
    this.dpValue = {
      event,
      field,
      type,
    };
    if (this.dpShown) {
      this.dpValueChanged = true;
    }
  }

  setTextAreaLength(label) {
    const element = document.getElementById(label);
    element.style.height = "1px";
    element.style.height = 2 + element.scrollHeight + "px";
  }

  getLinkPreview(url, field) {
    this.appViewService
      .getLinkPreview(url)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          if (jresponse.body.html) {
            this.linkPreviewData[field] = jresponse.body;
          } else {
            this.linkPreviewData[field] = "";
          }
        }
      })
      .catch((err: Error) => {
        this.linkPreviewData = "";
        throw err;
      });
  }

  toggleMembersList(label) {
    if ((this.recordData && !this.recordData.record.readOnly) || (!this.recordData)) {

      if (this.membersListMenu === label) {
        this.membersListMenu = "";
      } else {
        this.membersListMenu = label;
      }
    }
  }

  addRecord(event, field, type = "", index = "") {
    return new Promise((resolve, reject) => {
      if (field.type === "image") {
        if (type !== "remove") {
          this.imageData.push(...event.addedFiles);
        }
      }

      if (field.type === "member" && type === "add") {
        if (!this.selectedMembers[field.label]) {
          this.selectedMembers[field.label] = [];
        }
        this.membersList[field.label].splice(index, 1);
        this.membersListMenu = "";
        const avatar = event.avatar;
        const name = `${event.firstName} ${event.lastName}`;
        const id = event._id;
        this.selectedMembers[field.label].push({
          id,
          name,
          avatar,
        });
      }
      if (field.type === "link") {
        this.getLinkPreview(event.target.value, field.label);
      }
      const formData = new FormData();

      formData.append("fieldType", field.type);
      formData.append("fieldId", field._id);
      formData.append("application_id", this.appId);
      formData.append("record_id", this.recordId);
      formData.append("uniqueId", this.editSessionId);
      switch (field.type) {
        case this.appFieldTypes.TEXT:
        case this.appFieldTypes.LINK:
          const textData = { text: event.target.value };
          formData.append("value", JSON.stringify(textData));
          break;
        case this.appFieldTypes.PHONE:
          const telData = { tel: this.appForm.controls[field.label].value };
          formData.append("value", JSON.stringify(telData));
          break;
        case this.appFieldTypes.NUMBER:
          const numberData = { text: event.target.value };
          formData.append("value", JSON.stringify(numberData));
          break;
        case this.appFieldTypes.IMAGE:
          if (this.attachmentData) {
            if (this.attachmentData[field.label]) {
              if (
                this.attachmentData &&
                this.attachmentData[field.label].length
              ) {
                formData.append(
                  "attachmentData",
                  JSON.stringify(
                    this.attachmentData[field.label]
                  )
                );
              }
            }
          }
          for (const img of this.imageData) {
            formData.append("value[]", img);
          }
          break;
        case this.appFieldTypes.EMAIL:
          const emailData = { text: this.appForm.controls[field.label].value };
          formData.append("value", JSON.stringify(emailData));
          break;
        case this.appFieldTypes.MONEY:
          if (type === "Select Type" && event.target.localName !== "select") {
            type = this.moneyTypes[0];
          }
          const moneyData = {
            number: this.appForm.controls[field.label]["_pendingValue"],
          };
          moneyData[`${field.label}Type`] = type || event.target.value;
          formData.append("value", JSON.stringify(moneyData));
          break;
        case this.appFieldTypes.MEMBER:
          const members = this.selectedMembers[field.label].map(
            (member) => member.id
          );
          const memberData = { members };
          formData.append("value", JSON.stringify(memberData));
          break;
        case this.appFieldTypes.DATE:
          const dateData = {
            date: this.appForm.controls[field.label]["_pendingValue"],
          };
          if (field.options.display === "Show end date") {
            dateData["end"] = this.appForm.controls[field.label + "End"][
              "_pendingValue"
            ];
          }
          formData.append("value", JSON.stringify(dateData));
          break;
        case this.appFieldTypes.CATEGORY:
          // const categoryData = { select: event.target.value };
          let categoryVal = "";
          if (field.options.choice === "Single choice") {
            categoryVal = event[0];
          } else {
            categoryVal = event;
          }
          const categoryData = { select: categoryVal };
          formData.append("value", JSON.stringify(categoryData));
          break;
        case this.appFieldTypes.PROGRESS:
          const progressData = { number: event.value };
          this.progressData[field.label] = event.value;
          formData.append("value", JSON.stringify(progressData));
          break;
        case this.appFieldTypes.DURATION:
          const durationData = {};
          if (field.options["Display days"]) {
            durationData["days"] = this.appForm.controls[field.label][
              "controls"
            ].days.value;
          }
          if (field.options["Display hours"]) {
            durationData["hours"] = this.appForm.controls[field.label][
              "controls"
            ].hours.value;
          }
          if (field.options["Display minutes"]) {
            durationData["minutes"] = this.appForm.controls[field.label][
              "controls"
            ].minutes.value;
          }
          if (field.options["Display seconds"]) {
            durationData["seconds"] = this.appForm.controls[field.label][
              "controls"
            ].seconds.value;
          }
          formData.append("value", JSON.stringify(durationData));
          break;
        case this.appFieldTypes.RELATIONSHIP:
          // const emailData = { text: this.appForm.controls[field.label].value };
          // formData.append(
          //   "value",
          //   JSON.stringify(record.cells[0].old_value[0])
          // );
          break;
        case this.appFieldTypes.LOCATION:
          if (type === "single") {
            formData.append("value", JSON.stringify(event));
          } else if (type === "multi") {
            const { address, city, country, state, postal, street, map } = event;
            formData.append(
              "value",
              JSON.stringify({
                address,
                city,
                country,
                state,
                postal,
                street,
                map,
              })
            );
          } else {
            const result = {
              address: this.mapData[field.label].address,
              city: this.appForm.controls[field.label]["controls"].city[
                "_pendingValue"
              ],
              state: this.appForm.controls[field.label]["controls"].state[
                "_pendingValue"
              ],
              country: this.appForm.controls[field.label]["controls"].country[
                "_pendingValue"
              ],
              postal: this.appForm.controls[field.label]["controls"].postalCode[
                "_pendingValue"
              ],
              street: this.mapData[field.label].street,
            };
            formData.append("value", JSON.stringify(result));
          }
          break;
      }
      this.appViewService
        .setField(formData)
        .then(async (jresponse: JReponse) => {
          this.mapSuggestion = {};
          if (jresponse.success) {
            this.imageData = [];
            this.getActivities();
            let sharedRecords = {};
            if (this.type === "shared") {
              sharedRecords = await this.homeService.getSharedRecords(this.recordId);
            } else {
              this.appViewService.updateCalendarView.next(true);
            }
            if (field.type === this.appFieldTypes.IMAGE) {
              this.setImages(this.selectedImageField, sharedRecords, field)
            }
            resolve();
          }
        })
        .catch((err: Error) => {
          reject();
          throw err;
        });
    })
  }

  setImages(fieldData, sharedRecords, mainField) {

    if (this.recordData) {
      const obj = sharedRecords[this.orgId].find(rec => rec.record.record_id._id === this.recordId);
      const record = obj.data.find(field => field.field_id === fieldData._id);
      this.attachmentData[fieldData.label] = [];
      this.imageDisplayData[fieldData.label] = [];
      record.value.image.forEach((img) => {
        let src = environment.MEDIA_URL;
        src +=
          img.attachment.type === "img"
            ? img.attachment.path
            : img.attachment.type === "vid" ? img.thumbs[1].thumbPath : (img.thumbs && img.thumbs.length)
              ? img.thumbs[0].thumbPath
              : (img.attachment.path + ',' + img.attachment.type);
        this.attachmentData[fieldData.label].push(img);
        this.imageDisplayData[fieldData.label].push({
          source: src,
          type: img.attachment.type,
          path: environment.MEDIA_URL+img.attachment.path,
          ext: img.attachment.ext
        });
        // this.attachmentData[fieldData.label].push(img);
        // this.imageDisplayData[fieldData.label].push({
        //   source: environment.MEDIA_URL + img.attachment.path,
        // });
      });
    } else {
      const recordId = this.recordId;;
      this.appViewService
        .getSingleRecord(recordId)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            if (jresponse.body && jresponse.body.length > 0) {
              const record = jresponse.body[0];

              this.attachmentData[fieldData.label] = [];
              this.imageDisplayData[fieldData.label] = [];
              const options = _.find(record.data, (fieldobj) => {
                if (fieldobj.value.image && fieldobj.field_id.toString() == mainField._id.toString()) {
                  return fieldobj.value.image;
                }
              });
              options.value.image.forEach((img) => {
                let src = environment.MEDIA_URL;
                src +=
                  img.attachment.type === "img"
                    ? img.attachment.path
                    : img.attachment.type === "vid" ? img.thumbs[1].thumbPath : (img.thumbs && img.thumbs.length)
                      ? img.thumbs[0].thumbPath
                      : (img.attachment.path + ',' + img.attachment.type);
                this.attachmentData[fieldData.label].push(img);
                this.imageDisplayData[fieldData.label].push({
                  source: src,
                  type: img.attachment.type,
                  path: environment.MEDIA_URL+img.attachment.path,
                  ext: img.attachment.ext
                });
                // this.attachmentData[fieldData.label].push(img);
                // console.log(img)
                // this.imageDisplayData[fieldData.label].push({
                //   source: environment.MEDIA_URL + img.attachment.path,
                // });
              });
            }
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    }


  }

  openImages(images, selected) {
    if (document.querySelector('.carousel-inner .active') !== null) {
      document.querySelector('.carousel-inner .active').classList.remove('active');
    }
    this.carouselImages = [];
    this.carouselImages = images;
    setTimeout(() => {
      document.getElementById(`recordImage-${selected}`).classList.add("active");
    }, 50);
  }


  openRevisionModal(
    activities,
    template: TemplateRef<any>,
    fieldId,
    cell,
    index,
    currentActivity
  ) {
    let matchedActivity = JSON.parse(
      JSON.stringify(_.filter(activities, { cells: [{ _id: cell._id }] }))
    );

    const record = this.recordData ? this.recordData.data : this.recordFormValues;
    const title = _.find(record.data, { fieldType: "text" });
    this.recordName = title ? title.value.text : "";
    let newObj = matchedActivity.filter((activity) => {
      if (
        activity.cells &&
        activity.cells.length &&
        activity.activity_sub_type === "UPDATED_RECORD"
      ) {
        activity.cells = activity.cells.filter((el) => {
          if (el.field_id._id.toString() === fieldId.toString()) {
            return el;
          }
        });
        if (activity.cells.length > 0) {
          return activity;
        } else {
          return false;
        }
      }
    });
    // let sorted = _.orderBy(
    //   newObj,
    //   [
    //     (d) => {
    //       return new Date(d.createdAt);
    //     },
    //   ],
    //   ["asc"] // 'desc' orders by date descending
    // );
    // let currentIndex = newObj.indexOf(currentActivity);
    let currentIndex = newObj.findIndex(
      (data) => data._id === currentActivity._id
    );
    let nextIndex = currentIndex + 1;
    if (currentIndex == 0 || currentIndex == "0") {
      currentIndex = -1;
      nextIndex = 0;
    }
    this.revisionRecord = newObj;
    let next = newObj[nextIndex];
    let current = newObj[currentIndex];
    this.currentLeftIndex = nextIndex - 1;
    this.currentRightIndex = nextIndex;
    if (parseInt(this.revisionRecord.length) == parseInt(nextIndex)) {
      next = newObj[currentIndex];
      current = newObj[currentIndex - 1];
      this.currentLeftIndex = this.currentLeftIndex - 1;
      this.currentRightIndex = this.currentRightIndex - 1;
    }
    this.leftRecord = current ? current : {};
    this.rightRecord = next ? next : {};
    this.displayDiff();

    this.revisionModalRef = this.modalService.show(template, {
      class: "market-process-modal",
      animated: true,
      keyboard: true,
        backdrop: true,
          ignoreBackdropClick: false
    });
  }

  editRecord(record) {
    if ((this.recordData && !this.recordData.record.readOnly) || (!this.recordData)) {
      return new Promise((resolve, reject) => {
        delete record.cells[0].old_value[0].uniqueId;
        delete record.cells[0].old_value[0].created_date;
        const formattedRecord = this.recordData ? this.recordData.data : this.recordFormValues;
        const field = _.find(this.appFields, {
          _id: record.cells[0].field_id._id,
        });
        const formData = new FormData();
        formData.append("fieldType", field.type);
        formData.append("fieldId", field._id);
        formData.append("application_id", this.appId);
        formData.append("record_id", this.recordId);
        formData.append("uniqueId", this.editSessionId);
        switch (field.type) {
          case this.appFieldTypes.TEXT:
            formData.append(
              "value",
              JSON.stringify(record.cells[0].old_value[0])
            );
            break;
          case this.appFieldTypes.LINK:
            formData.append(
              "value",
              JSON.stringify(record.cells[0].old_value[0])
            );
            break;
          case this.appFieldTypes.PHONE:
            const telData = { tel: this.appForm.controls[field.label].value };
            formData.append("value", JSON.stringify(telData));
            break;
          case this.appFieldTypes.CALCULATOR:
            const calData = { text: event };
            formData.append("value", JSON.stringify(calData));
            break;
          case this.appFieldTypes.NUMBER:
            formData.append(
              "value",
              JSON.stringify(record.cells[0].old_value[0])
            );
            break;
          case this.appFieldTypes.IMAGE:
            formData.append(
              "value",
              JSON.stringify(record.cells[0].old_value[0])
            );
            break;
          case this.appFieldTypes.EMAIL:
            formData.append(
              "value",
              JSON.stringify(record.cells[0].old_value[0])
            );
            break;
          case this.appFieldTypes.MONEY:
            formData.append(
              "value",
              JSON.stringify(record.cells[0].old_value[0])
            );
            break;
          case this.appFieldTypes.MEMBER:
            formData.append(
              "value",
              JSON.stringify(record.cells[0].old_value[0])
            );
            break;
          case this.appFieldTypes.DATE:
            formData.append(
              "value",
              JSON.stringify(record.cells[0].old_value[0])
            );
            break;
          case this.appFieldTypes.CATEGORY:
            formData.append(
              "value",
              JSON.stringify(record.cells[0].old_value[0])
            );
            break;
          case this.appFieldTypes.PROGRESS:
            formData.append(
              "value",
              JSON.stringify(record.cells[0].old_value[0])
            );
            break;
          case this.appFieldTypes.DURATION:
            formData.append(
              "value",
              JSON.stringify(record.cells[0].old_value[0])
            );
            break;
          case this.appFieldTypes.LOCATION:
            formData.append(
              "value",
              JSON.stringify(record.cells[0].old_value[0])
            );
            break;
          case this.appFieldTypes.RELATIONSHIP:
            formData.append(
              "value",
              JSON.stringify(record.cells[0].old_value[0])
            );
            break;
        }
        this.appViewService
          .setField(formData)
          .then(async (jresponse: JReponse) => {
            this.mapSuggestion = {};
            if (jresponse.success) {
              this.imageData = [];
              if (field.type === "number" || field.type === "money") {
                const numFields = _.filter(formattedRecord, (obj) => {
                  if (obj.fieldType == "money" || obj.fieldType == "number") {
                    if (
                      obj.uniqueId == field.uniqueId &&
                      obj.fieldType == "number"
                    ) {
                      obj.displayVal = record.cells[0].old_value[0].text;
                    } else if (
                      obj.uniqueId == field.uniqueId &&
                      obj.fieldType == "money"
                    ) {
                      obj.displayVal = record.cells[0].old_value[0].number;
                    }
                    return true;
                  }
                });
                const calculationFields = _.filter(formattedRecord, {
                  fieldType: "calculator",
                });
                if (!_.isEmpty(calculationFields) && calculationFields.length) {
                  calculationFields.forEach((fieldObj) => {
                    let formula = fieldObj.rawFormula;
                    numFields.forEach((numObj) => {
                      const id = Number(numObj.uniqueId);
                      let val = numObj.displayVal;
                      val = val.replace(/,/g, "");
                      val = val && val !== "" ? val : 0;
                      if (formula.includes(id)) {
                        while (formula.includes(id)) {
                          formula = formula.replace(id, val);
                        }
                        fieldObj.isChange = true;
                        const calculatorVal = eval(formula);
                        fieldObj.calculatorVal = calculatorVal;
                      }
                    });
                  });
                  calculationFields.forEach((variable) => {
                    if (variable.isChange && variable.isChange === true) {
                      const formData = new FormData();
                      formData.append("fieldType", "calculator");
                      formData.append("fieldId", variable.field_id);
                      formData.append("application_id", this.appId);
                      formData.append("record_id", this.recordId);
                      formData.append("uniqueId", this.editSessionId);
                      formData.append(
                        "value",
                        JSON.stringify({ text: variable.calculatorVal })
                      );
                      this.appViewService
                        .setField(formData)
                        .then(async (jresponse: JReponse) => {
                          this.mapSuggestion = {};
                          if (jresponse.success) {
                            const sharedRecords = await this.homeService.getSharedRecords(this.recordId);
                            const obj = sharedRecords[this.orgId].find(rec => rec.record.record_id._id === this.recordId);
                            this.recordFormValues = obj.data;
                            this.setFormValues();
                            this.revisionModalRef.hide();
                            // this.appViewService
                            //   .getAppRecords(this.appId)
                            //   .then((jresponse: JReponse) => {
                            //     if (jresponse.success) {
                            //       this.recordData = jresponse.body;
                            //       this.setRecordList();
                            //       const formattedRecord = this.formattedRecordData.find(
                            //         (record) => record.id === this.recordId
                            //       );
                            //       this.setFormValues(formattedRecord, true);
                            //     }
                            //   })
                            //   .catch((err: Error) => {
                            //     throw err;
                            //   });
                          }
                        })
                        .catch((err: Error) => {
                          throw err;
                        });
                    }
                  });
                } else {
                  if (this.recordData) {
                    const sharedRecords = await this.homeService.getSharedRecords(this.recordId);
                    const obj = sharedRecords[this.orgId].find(rec => rec.record.record_id._id === this.recordId);
                    this.recordFormValues = obj.data;
                    this.setFormValues();
                    this.revisionModalRef.hide();
                  } else {
                    const recordId = this.recordId;;
                    this.appViewService
                      .getSingleRecord(recordId)
                      .then((jresponse: JReponse) => {
                        if (jresponse.success) {
                          if (jresponse.body && jresponse.body.length > 0) {
                            const record = jresponse.body[0];
                            this.recordFormValues = record.data;
                            this.setFormValues();
                            this.revisionModalRef.hide();
                          }
                        }
                      })
                      .catch((err: Error) => {
                        throw err;
                      });
                  }

                  // this.appViewService
                  //   .getAppRecords(this.appId)
                  //   .then((jresponse: JReponse) => {
                  //     if (jresponse.success) {
                  //       this.recordData = jresponse.body;
                  //       this.setRecordList();
                  //       const formattedRecord = this.formattedRecordData.find(
                  //         (record) => record.id === this.recordId
                  //       );
                  //       this.setFormValues(formattedRecord, true);
                  //     }
                  //   })
                  //   .catch((err: Error) => {
                  //     throw err;
                  //   });
                }
              } else {

                if (this.recordData) {
                  const sharedRecords = await this.homeService.getSharedRecords(this.recordId);
                  const obj = sharedRecords[this.orgId].find(rec => rec.record.record_id._id === this.recordId);
                  this.recordFormValues = obj.data;
                  this.setFormValues();
                  this.revisionModalRef.hide();
                } else {
                  const recordId = this.recordId;;
                  this.appViewService
                    .getSingleRecord(recordId)
                    .then((jresponse: JReponse) => {
                      if (jresponse.success) {
                        if (jresponse.body && jresponse.body.length > 0) {
                          const record = jresponse.body[0];
                          this.recordFormValues = record.data;
                          this.setFormValues();
                          this.revisionModalRef.hide();
                        }
                      }
                    })
                    .catch((err: Error) => {
                      throw err;
                    });
                }
              }

              resolve();
            }
          })
          .catch((err: Error) => {
            reject();
            throw err;
          });
      });
    }
  }

  goToPublicProfile(id) {
    this.router.navigate(["/application/home/parent/public-profile"], {
      queryParams: {
        userId: id,
      },
    });
  }

  changeRecord(type) {
    if (type === "left") {
      this.leftRecord = this.revisionRecord[this.currentLeftIndex - 1]
        ? this.revisionRecord[this.currentLeftIndex - 1]
        : "";
      this.rightRecord = this.revisionRecord[this.currentRightIndex - 1]
        ? this.revisionRecord[this.currentRightIndex - 1]
        : "";
      this.currentLeftIndex = this.currentLeftIndex - 1;
      //  this.currentLeftIndex = this.currentRightIndex < 0 ? 0: this.currentRightIndex - 1;
      this.currentRightIndex = this.currentRightIndex - 1;
      this.displayDiff();
    } else {
      this.leftRecord = this.revisionRecord[this.currentLeftIndex + 1]
        ? this.revisionRecord[this.currentLeftIndex + 1]
        : "";
      this.rightRecord = this.revisionRecord[this.currentRightIndex + 1]
        ? this.revisionRecord[this.currentRightIndex + 1]
        : "";
      this.currentLeftIndex = this.currentLeftIndex + 1;
      // this.currentLeftIndex = this.currentRightIndex ;
      this.currentRightIndex = this.currentRightIndex + 1;

      this.displayDiff();
    }
  }

  setFilterFields() {
    this.filterFields = [];
    this.appFields.forEach((field) => {
      if (
        field.type === "category" ||
        field.type === "date" ||
        field.type === "member" ||
        field.type === "relationship" ||
        field.type === "money" ||
        field.type === "number" ||
        field.type === "calculator" ||
        field.type === "progress"
      ) {
        this.filterFields.push(field);
      }
      if (
        field.type === "location" &&
        field.options.display === "Multi-line address"
      ) {
        const countryField = JSON.parse(JSON.stringify(field));
        countryField.label = `${countryField.label} Country`;
        const stateField = JSON.parse(JSON.stringify(field));
        stateField.label = `${stateField.label} State`;
        const cityField = JSON.parse(JSON.stringify(field));
        cityField.label = `${cityField.label} City`;
        const postcodeField = JSON.parse(JSON.stringify(field));
        postcodeField.label = `${postcodeField.label} Postcode`;
        this.filterFields = [
          ...this.filterFields,
          countryField,
          stateField,
          cityField,
          postcodeField,
        ];
      }
    });
  }

  displayDiff() {
    this.leftVal = "";
    this.rightVal = "";

    if (this.leftRecord && !_.isEmpty(this.leftRecord)) {
      let filterObj = this.filterFields.find(
        (filter) => filter._id === this.leftRecord.cells[0].field_id._id
      );
      let left;
      if (
        (this.leftRecord.cells[0].old_value[0].text &&
          this.leftRecord.cells[0].old_value[0].text.length <= 20 &&
          this.leftRecord.cells[0].type === "string") ||
        this.leftRecord.cells[0].old_value[0].number ||
        this.leftRecord.cells[0].old_value[0].date
      ) {
        let num = this.leftRecord.cells[0].old_value[0].MoneyType
          ? this.leftRecord.cells[0].old_value[0].MoneyType +
          " " +
          this.leftRecord.cells[0].old_value[0].number
          : this.leftRecord.cells[0].old_value[0].number;
        let dates =
          this.leftRecord.cells[0].old_value[0].date &&
            this.leftRecord.cells[0].old_value[0].end
            ? moment(this.leftRecord.cells[0].old_value[0].date).format(
              "DD/MM/YYYY"
            ) +
            "-" +
            moment(this.leftRecord.cells[0].old_value[0].end).format(
              "DD/MM/YYYY"
            )
            : this.leftRecord.cells[0].old_value[0].date
              ? moment(this.leftRecord.cells[0].old_value[0].date).format(
                "DD/MMYYYY"
              )
              : "";
        left = this.leftRecord.cells[0].old_value[0].text || num || dates;
      } else if (this.leftRecord.cells[0].old_value[0].tel) {
        left = _.map(
          this.leftRecord.cells[0].old_value[0].tel,
          function (value) {
            return value.type + " - " + value.number;
          }
        );
      } else if (this.leftRecord.cells[0].old_value[0].members) {
        let member = this.appViewService.wsMembers;
        let final = _.map(
          this.leftRecord.cells[0].old_value[0].members,
          function (object) {
            let variable = _.chain(member)
              .filter((user) => user._id === object)
              .map((data) => {
                return data.firstName + " " + data.lastName;
              })
              .value();
            return variable;
          }
        );
        left = final;
      } else {
        left = _.map(this.leftRecord.cells[0].old_value, function (value) {
          if (value.hasOwnProperty("days")) {
            return (
              value.days +
              " Days " +
              value.hours +
              " Hours " +
              value.minutes +
              " Minutes"
            );
          } else if (value.hasOwnProperty("address")) {
            return value.address;
          } else if (
            value.hasOwnProperty("text") &&
            typeof value.text == "string"
          ) {
            return value.text;
          } else if (value.hasOwnProperty("image")) {
            let images = _.map(value.image, function (val) {
              return (
                "Name : " +
                (val.attachment.name ? val.attachment.name : "") +
                " , Size : " +
                (val.attachment.size ? val.attachment.size + " Bytes" : "") +
                " , Extension : " +
                (val.attachment.ext ? val.attachment.ext : "")
              );
            });
            return images;
          } else if (value.hasOwnProperty("select")) {
            let categories = JSON.parse(
              JSON.stringify(filterObj.options.selectOptions)
            );
            let filtered = categories.filter(function (itm) {
              return value.select.indexOf(itm.id) > -1;
            });
            filtered = filtered
              .map(function (e) {
                return e.label;
              })
              .join(", ");
            return filtered;
          } else {
            let emails = _.map(value.text, function (val) {
              if (val.hasOwnProperty("recordName")) {
                return val.recordName;
              } else {
                return val.type + " - " + val.text;
              }
            });
            return emails;
          }
        });
      }
      this.leftVal = left.toString();
    } else {
      this.leftVal = "";
    }
    if (this.rightRecord && !_.isEmpty(this.rightRecord)) {

      let right;
      let filterRightObj = this.filterFields.find(
        (filter) => filter._id === this.rightRecord.cells[0].field_id._id
      );
      if (
        (this.rightRecord.cells[0].old_value[0].text &&
          this.rightRecord.cells[0].old_value[0].text.length <= 20 &&
          this.rightRecord.cells[0].type === "string") ||
        this.rightRecord.cells[0].old_value[0].number ||
        this.rightRecord.cells[0].old_value[0].date
      ) {
        let num = this.rightRecord.cells[0].old_value[0].MoneyType
          ? this.rightRecord.cells[0].old_value[0].MoneyType +
          " " +
          this.rightRecord.cells[0].old_value[0].number
          : this.rightRecord.cells[0].old_value[0].number;
        let dates =
          this.rightRecord.cells[0].old_value[0].date &&
            this.rightRecord.cells[0].old_value[0].end
            ? moment(this.rightRecord.cells[0].old_value[0].date).format(
              "DD/MM/YYYY"
            ) +
            "-" +
            moment(this.rightRecord.cells[0].old_value[0].end).format(
              "DD/MM/YYYY"
            )
            : this.rightRecord.cells[0].old_value[0].date
              ? moment(this.rightRecord.cells[0].old_value[0].date).format(
                "DD/MM/YYYY"
              )
              : "";
        right = this.rightRecord.cells[0].old_value[0].text || num || dates;
      } else if (this.rightRecord.cells[0].old_value[0].tel) {
        right = _.map(
          this.rightRecord.cells[0].old_value[0].tel,
          function (value) {
            return value.type + " - " + value.number;
          }
        );
      } else if (this.rightRecord.cells[0].old_value[0].members) {
        const member = this.appViewService.wsMembers;
        const final = _.map(
          this.rightRecord.cells[0].old_value[0].members,
          function (object) {
            let variable = _.chain(member)
              .filter((user) => user._id === object)
              .map((data) => {
                return data.firstName + " " + data.lastName;
              })
              .value();
            return variable;
          }
        );
        right = final;
      } else {
        right = _.map(this.rightRecord.cells[0].old_value, function (value) {
          if (value.hasOwnProperty("days")) {
            return (
              value.days +
              " Days " +
              value.hours +
              " Hours " +
              value.minutes +
              " Minutes"
            );
          } else if (value.hasOwnProperty("address")) {
            return value.address;
          } else if (
            value.hasOwnProperty("text") &&
            typeof value.text === "string"
          ) {
            return value.text;
          } else if (value.hasOwnProperty("image")) {
            let images = _.map(value.image, function (val) {
              return (
                "Name : " +
                (val.attachment.name ? val.attachment.name : "") +
                " , Size : " +
                (val.attachment.size ? val.attachment.size + " Bytes" : "") +
                " , Extension : " +
                (val.attachment.ext ? val.attachment.ext : "")
              );
            });
            return images;
          } else if (value.hasOwnProperty("select")) {
            let categoriesRight = JSON.parse(
              JSON.stringify(filterRightObj.options.selectOptions)
            );
            let filteredRight = categoriesRight.filter(function (itm) {
              return value.select.indexOf(itm.id) > -1;
            });
            filteredRight = filteredRight
              .map(function (e) {
                return e.label;
              })
              .join(", ");
            return filteredRight;
          } else {
            let emails = _.map(value.text, function (val) {
              if (val.hasOwnProperty("recordName")) {
                return val.recordName;
              } else {
                return val.type + " - " + val.text;
              }
            });
            return emails;
          }
        });
      }
      this.rightVal = right.toString();
    } else {
      this.rightVal = "";
    }

    const result1 = diff.diffPatch(this.leftVal, this.rightVal);
    this.leftVal = result1.before;
    this.rightVal = result1.after;
  }

  getMap(item, field, type = "") {
    if (type === "single") {
      this.appForm.controls[field.label].setValue(item.address);
      this.appForm.updateValueAndValidity();
    }
    this.appViewService
      .getMap(item.coordinate)
      .then((jresponse: JReponse) => {
        if (jresponse.body.data.map) {
          const mapData = this.mapSuggestion[field.label].find(
            (map) => map.address === item.address
          );
          mapData.map = jresponse.body.data.map;
          let url = mapData.map.substring(0, mapData.map.indexOf("{"));
          const queries = JSON.parse(
            mapData.map.substring(mapData.map.indexOf("{"))
          );
          Object.keys(queries).forEach((key) => {
            url += `${key}=${queries[key]}&`;
          });
          mapData.map = url;
          this.mapData[field.label] = mapData;
          if (type === "multi") {
            this.appForm.controls[field.label][
              "controls"
            ].streetAddress.setValue(this.mapData[field.label].street);
            this.appForm.controls[field.label]["controls"].postalCode.setValue(
              this.mapData[field.label].postal
            );
            this.appForm.controls[field.label]["controls"].city.setValue(
              this.mapData[field.label].city
            );
            this.appForm.controls[field.label]["controls"].state.setValue(
              this.mapData[field.label].state
            );
            this.appForm.controls[field.label]["controls"].country.setValue(
              this.mapData[field.label].country
            );
            this.appForm.updateValueAndValidity();
          }
          this.addRecord(this.mapData[field.label], field, type);
        }
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }

  getGeoCode(event, field) {
    this.appViewService
      .getGeoCode(event.target.value)
      .then((jresponse: JReponse) => {
        if (jresponse.body.data[0].address) {
          this.mapSuggestion[field.label] = jresponse.body.data;
        }
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }

  removeFile(data, field) {
    if ((this.recordData && !this.recordData.record.readOnly) || (!this.recordData)) {
      
      // VIDEO RESPONSE INCLUDE SOURCE IN 'PATH'
      if(data.type === 'vid'){
        var imageData = this.attachmentData[field.label].find(
          (el) =>
            data.path.includes(el.attachment.path)
        );
        this.attachmentData[field.label] = this.attachmentData[field.label].filter(
          (el) =>
            !data.path.includes(el.attachment.path)
        );
      }

      // ATTACHMENT DATA'S SOURCE IN 'SOURCE' 
      if(data.type !== 'vid'){
        var imageData = this.attachmentData[field.label].find(
          (el) =>
            data.source.includes(el.attachment.path)
        );
        this.attachmentData[field.label] = this.attachmentData[field.label].filter(
          (el) =>
            !data.source.includes(el.attachment.path)
        );
      }
      
      const formData = new FormData();
      formData.append("fieldId", field._id);
      formData.append("fieldType", field.type);
      formData.append("application_id", this.appId);
      formData.append("record_id", this.recordId);
      formData.append("uniqueId", this.editSessionId);
      formData.append(
        "attachmentData",
        JSON.stringify({
          toRemove: imageData,
          toSave: this.attachmentData[field.label],
        })
      );
      // tslint:disable-next-line: max-line-length
      // this.imageDisplayData[field.label].splice(this.imageDisplayData[field.label].indexOf(this.imageDisplayData[field.lable].find( img => img.source === data.source)), 1);
      this.appViewService
        .deleteAttachment(formData)
        .then(async (jresponse: JReponse) => {
          if (jresponse.success) {
            this.getActivities();
            this.imageDisplayData[field.label] = [];
            this.attachmentData[field.label].forEach(img => {
              let src = environment.MEDIA_URL;
              src +=
                img.attachment.type === "img"
                  ? img.attachment.path
                  : img.attachment.type === "vid" ? img.thumbs[1].thumbPath : (img.thumbs && img.thumbs.length)
                    ? img.thumbs[0].thumbPath
                    : (img.attachment.path + ',' + img.attachment.type);
              this.imageDisplayData[field.label].push({
                source: src,
                type: img.attachment.type,
                path: environment.MEDIA_URL+img.attachment.path,
                ext: img.attachment.ext
              });
            });
            if (this.type === "shared") {
              await this.homeService.getSharedRecords(this.recordId);
            } else {
              if (this.recordData) {
                this.appViewService.updateCalendarView.next(true);
              }

            }
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    }
  }
  addRecordComment(commentText) {
    // console.log('in record')
    this.editComment = this.editComment.trim();
    if (commentText && this.editComment === "&nbsp;") {
      const data = {
        application_id: this.appId,
        record_id: this.recordId,
        comment: commentText.trim(),
      };
      this.appViewService
        .addComment(data)
        .then((jresponse: JReponse) => {
          this.canAddComment = true;
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            commentText = "";
            this.appViewService.sendRecordMentionData({ comment: "", comment_for_update: "",selectedMentionUsers:[] });
            this.editComment = "&nbsp;";
            this.getComments();
            this.getActivities();
          }
        })
        .catch((err: Error) => {
          this.canAddComment = true;
          throw err;
        });
    } else if (commentText) {
      const data = {
        comment: commentText.trim(),
      };
      this.apiService
        .postWithHeader(`record/${this.commentId}/editRecordComment`, data)
        .then((jresponse: JReponse) => {
          this.canAddComment = true;
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            commentText = "";
            this.appViewService.sendRecordMentionData({ comment: "", comment_for_update: "" ,selectedMentionUsers:[]});
            this.editComment = "&nbsp;";
            this.getComments();
            this.getActivities();
          }
        })
        .catch((err: any) => {
          throw err;
        });
    }

  }
  // addComment(event) {
  //   let commentText = event.target.innerText;
  //   selectedMentionUsers.forEach((element) => {
  //     commentText = commentText.replace(element.name, element.id);
  //   });
  //   commentText = commentText.trim();
  //   const charCode = event.which ? event.which : event.keyCode;
  //   if (charCode == 13 && event.shiftKey) {
  //     this.canAddComment = true;
  //     event.stopPropagation();
  //   } else if (charCode == 13 && this.isMentionUserSelect && commentText.length && this.canAddComment || event.addedFiles) {
  //     event.preventDefault();
  //     this.canAddComment = false;
  //     this.editComment = this.editComment.trim();
  //     if (this.editComment === "&nbsp;") {

  //       const data = {
  //         application_id: this.appId,
  //         record_id: this.recordId,
  //         comment: commentText.trim(),
  //       };
  //       this.appViewService
  //         .addComment(data)
  //         .then((jresponse: JReponse) => {
  //           this.canAddComment = true;
  //           if (jresponse.success) {
  //             this.helperService.showSuccessToast(jresponse.message);
  //             event.srcElement.value = "";
  //             event.target.innerText = "";
  //             this.editComment = "&nbsp;";
  //             this.getComments();
  //             this.getActivities();
  //           }
  //         })
  //         .catch((err: Error) => {
  //           this.canAddComment = true;
  //           throw err;
  //         });
  //     } else {
  //       const data = {
  //         comment: commentText.trim(),
  //       };
  //       this.apiService
  //         .postWithHeader(`record/${this.commentId}/editRecordComment`, data)
  //         .then((jresponse: JReponse) => {
  //           this.canAddComment = true;
  //           if (jresponse.success) {
  //             this.helperService.showSuccessToast(jresponse.message);
  //             event.srcElement.value = "";
  //             event.target.innerText = "";
  //             this.editComment = "&nbsp;";
  //             this.getComments();
  //             this.getActivities();
  //           }
  //         })
  //         .catch((err: any) => {
  //           throw err;
  //         });
  //     }
  //   }
  // }



  selectCategoryOption(option, field) {
    if ((this.recordData && !this.recordData.record.readOnly) || (!this.recordData)) {

      if (!this.selectedCategoryOptions[field._id]) {
        this.selectedCategoryOptions[field._id] = [];
      }
      if (field.options.choice === "Single choice") {
        if (this.selectedCategoryOptions[field._id][0] !== option.id) {
          this.selectedCategoryOptions[field._id][0] = option.id;
        } else {
          this.selectedCategoryOptions[field._id] = [];
        }
      } else {
        if (!this.selectedCategoryOptions[field._id].includes(option.id)) {
          this.selectedCategoryOptions[field._id].push(option.id);
        } else {
          // tslint:disable-next-line: max-line-length
          this.selectedCategoryOptions[field._id].splice(this.selectedCategoryOptions[field._id].indexOf(option.id), 1);
        }
        // tslint:disable-next-line: max-line-length
        this.selectedCategoryMultipleOptions[field._id] = this.selectedCategoryOptions[field._id].reduce((result, optionId, ind) => {
          const optionData = field.options.selectOptions.find(op => op.id === optionId);
          result += ` ${optionData.label}${ind !== this.selectedCategoryOptions[field._id].length - 1 ? "," : ""}`;
          return result;
        }, "");
      }
      this.addRecord(this.selectedCategoryOptions[field._id], field);
    }
  }

  toggleHelpText(label) {
    if (this.showHelpText === label) {
      this.showHelpText = "";
    } else {
      this.showHelpText = label;
    }
  }

  removeMember(field, index) {
    if ((this.recordData && !this.recordData.record.readOnly) || (!this.recordData)) {
      const member = this.selectedMembers[field.label].splice(index, 1);
      const memberObj = this.members.find(mem => mem._id === member[0].id);
      if (memberObj.avatar && memberObj.avatar !== "undefined") {
        memberObj.avatar = environment.MEDIA_URL + memberObj.avatar;
      } else {
        memberObj.avatar = "../../../../../assets/images/user.png";
      }
      this.membersList[field.label].push(memberObj);
      this.addRecord("", field, "remove");
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }


  openMentionList() {
    const el = document.getElementById("commentSectionRecord");
    el.focus();
    this.mention.startSearch();
  }

  falseMentionUserSelect() {
    this.isMentionUserSelect = false;
  }

  trueMentionUserSelect() {
    setTimeout(() => {
      this.isMentionUserSelect = true;
    }, 250);
  }

  async deleteRecordComment(id) {
    await this.apiService
      .deleteWithHeader(`record/${id}/deleteComment`)
      .then((jresponse: JReponse) => {
        this.helperService.showSuccessToast(jresponse.message);
        this.getComments();
        this.getActivities();
      })
      .catch((err: any) => {
        throw err;
      });
  }

  async likeRecordComment(id) {
    await this.apiService
      .getWithHeader(`record/${id}/commentLikes`)
      .then((jresponse: JReponse) => {
        this.getComments();
        this.getActivities();
      })
      .catch((err: any) => {
        throw err;
      });
  }


  editRecordComment(id, comment) {
    let commentText;
    let userIds = []
    if (comment.comment_for_update && comment.comment_for_update != '') {
      commentText = comment.comment_for_update.split('{{');
      commentText = commentText.filter(e => e.includes('}}'));
      commentText.forEach(e => {
        userIds.push((e.split('}}')[0]));
        // splitText = e.split('}}')[1];
      });
      let data = _.chain(this.mentionUsersList)
        .keyBy('_id')
        .at(userIds)
        .value();
      let latestField = data.map(obj => {
        let newObj = obj;
        newObj.old_id = `{{${newObj._id}}}`
        newObj.old_name = obj.lastName && !_.isEmpty(obj.lastName) ? obj.firstName + ' ' + obj.lastName : obj.firstName;
        newObj.fullName = obj.old_name;
        newObj.id = obj.old_id;
        newObj.name = obj.old_name;
        delete newObj.old_id;
        delete newObj.old_name
        return newObj
      })
      selectedMentionUsers = latestField;
    }
    this.editComment = comment.comment;
    this.commentId = id;
    this.appViewService.sendRecordMentionData({ comment: this.editComment, comment_for_update: comment.comment_for_update, selectedMentionUsers: selectedMentionUsers });

    this.cdRef.detectChanges();
    let elms = document.querySelectorAll("div.client-name");
    for (let i = 0; i < elms.length; i++) {
      elms[i].setAttribute("contenteditable", "false");
    }
  }
  redirectBuilder() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
    if (this.revisionModalRef) {
      this.revisionModalRef.hide();
    }
    this.homeService.recordModalRef.hide();
    this.router.navigate(["/application/home/application-builder"], {
      queryParams: {
        appId: this.appId,
      },
    });
  }
  ngOnDestroy() {
    this.uploadImageSubscription.unsubscribe();
    this.refreshCommentSubscription.unsubscribe();
  }
  async openModal(type, recordData = "") {
    this.selectedCategoryMultipleOptions = {};
    this.imageDisplayData = {};
    this.selectedCategoryOptions = {};
    this.selectedMembers = {};
    this.progressData = {};
    this.editComment = '&nbsp;';
    this.showValidationErrors = false;
    this.showModal = true;
    await this.getUsersForMention(
      this.workspaceId,
      "mention",
      this.createdByUserKeyword
    );
    this.appForm.reset();
    // this.appForm= this.fb.group({})
    await this.getMembers();

    this.editSessionId = uuid();
    if (
      type === "add" ||
      type === "category" ||
      type === "member" ||
      type === "calendar" ||
      type === "new"
    ) {
      // To reset form and other sections

      //  this.setForm(this.appFields, true);
      this.appActivities = [];
      this.appComments = [];

      // To reset selected member
      this.appFields.forEach((data) => {
        if (data.type == 'member') {
          this.membersList[data.label] = this.members;
          this.membersList[data.label].map((member) => {
            if (
              member.avatar &&
              member.avatar !== "undefined"
            ) {
              member.avatar =
                environment.MEDIA_URL + member.avatar;
            } else {
              member.avatar = "../../../../../assets/images/user.png";
            }
          });
        }
        if (data.type == 'relationship') {
          this.selectedRecord[data.label] = [];
        }
      });
      this.appViewService
        .getRecordId({ application_id: this.appId, data: [] })
        .then(async (jresponse: JReponse) => {
          if (jresponse.success) {

            this.recordId = jresponse.body.record_id;
            this.openingModal = false;

            // if (type === "category" || type === "member") {
            //   // Formatting the object as per the event object in order to use the addRecord function directly
            //   const obj = { value: this.recordCategory.id };
            //   const categoryField = this.appFields.find(
            //     (field) => field._id === this.recordCategory.fieldId
            //   );
            //   if (type === "member") {
            //     this.appViewService.apiCalled = true;
            //   }
            //   if (categoryField) {
            //     this.selectedCategoryOptions[this.recordId] = {};
            //     const option = categoryField.options.selectOptions.find(
            //       (option) => option.id === this.recordCategory.id
            //     );
            //     this.selectedCategoryOptions[this.recordId][
            //       categoryField._id
            //     ] = [option.id];
            //     await this.addRecord(obj, categoryField);
            //   }
            // }
            // if (type === "member") {
            //   const memberField = this.appFields.find(
            //     (field) => field._id === this.newMultiValueRecordData.fieldId
            //   );
            //   this.appViewService.apiCalled = false;
            //   if (
            //     this.newMultiValueRecordData.member &&
            //     this.newMultiValueRecordData.member !== "none" &&
            //     memberField
            //   ) {
            //     // tslint:disable-next-line: max-line-length
            //     const memberData = JSON.parse(
            //       JSON.stringify(
            //         this.appViewService.wsMembers.find(
            //           (member) =>
            //             member._id === this.newMultiValueRecordData.member
            //         )
            //       )
            //     );
            //     memberData.avatar =
            //       memberData.avatar && memberData.avatar !== "undefined"
            //         ? environment.MEDIA_URL + memberData.avatar
            //         : "../../../../../assets/images/user.png";
            //     // tslint:disable-next-line: max-line-length
            //     const index = this.membersList[memberField.label].findIndex(
            //       (member) => member._id === this.newMultiValueRecordData.member
            //     );
            //     await this.addRecord(memberData, memberField, "add", index);
            //   }
            // }
          }
        })
        .catch((err: Error) => {
          throw err;
        });
      if (type !== "new") {
        document.getElementById("recordModalButton").click();
      }
      setTimeout(() => {
        this.isModalOpen = true;
      }, 200);
      this.appViewService.apiCalled = false;
    } else if (type === "edit") {
      // this.openingModal = true;
      // To reset selected member
      this.selectedMembers = {};
      this.setForm({ label: "" }, true);
      // To set form values only after the form is set
      setTimeout(() => {
        this.setFormValues();
        const record = this.recordFormValues.find(rec => rec._id === this.recordId);
        if (record) {
          this.followers = record.followers;
        }
      }, 0);
    }
  }
  openSeparateModal(templateClass, template: TemplateRef<any>, type = "") {

    this.appViewService.refreshApps(
      this.workspaceId,
      this.homeService.wsRole
    );
    this.workspaceAppsList = this.appViewService.workspaceAppsList;
    this.activeApplication = this.workspaceAppsList.find(
      (app) => app._id === this.appId
    );
    // To reset all the variables used in the share record modal
    this.selectedShareRecordUsers = [];
    this.shareRecordMessage = "";
    this.selectedShareRecordUserIds = [];
    this.suggestedUsers = [];
    this.shareWorkspaceRole = "member";
    if (this.modalRef) {
      this.modalRef.hide();
    }
    if (type) {
      this.shareRecordModalType = type;
    }
    const initialState = { class: templateClass,animated: true,
      keyboard: true,
             backdrop: true,
          ignoreBackdropClick: false };
    this.modalRef = this.modalService.show(template, initialState);

  }
  setWorkspaceRole(type) {
    this.showWorkspaceRoleOptions = false;
    if (type === "admin") {
      this.shareWorkspaceRole = "admin";
    } else if (type === "member") {
      this.shareWorkspaceRole = "member";
    } else {
      this.shareWorkspaceRole = "light-member";
    }
  }
  searchUsers(event) {
    this.shareRecordEmailOnly = event.target.value;
    if (event.target.value.length >= 3) {
      this.appViewService
        .getUsers(this.orgId, event.target.value)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.suggestedUsers = jresponse.body;
            if (!this.suggestedUsers.length) {
              this.showRecordEmailOnly = true;
            } else {
              this.showRecordEmailOnly = false;
              this.suggestedUsers = this.suggestedUsers.filter(
                (user) =>
                  !this.selectedShareRecordUserIds.includes(user.user_id._id)
              );
            }
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    } else {
      this.suggestedUsers = [];
      this.showRecordEmailOnly = false;
    }
  }
  hideUpgradePlanPopup(event) {
    if (event.target.className !== "checkmark") {
      this.showUpgradePlanPopup = false;
    }
  }

  addUser(user) {
    if (user) {
      this.suggestedUsers.splice(
        this.suggestedUsers.findIndex(
          (data) => data.user_id._id === user.user_id._id
        ),
        1
      );
      this.selectedShareRecordUsers.push(user);
      this.selectedShareRecordUserIds.push(user.user_id._id);
    } else {
      this.selectedShareRecordUsers.push(this.shareRecordEmailOnly);
    }
  }

  shareRecord() {
    const users = this.selectedShareRecordUsers.map((user) => {
      const userObj = { user_id: "", email: "" };
      if (user.user_id) {
        userObj.user_id = user.user_id._id;
        userObj.email = user.user_id.email;
      } else {
        userObj.email = user;
      }
      return userObj;
    });
    const checkBoxEl: any = document.getElementById("readOnlyCheckbox");
    const data: any = {
      application_id: this.appId,
      record_id: this.recordId,
      users,
      message: this.shareRecordMessage,
    };
    if (this.shareRecordModalType === "record") {
      data.readOnly = checkBoxEl.checked;
      this.appViewService
        .shareRecord(data)
        .then(async (jresponse: JReponse) => {
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            this.modalRef.hide();
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    } else {
      data.users.forEach((user) => {
        user.role = this.shareWorkspaceRole;
      });
      data.organization_id = this.orgId;
      data.workspace_id = this.activeApplication.workspace_id._id;
      this.appViewService
        .workspaceInvitation(data)
        .then(async (jresponse: JReponse) => {
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            this.modalRef.hide();
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    }
  }

  removeSelectedShareRecordUser(user, type = "") {
    if (type === "email-only") {
      this.selectedShareRecordUsers.splice(
        this.selectedShareRecordUsers.findIndex((u) => u === user),
        1
      );
    } else {
      this.selectedShareRecordUsers.splice(
        this.selectedShareRecordUsers.findIndex(
          (user) => user.user_id._id === user.user_id._id
        ),
        1
      );
      this.selectedShareRecordUserIds.splice(
        this.selectedShareRecordUserIds.findIndex(
          (userId) => userId === user.user_id._id
        ),
        1
      );
      if (this.shareRecordEmailOnly.length >= 3 && !this.showRecordEmailOnly) {
        this.suggestedUsers.push(user);
      }
    }
  }
  async getUsersForMention(wsId: string, type: string, keyword: string) {
    await this.appViewService
      .mentionUserForComment(wsId, keyword)
      .then((jresponse: JReponse) => {
        this.members = jresponse.body;
        //  this.appViewService.wsMembers = this.wsMembers;
        if (!keyword.length) {
          this.getMembers();
        }
        if (type === "filter" && keyword.length) {
          this.createdByUserList = [];
          this.createdByUserList = jresponse.body;
          this.createdByUserList = this.createdByUserList.filter((element) => {
            return element !== null;
          });
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }
  upgradePlan() {
    if (this.helperService.orgList) {
      this.router.navigateByUrl(
        `application/home/upgrade?orgId=${this.helperService.orgList[0]._id}`
      );
      // this.modalRef.hide();
      // if (this.helperService.orgList.length > 1) {
      //   this.openUpgradeModal();
      // } else {
      //   document.getElementById("closeRecordModalBtn").click();
      //   this.router.navigateByUrl(
      //     `application/home/upgrade?orgId=${this.helperService.orgList[0]._id}`
      //   );
      // }
      // this.showUpgradePlanPopup = false;
    }
  }
  openUpgradeModal() {
    const modalParams = Object.assign(
      {},
      { class: "small-custom-modal custom-upgrade-modal",animated: true,
      keyboard: true,
        backdrop: true,
          ignoreBackdropClick: false }
    );
    this.modalRef = this.modalService.show(UpgradePopupComponent, modalParams);
  }
  shareRecordCheckBoxClicked() {
    if (this.orgPlan !== 'pro') {
      this.showUpgradePlanPopup = true;
    }
  }
  addMessage(event) {
    this.shareRecordMessage = event.target.value;
  }
  displaySearch(field) {
    field.relationSearch = true;
  }
  getAppList(event, field) {
    this.appFields.forEach((element) => {
      if (element.appRecords) {
        element.appRecords = [];
      }
    })
    document.getElementById(field._id.toString()).focus();
    const keyword = event.target.value;
    let query = "";
    if (keyword) {
      query = `?keyword=${keyword}`;
    }
    this.appViewService
      .getAppList({ applications: field.options.selectedApps }, query)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.displayApps = true;
          field.appRecords = jresponse.body;
          field.appRecords.forEach((field) => {
            field.list.forEach((record) => {
              const options = _.find(record.data, (fieldobj) => {
                if (fieldobj.value.text) {
                  return fieldobj.value.text;
                }
              });
              const member = _.find(record.data, (fieldobj) => {
                if (fieldobj.value.members) {
                  return fieldobj.value.members[0];
                }
              });
              const category = _.find(record.data, (fieldobj) => {
                if (
                  fieldobj.value.select &&
                  fieldobj.field_id.options &&
                  fieldobj.field_id.options.choice == "Single choice"
                ) {
                  return fieldobj.value.select;
                }
              });
              const title =
                options &&
                  !_.isEmpty(options) &&
                  typeof options.value.text == "string"
                  ? options.value.text
                  : "";
              const user =
                member && !_.isEmpty(member) ? member.value.members[0] : "";
              const categorySingle =
                category &&
                  !_.isEmpty(category) &&
                  typeof category.value.select == "string"
                  ? category.value.select
                  : "";
              record.recordName = title;
              record.member = user;
              record.category = categorySingle;
            });
            let list;
            if (keyword) {
              list = field.list.filter((data) =>
                data.recordName
                  .toLowerCase()
                  .includes(event.target.value.toLowerCase())
              );
            } else {
              list = _.filter(field.list, (source) => {
                if (source.recordName) {
                  return source;
                }
              });
            }
            field.list = list;
          });
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }
  selectRecord(app, record, field) {
    field.relationSearch = false;
    this.displayApps = false;
    // return false
    const recordObj = {
      _id: record._id,
      recordName: record.recordName,
      member: record.member ? record.member : "",
      category: record.category ? record.category : "",
      appId: record.application_id,
      application_id: {
        _id: record.application_id,
        name: record.application.name,
      },
      workspace_id: {
        _id: record.application.workspace_id._id,
        name: record.application.workspace_id.name,
      },
    };
    this.selectedRecord[field.label] = this.selectedRecord[field.label]
      ? this.selectedRecord[field.label]
      : [];
    const availableRecord = _.find(this.selectedRecord[field.label], {
      _id: record._id,
    });
    if (!availableRecord) {
      this.selectedRecord[field.label].push(recordObj);
    } else {
      const title = _.find(this.selectedRecord[field.label], {
        _id: record._id,
      });
      title.recordName = record.recordName;
    }
    const json = JSON.parse(JSON.stringify(this.selectedRecord[field.label]));
    const filterObj = _.filter(json, (obj) => {
      delete obj.workspace_id;
      delete obj.memberObj;
      delete obj.application_id;
      delete obj.selectedCategory;
      delete obj.categoryObj;
      return obj;
    });

    // return false
    const recordData = {
      fieldType: "relationship",
      application_id: this.appId,
      record_id: this.recordId,
      uniqueId: this.editSessionId,
      fieldId: field._id,
      value: JSON.stringify({ text: filterObj }),
    };
    this.appViewService.setField(recordData).then((jresponse: JReponse) => {
      this.mapSuggestion = {};
      if (jresponse.success) {
        this.appViewService
          .getSingleRecord(this.recordId)
          .then((jresponse: JReponse) => {
            if (jresponse.success) {
              if (jresponse.body && jresponse.body.length > 0) {
                const record = jresponse.body[0];
                this.recordFormValues = record.data;
                this.setFormValues();
                //this.revisionModalRef.hide();
              }
            }
          })
          .catch((err: Error) => {
            throw err;
          });
      }
    }).catch((err: Error) => {
      throw err;
    });;
  }
  removeRecord(record, index, field) {
    this.displayApps = false;
    this.selectedRecord[field.label].splice(index, 1);
    const json = JSON.parse(JSON.stringify(this.selectedRecord[field.label]));
    const filterObj = _.filter(json, (obj) => {
      delete obj.workspace_id;
      delete obj.memberObj;
      delete obj.application_id;
      delete obj.selectedCategory;
      delete obj.categoryObj;
      return obj;
    });

    const recordData = {
      fieldType: "relationship",
      application_id: this.appId,
      record_id: this.recordId,
      uniqueId: this.editSessionId,
      fieldId: field._id,
      value: JSON.stringify({ text: filterObj }),
    };
    this.appViewService.setField(recordData).then((jresponse: JReponse) => {
      this.mapSuggestion = {};
      if (jresponse.success) {
        this.appViewService
          .getSingleRecord(this.recordId)
          .then((jresponse: JReponse) => {
            if (jresponse.success) {
              if (jresponse.body && jresponse.body.length > 0) {
                const record = jresponse.body[0];
                this.recordFormValues = record.data;
                this.setFormValues();
                //this.revisionModalRef.hide();
              }
            }
          })
          .catch((err: Error) => {
            throw err;
          });
      }
    }).catch((err: Error) => {
      this.helperService.showErrorToast(err.message);
      this.showProgress = false;
      throw err;
    });
  }
  openRelationRecordModal(recordData) {
    this.appViewService.refreshApps(
      this.workspaceId,
      this.homeService.wsRole
    );
    this.workspaceAppsList = this.appViewService.workspaceAppsList;
    const recordId = recordData._id;
    this.appViewService
      .getSingleRecord(recordId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {

          const record = jresponse.body[0];
          const initialState = {
            recordId,
            appFields: record.appFields,
            recordFormValues: record.data,
            appId: record.application_id,
            workspaceId: record.workspace_id,
            orgId: record.organization_id,
            type: "relation",
          };
          if (this.revisionModalRef) {
            this.revisionModalRef.hide();
          }
          if (this.modalRef) {
            this.modalRef.hide();
          }
          if (this.homeService.recordModalRef) {
            this.homeService.recordModalRef.hide();
          }

          // document.getElementById("closeRecordModal").click();
          this.homeService.recordModalRef = this.modalService.show(
            RecordModalComponent,
            { initialState, class: "modal-lg",animated: true,
            keyboard: true,
              backdrop: true,
          ignoreBackdropClick: false }
          );
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }
  changeCategory(event, record, field) {
    record.category = event.id;
    this.selectedRecord[field.label] = this.selectedRecord[field.label]
      ? this.selectedRecord[field.label]
      : [];
    const availableRecord = _.find(this.selectedRecord[field.label], {
      _id: record._id,
    });
    if (!availableRecord) {
      this.selectedRecord[field.label].push(record);
    } else {
      const title = _.find(this.selectedRecord[field.label], {
        _id: record._id,
      });
      title.recordName = record.recordName;
    }

    const recordData = {
      fieldType: "relationship",
      application_id: record.appId,
      record_id: record._id,
      uniqueId: this.editSessionId,
      fieldId: record.field,
      value: JSON.stringify({ select: event.id }),
    };
    this.appViewService.setField(recordData).then((jresponse: JReponse) => {
      this.mapSuggestion = {};
      if (jresponse.success) {
        this.appViewService
          .getSingleRecord(this.recordId)
          .then((jresponse: JReponse) => {
            if (jresponse.success) {
              if (jresponse.body && jresponse.body.length > 0) {
                const record = jresponse.body[0];
                this.recordFormValues = record.data;
                this.setFormValues();
                //this.revisionModalRef.hide();
              }
            }
          })
          .catch((err: Error) => {
            throw err;
          });
      }
    }).catch((err: Error) => {
      this.helperService.showErrorToast(err.message);
      this.showProgress = false;
      throw err;
    });;
  }
  
  // CHECK FILE - IMAGE / DOC 
  // TO RENDER FILE VIEW COMPONENT 
  checkTypeAndGetImageDoc(getImagePath:any){
  return this.helperFunctions.checkTypeAndGetImageDoc(getImagePath);
  }

  // GET ATTACHMENT URL 
  // IF URL CONTAINS 'DOC' PARAM 
  getAttachmentcUrl(getImagePath:any,action:any = 'view'){
    return this.helperFunctions.getAttachmentcUrl(getImagePath,action);
  }

  // DOWNALOD API FOR ATTACHMENT - IN MODAL BOX 
  async getDownloadAttachment(filename:any){
    return this.helperFunctions.getDownloadAttachment(filename);
  }

  // GET FILE ICON USING EXTENSION 
  getFileIconUsingExtension(extension:any){
    return this.helperFunctions.getFileIconUsingExtension(extension);
  }

  // GET FILE SUPPORTED FORMAT 
  getSupportedFormat(fileExtension:any){
    return this.helperFunctions.getSupportedFormat(fileExtension);
  }

  closeModalBox(){
    return this.helperFunctions.closeModalBox();
  }

}
