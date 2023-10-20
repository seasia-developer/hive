import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { v4 as uuid } from "uuid";

import { APIService, JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { Constants } from "src/app/constants/constants";
import { AppViewService } from "../application-view.service";
import { environment } from "src/environments/environment";
@Component({
  selector: "app-webform",
  templateUrl: "./webform.component.html",
  styleUrls: ["./webform.component.scss"],
})
export class WebformComponent implements OnInit {
  configurationForm: FormGroup;
  jobAppForm: FormGroup;
  appId;
  workspaceId;
  configurationObj;
  domainsArray = [];
  statusList = [];
  phoneType;
  selectedStatus;
  appFieldData;
  fieldTitle = [];
  phoneTypes = Constants.PHONE_TYPES;
  emailTypes = Constants.EMAIL_TYPES;
  moneyTypes = Constants.CURRENCY_TYPES;
  linkPreviewData = {};
  recordId;
  uniqueId: any;
  appFieldTypes = Constants.APP_FIELD_TYPES;
  phoneArray: FormArray;
  appForm: FormGroup;
  emailArray: FormArray;
  membersList = {};
  mapSuggestion = {};
  mapData = {};
  dpValue: { event: any; field: any; type: any };
  dpValueChanged = false;
  dpShown = false;
  selectedCategoryOptions = {};
  selectedCategoryMultipleOptions = {};
  showCategoryDropdown = "";
  invalidMemberFields = [];
  invalidDurationFields = [];
  invalidImageFields = [];
  membersListMenu: string;
  orgId: any;
  memberFields = [];
  imageDisplayData = {};
  fileTypes = Constants.FILE_TYPES;
  selectedFiles = {};
  selectedMembers = {};
  mediaUrl = environment.MEDIA_URL;
  progressData = {};
  numberFields = [];
  calculationFields = [];
  showFields = [];
  shareableLink = environment.WEBFORM_URL;
  showHelpText;
  showValidationErrors = false;
  submitted=false;

  constructor(
    private helperService: HelperService,
    private apiService: APIService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    public appViewService: AppViewService
  ) {
    this.statusList = Constants.TASK_STATUS;
    this.appForm = this.fb.group({});
    // this.appForm.addControl(
    //   "Phone",
    //   new FormArray([this.addPhoneArrayControl({}, false)])
    // );
    // this.appForm.addControl(
    //   "Email",
    //   new FormArray([this.addEmailArrayControl({}, false)])
    // );
  }

  async ngOnInit() {
    this.appId = this.activatedRoute.snapshot.queryParams.appId;
    this.workspaceId = this.activatedRoute.snapshot.queryParams.workspaceId;
    this.orgId = this.activatedRoute.snapshot.queryParams.orgId;
    this.shareableLink += `?appId=${this.appId}&workspaceId=${this.workspaceId}&orgId=${this.orgId}`;
    document.getElementById(
      "embedded-code"
    ).textContent = ` <iframe src="${this.shareableLink}" style="border-radius: 8px;"></iframe>`;
    if (this.appId) {
      this.getAppFields(this.appId);
      this.getConfiguration(this.appId);
    }
    this.configurationForm = this.fb.group({
      form_status: [false],
      // allow_user_guest: [false],
      // allow_user_read_only: [false],
      title: [""],
      description: [""],
      domainText: [""],
    });
    // this.getRecordId();
    this.uniqueId = uuid();
  }

  setFieldConfiguration(event, field) {
    if (event.target.checked) {
      this.showFields.push(field._id);
    } else {
      this.showFields.splice(this.showFields.indexOf(field._id), 1);
    }
    // this.fieldTitle[index].display = event.currentTarget.checked;
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  getPreview(field) {
    if (this.appForm.controls[field.label].value) {
      this.getLinkPreview(
        this.appForm.controls[field.label].value,
        field.label
      );
    }
  }

  toggleHelpText(label) {
    if (this.showHelpText === label) {
      this.showHelpText = "";
    } else {
      this.showHelpText = label;
    }
  }

  async getAppFields(appId) {
    return new Promise((resolve, reject) => {
      this.appViewService
        .getFields(appId)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.appFieldData = jresponse.body.filter((field) => {
              if (field.type !== "relationship") {
                this.showFields.push(field._id);
                return true;
              }
              return false;
            });
            this.setForm();
            // this.appFieldData.forEach((element) => {
            //   if (element.type === "email") {
            //     this.appForm.addControl(
            //       element.label,
            //       new FormArray([this.addEmailArrayControl({}, false)])
            //     );
            //   }
            //   if (element.type === "phone") {
            //     this.appForm.addControl(
            //       element.label,
            //       new FormArray([this.addPhoneArrayControl({}, false)])
            //     );
            //   }
            //   const data = {
            //     icon: element.icon,
            //     title: element.label,
            //     display: true,
            //     type: element.type,
            //   };
            //   this.fieldTitle.push(data);
            // });
            resolve();
          }
        })
        .catch((err: Error) => {
          reject();
          throw err;
        });
    });
  }

  async setForm() {
    // this.invalidDurationFields = [];
    // this.invalidImageFields = [];
    // this.calculationFields = [];
    // this.numberFields = [];
    // // To reset form
    // this.appForm = this.fb.group({});
    // // To reset map data
    // this.mapSuggestion = {};
    // this.mapData = {};
    // // To reset image data
    // this.imageData = [];
    // // this.imageDisplayData = [];
    // // To reset progress data
    // this.progressData = {};
    // this.modalFields = this.appFields;
    // // To reset category data
    // this.selectedCategoryMultipleOptions = {};
    // this.selectedCategoryOptions = {};

    // this.appFieldData.forEach((field) => {
    for (const field of this.appFieldData) {
      if (field.type === "number" || field.type === "money") {
        this.numberFields.push(field);
      }
      if (field.type === "calculator") {
        this.calculationFields.push(field);
      }
      // if (field.type === "image" && field.options.Required) {
      //   this.invalidImageFields.push(field._id);
      // }
      switch (field.type) {
        case Constants.APP_FIELD_TYPES.TEXT:
        case Constants.APP_FIELD_TYPES.NUMBER:
        case Constants.APP_FIELD_TYPES.CALCULATOR:
        case Constants.APP_FIELD_TYPES.RELATIONSHIP:
        // this.appForm.addControl(
        //   field.label,
        //   new FormArray([this.addValue('','')])
        // );
        case Constants.APP_FIELD_TYPES.LINK:
          this.appForm.addControl(field.label, new FormControl(""));
          if (field.options.Required) {
            this.appForm.controls[field.label].setValidators(
              Validators.required
            );
          }
          break;

        case Constants.APP_FIELD_TYPES.PHONE:
          this.appForm.addControl(
            field.label,
            new FormArray([
              this.addPhoneArrayControl({}, field.options.Required),
            ])
          );
          // if (field.options.Required) {
          //   this.appForm.controls[field.label].setValidators(
          //     Validators.required
          //   );
          // }
          break;

        case Constants.APP_FIELD_TYPES.EMAIL:
          this.appForm.addControl(
            field.label,
            new FormArray([
              this.addEmailArrayControl({}, field.options.Required),
            ])
          );
          if (field.options.Required) {
            this.appForm.controls[field.label].setValidators(
              Validators.required
            );
          }
          break;

        case Constants.APP_FIELD_TYPES.MONEY:
          this.appForm.addControl(field.label, new FormControl(""));
          this.appForm.addControl(`${field.label}Type`, new FormControl(""));
          if (field.options.Required) {
            this.appForm.controls[field.label].setValidators(
              Validators.required
            );
            this.appForm.controls[`${field.label}Type`].setValidators(
              Validators.required
            );
          }
          break;

        case Constants.APP_FIELD_TYPES.MEMBER:
          // await this.getMembers();
          this.memberFields.push(field.label);
          this.membersList[field.label] = JSON.parse(
            JSON.stringify(this.appViewService.members)
          );
          this.appForm.addControl(field.label, new FormControl(""));
          if (field.options.Required) {
            this.appForm.controls[field.label].setValidators(
              Validators.required
            );
          }
          // this.membersList[field.label].map((member) => {
          //   if (
          //     member.user_id.avatar &&
          //     member.user_id.avatar !== "undefined"
          //   ) {
          //     member.user_id.avatar =
          //       environment.MEDIA_URL + member.user_id.avatar;
          //   } else {
          //     member.user_id.avatar = "../../../../../assets/images/user.png";
          //   }
          // });
          break;

        case Constants.APP_FIELD_TYPES.CATEGORY:
          this.appForm.addControl(field.label, new FormControl(""));
          if (field.options["Required field"]) {
            this.appForm.controls[field.label].setValidators(
              Validators.required
            );
          }
          break;

        case Constants.APP_FIELD_TYPES.DURATION:
          this.appForm.addControl(
            field.label,
            this.durationControl(field.options, field.options.Required)
          );
          // if (field.options.Required) {
          //   this.invalidDurationFields.push(field._id);
          // }
          break;

        case Constants.APP_FIELD_TYPES.PROGRESS:
          this.appForm.addControl(field.label, new FormControl(""));
          if (field.options.Required) {
            this.appForm.controls[field.label].setValidators(
              Validators.required
            );
          }
          break;

        case Constants.APP_FIELD_TYPES.LOCATION:
          if (field.options.display === "Single line address") {
            this.appForm.addControl(field.label, new FormControl(""));
            if (field.options.Required) {
              this.appForm.controls[field.label].setValidators(
                Validators.required
              );
            }
          } else {
            this.appForm.addControl(
              field.label,
              this.locationControl(field.options.Required)
            );
          }
          break;

        case Constants.APP_FIELD_TYPES.DATE:
          this.appForm.addControl(field.label, new FormControl(""));
          if (field.options.display === "Show end date") {
            this.appForm.addControl(field.label + "End", new FormControl(""));
            if (field.options.Required) {
              this.appForm.controls[field.label + "End"].setValidators(
                Validators.required
              );
            }
          }
          if (field.options.Required) {
            this.appForm.controls[field.label].setValidators(
              Validators.required
            );
          }
          break;
      }
    }
    this.appForm.updateValueAndValidity();
    await this.getMembers();
    this.memberFields.forEach((label) => {
      this.membersList[label] = JSON.parse(
        JSON.stringify(this.appViewService.members)
      );
    });
    console.log('tesdddt123')
  }

  setTextAreaLength(label) {
    if (document.getElementById(label)) {
      const element = document.getElementById(label);
      element.style.height = "1px";
      element.style.height = 2 + element.scrollHeight + "px";
    }
  }

  addMember(user, field) {
    if (!this.selectedMembers[field.label]) {
      this.selectedMembers[field.label] = [];
    }
    this.selectedMembers[field.label].push(user);
    this.membersListMenu = "";
  }

  removeMember(field, i) {
    this.membersList[field.label].push(
      this.selectedMembers[field.label].splice(i, 1)
    );
  }

  addFiles(event, field, type = "") {
    if (!this.imageDisplayData[field._id]) {
      this.imageDisplayData[field._id] = [];
      this.selectedFiles[field._id] = [];
    }
    // let files = [];
    if (!type) {
      this.selectedFiles[field._id] = event.addedFiles;
    } else {
      this.selectedFiles[field._id] = event.target.files;
    }
    for (const file of this.selectedFiles[field._id]) {
      if (file.type.includes("image")) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imageDisplayData[field._id].push(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        switch (file.type) {
          case this.fileTypes.ods:
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Ods.svg"
            );
            break;
          case this.fileTypes.odt:
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Odt.svg"
            );
            break;
          case this.fileTypes.ppt:
          case "application/mspowerpoint":
          case "application/powerpoint":
          case "application/vnd.ms-powerpoint":
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/ppt.svg"
            );
            break;
          case this.fileTypes.pptx:
          case "application/x-mspowerpoint":
          case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Pptx.svg"
            );
            break;
          case this.fileTypes.doc:
          case "application/msword":
          case "application/doc":
          case "application/ms-doc":
          case "application/msword":
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Doc.svg"
            );
            break;
          case this.fileTypes.docx:
          case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Docx.svg"
            );
            break;
          case this.fileTypes.xls:
          case "application/excel":
          case "application/vnd.ms-excel":
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Xls.svg"
            );
            break;
          case this.fileTypes.xlsx:
          case "application/x-excel":
          case "application/x-msexcel":
          case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Xlsx.svg"
            );
            break;
          case this.fileTypes.mov:
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Mov.svg"
            );
            break;
          case this.fileTypes.mp3:
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Mp3.svg"
            );
            break;
          case this.fileTypes.mp4:
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Mp4.svg"
            );
            break;
          case this.fileTypes.avi:
          case "video/avi":
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/avi.svg"
            );
            break;
          case this.fileTypes.csv:
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Csv.svg"
            );
            break;
          case this.fileTypes.wmv:
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Wmv.svg"
            );
            break;
          case this.fileTypes.zip:
          case "application/x-zip-compressed":
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Zip.svg"
            );
            break;
          case this.fileTypes.text:
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/Txt.svg"
            );
            break;
          case this.fileTypes.pdf:
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/file-types/pdf.svg"
            );
            break;
          default:
            this.imageDisplayData[field._id].push(
              "../../../../../../assets/images/documents.svg"
            );
            break;
        }
      }
    }
  }

  removeFile(i, field) {
    this.imageDisplayData[field._id].splice(i, 1);
  }

  addDomain(event?) {
    if (event) {
      if (event.key === "Enter") {
        if (event.target.value) {
          this.domainsArray.push(event.target.value);
          event.target.value = "";
          this.configurationForm.get("domainText").setValue("");
        }
      }
    } else {
      if (this.configurationForm.get("domainText").value) {
        this.domainsArray.push(this.configurationForm.get("domainText").value);
        this.configurationForm.get("domainText").setValue("");
      }
    }
  }

  removeSelectedDomain(index) {
    this.domainsArray.splice(index, 1);
  }

  getConfiguration(appId) {
    this.apiService
      .getWithHeader(`/application/getWebform/${appId}`)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.configurationObj = jresponse.body;
          if (this.configurationObj) {
            this.setConfigurationForm(this.configurationObj);
          }
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  addApplicationRecord(data) {
    // const data = {
    //   application_id: this.appId,
    //   workspace_id: this.workspaceId,
    //   organization_id: this.helperService.getLocalStore("selectedOrgId"),
    //   business_name: this.jobAppForm.get("business_name").value,
    //   business_description: this.jobAppForm.get("business_description").value,
    //   phone_type: this.phoneType,
    //   business_phone: this.jobAppForm.get("business_phone").value,
    //   business_status: this.selectedStatus,
    //   start: this.configurationForm.get("start").value,
    //   business_manager: this.jobAppForm.get("business_manager").value,
    // };
    this.apiService
      .postWithHeader("application/addApplicationWebform", data)
      .then((jresponse: JReponse) => {
        this.helperService.showSuccessToast(jresponse.message);
        this.appForm.reset();
      })
      .catch((err: any) => {
        throw err;
      });
  }

  addConfiguration() {
    const configuration = { active: this.showFields };
    // this.fieldTitle.forEach((element) => {
    //   configuration[`${element.title}`] = element.display;
    // });
    const data = {
      application_id: this.appId,
      workspace_id: this.workspaceId,
      organization_id: this.helperService.getLocalStore("selectedOrgId"),
      form_status: this.configurationForm.get("form_status").value,
      // allow_user_guest: this.configurationForm.get("allow_user_guest").value,
      // allow_user_read_only: this.configurationForm.get("allow_user_read_only")
      //   .value,
      domains: this.domainsArray,
      configuration,
      title: this.configurationForm.get("title").value,
      description: this.configurationForm.get("description").value,
      embedded_code: "",
      shareable_link: "",
    };
    this.apiService
      .postWithHeader("application/addWebform", data)
      .then((jresponse: JReponse) => {
        this.helperService.showSuccessToast(jresponse.message);
        if (this.appId) {
          this.getConfiguration(this.appId);
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  setConfigurationForm(obj) {
    this.configurationForm.get("form_status").setValue(obj.form_status);
    // this.configurationForm
    //   .get("allow_user_guest")
    //   .setValue(obj.allow_user_guest);
    // this.configurationForm
    //   .get("allow_user_read_only")
    //   .setValue(obj.allow_user_read_only);
    this.configurationForm.get("title").setValue(obj.title);
    this.configurationForm.get("description").setValue(obj.description);
    this.domainsArray = [...obj.domains];
    if (obj.configuration.active) {
      this.showFields = obj.configuration.active;
    }
  }

  getRecordId() {
    this.appViewService
      .getRecordId({ application_id: this.appId, data: [] })
      .then(async (jresponse: JReponse) => {
        if (jresponse.success) {
          this.recordId = jresponse.body.record_id;
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  toggleMembersList(label) {
    if (this.membersListMenu === label) {
      this.membersListMenu = "";
    } else {
      this.membersListMenu = label;
    }
  }

  async getMembers() {
    return new Promise((resolve, reject) => {
      this.appViewService
        .getMembers(this.orgId)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.appViewService.members = jresponse.body;
            resolve();
          }
        })
        .catch((err: Error) => {
          reject();
          throw err;
        });
    });
  }

  async addRecord() {
    
    this.submitted=true;
    //  return false;
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      const requestArray = [];
      this.appFieldData.forEach((field) => {
        if (this.showFields.includes(field._id)) {
         switch (field.type) {
            case this.appFieldTypes.TEXT:
            case this.appFieldTypes.LINK:
              const textData = {
                fieldType: field.type,
                field_id: field._id,
                value: { text: this.appForm.controls[field.label].value },
              };

              requestArray.push(textData);
             
              // formData.append("value", JSON.stringify(textData));

              break;
            case this.appFieldTypes.PHONE:
              const telData = {
                fieldType: field.type,
                field_id: field._id,
                value: { tel: this.appForm.controls[field.label].value },
              };
              requestArray.push(telData);
              

              // formData.append("value", JSON.stringify(telData));
              break;
            case this.appFieldTypes.CALCULATOR:
              const calData = {
                fieldType: field.type,
                field_id: field._id,
                value: { text: this.appForm.controls[field.label].value },
              };
              requestArray.push(calData);

              // formData.append("value", JSON.stringify(calData));
              break;
            case this.appFieldTypes.NUMBER:
              const numberData = {
                fieldType: field.type,
                field_id: field._id,
                value: { text: this.appForm.controls[field.label].value },
              };
              requestArray.push(numberData);

              // formData.append("value", JSON.stringify(numberData));
              break;
            case this.appFieldTypes.IMAGE:
              const imageData = {
                fieldType: field.type,
                field_id: field._id,
                value: {},
              };
              requestArray.push(imageData);
              if (this.selectedFiles[field._id]) {
                for (const img of this.selectedFiles[field._id]) {
                  formData.append(`${field._id}[]`, img);
                }
              }
              break;
            case this.appFieldTypes.EMAIL:
              const emailData = {
                fieldType: field.type,
                field_id: field._id,
                value: { text: this.appForm.controls[field.label].value },
              };
              requestArray.push(emailData);

              // formData.append("value", JSON.stringify(emailData));
              break;
            case this.appFieldTypes.MONEY:
              let type = "";
              if (!this.appForm.controls[field.label].value) {
                type = this.moneyTypes[0];
              }
              const moneyData = {
                fieldType: field.type,
                field_id: field._id,
                value: { number: this.appForm.controls[field.label].value },
              };
              moneyData.value[`${field.label}Type`] =
                type || this.appForm.controls[`${field.label}Type`].value;
              requestArray.push(moneyData);

              // formData.append("value", JSON.stringify(moneyData));
              break;
            case this.appFieldTypes.MEMBER:
              const members = this.selectedMembers[field.label].map(
                (member) => member.user_id._id
              );
              const memberData = {
                fieldType: field.type,
                field_id: field._id,
                value: { members },
              };
              requestArray.push(memberData);

              // formData.append("value", JSON.stringify(memberData));
              break;
            case this.appFieldTypes.DATE:
              const dateData: any = {
                fieldType: field.type,
                field_id: field._id,
                value: { date: this.appForm.controls[field.label].value },
              };
              if (field.options.display === "Show end date") {
                dateData.value["end"] = this.appForm.controls[
                  field.label + "End"
                ].value;
              }
              requestArray.push(dateData);

              // if (type === "start") {
              //   dateData.date = event;
              // } else {
              //   dateData.end = event;
              // }
              // formData.append("value", JSON.stringify(dateData));
              break;
            case this.appFieldTypes.CATEGORY:
              let categoryVal = "";
              if (field.options.choice === "Single choice") {
                if (this.selectedCategoryOptions[field._id]) {
                  categoryVal = this.selectedCategoryOptions[field._id][0];
                }
              } else {
                if (this.selectedCategoryOptions) {
                  categoryVal = this.selectedCategoryOptions[field._id];
                }
              }
              const categoryData = {
                fieldType: field.type,
                field_id: field._id,
                value: { select: categoryVal },
              };
              requestArray.push(categoryData);

              // formData.append("value", JSON.stringify(categoryData));
              break;
            case this.appFieldTypes.PROGRESS:
              const progressData = {
                fieldType: field.type,
                field_id: field._id,
                value: { number: this.appForm.controls[field.label].value },
              };
              requestArray.push(progressData);

              // this.progressData[field.label] = event.value;
              // formData.append("value", JSON.stringify(progressData));
              break;
            case this.appFieldTypes.DURATION:
              const durationData = {
                fieldType: field.type,
                field_id: field._id,
                value: {},
              };
              if (field.options["Display days"]) {
                durationData.value["days"] = this.appForm.controls[field.label][
                  "controls"
                ].days.value;
              }
              if (field.options["Display hours"]) {
                durationData.value["hours"] = this.appForm.controls[
                  field.label
                ]["controls"].hours.value;
              }
              if (field.options["Display minutes"]) {
                durationData.value["minutes"] = this.appForm.controls[
                  field.label
                ]["controls"].minutes.value;
              }
              if (field.options["Display seconds"]) {
                durationData.value["seconds"] = this.appForm.controls[
                  field.label
                ]["controls"].seconds.value;
              }
              requestArray.push(durationData);

              // formData.append("value", JSON.stringify(durationData));
              break;
            case this.appFieldTypes.LOCATION:
              let locationData = {
                fieldType: field.type,
                field_id: field._id,
                value: {},
                
              };
              if (field.options.display === "Single line address") {
                locationData.value = this.mapData[field.label];
                // formData.append("value", JSON.stringify(this.appForm.controls[field.label].value));
              } else {
                locationData.value = {
                  address: this.mapData[field.label].address,
                  city: this.appForm.controls[field.label]["controls"].city
                    .value,
                  state: this.appForm.controls[field.label]["controls"].state
                    .value,
                  country: this.appForm.controls[field.label]["controls"]
                    .country.value,
                  postal: this.appForm.controls[field.label]["controls"]
                    .postalCode.value,
                  street: this.mapData[field.label].street,
                 
                };
                // formData.append("value", JSON.stringify(result));
              }
              requestArray.push(locationData);
              break;
              
          }
         
        }
        
      
      });
      const appObj = {
        applicationId: this.appId,
        orgId: this.orgId,
        workspaceId: this.workspaceId,
        uniqueId: this.uniqueId,
           
      };
      
     
      formData.append("appObject", JSON.stringify(appObj));
      formData.append("request", JSON.stringify(requestArray));
      this.addApplicationRecord(formData);
     
      // formData.append("fieldType", field.type);
      // formData.append("fieldId", field._id);
      // formData.append("application_id", this.appId);
      // formData.append("record_id", this.recordId);
      // formData.append("uniqueId", this.editSessionId);
      // this.appViewService
      //   .setField(formData)
      //   .then((jresponse: JReponse) => {
      //     this.submitted=true;
      //   })
      //   .catch((err: Error) => {
      //     this.submitted=false;
      //     reject();
      //     throw err;
          
      //   });
      setTimeout(()=>{
        this.submitted = false;
      },500)

     
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

    if (this.invalidDurationFields.includes(field._id)) {
      this.invalidDurationFields.splice(
        this.invalidDurationFields.indexOf(field._id),
        1
      );
    }
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

  updateProgress(event, field) {
    this.progressData[field.label] = event.value;
  }

  addValue(event, field) {
    this.calculationFields.forEach((fieldObj) => {
      let formula = fieldObj.options.rawFormula;
      this.numberFields.forEach((numObj) => {
        const id = Number(numObj.uniqueId);
        let val = this.appForm.controls[numObj.label]["_pendingValue"];
        val = val.replace(/,/g, "");
        val = val && val !== "" ? val : 0;
        if (formula.includes(id)) {
          while (formula.includes(id)) {
            formula = formula.replace(id, val);
          }
          fieldObj.isChange = true;
          const calculatorVal = eval(formula);
          fieldObj.calculatorVal = calculatorVal;
          this.appForm.controls[fieldObj.label].setValue(calculatorVal);
          this.appForm.updateValueAndValidity();
        }
      });
    });
  }

  hideLinkPreview(label) {
    this.linkPreviewData[this.recordId][label] = {};
  }

  getLinkPreview(url, label) {
    this.appViewService
      .getLinkPreview(url)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          if (!this.linkPreviewData[this.recordId]) {
            this.linkPreviewData[this.recordId] = {};
          }
          if (jresponse.body.html) {
            this.linkPreviewData[this.recordId][label] = jresponse.body;
          } else {
            delete this.linkPreviewData[this.recordId][label];
          }
        }
      })
      .catch((err: Error) => {
        if (
          this.linkPreviewData[this.recordId] &&
          this.linkPreviewData[this.recordId][label]
        ) {
          delete this.linkPreviewData[this.recordId][label];
        }
        throw err;
      });
  }

  arrayControl(label) {
    return (this.appForm.get(label) as FormArray).controls;
  }

  // For phone array controls
  addAnotherPhone(label, data = {}) {
    this.phoneArray = this.appForm.get(label) as FormArray;
    this.phoneArray.push(this.addPhoneArrayControl(data));
  }

  // For email array controls
  addAnotherEmail(label, data = {}) {
    this.emailArray = this.appForm.get(label) as FormArray;
    if (this.emailArray) {
      this.emailArray.push(this.addEmailArrayControl(data));
    }
  }

  addEmailArrayControl(data: any = {}, isRequired = false) {
    if (Object.keys(data).length) {
      const fg = isRequired
        ? this.fb.group({
            type: [data.type, Validators.required],
            text: [data.text, Validators.required],
          })
        : this.fb.group({
            type: [data.type],
            text: [data.text],
          });
      return fg;
    } else {
      const fg = isRequired
        ? this.fb.group({
            type: [Constants.EMAIL_TYPES[1], Validators.required],
            text: ["", Validators.required],
          })
        : this.fb.group({
            type: [Constants.EMAIL_TYPES[1]],
            text: [""],
          });
      return fg;
    }
  }

  // closeDp() {
  //   if (this.dpValueChanged) {
  //     this.dpValueChanged = false;
  //     this.dpShown = false;
  //     this.addRecord(this.dpValue.event, this.dpValue.field, this.dpValue.type);
  //   }
  //   this.dpShown = false;
  // }

  // dpValueChange(event, field, type) {
  //   this.dpValue = {
  //     event,
  //     field,
  //     type,
  //   };
  //   if (this.dpShown) {
  //     this.dpValueChanged = true;
  //   }
  // }

  addPhoneArrayControl(data: any = {}, isRequired = false) {
    if (Object.keys(data).length) {
      const fg = isRequired
        ? this.fb.group({
            type: [data.type, Validators.required],
            number: [data.number, Validators.required],
          })
        : this.fb.group({
            type: [data.type],
            number: [data.number],
          });
      return fg;
    } else {
      const fg = isRequired
        ? this.fb.group({
            type: [Constants.PHONE_TYPES[1], Validators.required],
            number: ["", Validators.required],
          })
        : this.fb.group({
            type: [Constants.PHONE_TYPES[1]],
            number: [""],
          });
      return fg;
    }
  }

  locationControl(isRequired) {
    const fg = this.fb.group({
      streetAddress: new FormControl("", { updateOn: "blur" }),
      postalCode: new FormControl("", { updateOn: "blur" }),
      city: new FormControl("", { updateOn: "blur" }),
      state: new FormControl("", { updateOn: "blur" }),
      country: new FormControl("", { updateOn: "blur" }),
    });
    if (isRequired) {
      Object.keys(fg.controls).forEach((control) => {
        fg.controls[control].setValidators(Validators.required);
      });
    }
    return fg;
  }

  durationControl(options, isRequired) {
    const fg = new FormGroup({});
    if (options["Display days"]) {
      fg.addControl("days", new FormControl(0));
    }
    if (options["Display hours"]) {
      fg.addControl("hours", new FormControl(0));
    }
    if (options["Display minutes"]) {
      fg.addControl("minutes", new FormControl(0));
    }
    if (options["Display seconds"]) {
      fg.addControl("seconds", new FormControl(0));
    }
    // if (isRequired) {
    //   Object.keys(fg.controls).forEach(control => {
    //     fg.controls[control].setValidators([Validators.required, Validators.min(1)]);
    //   });
    // }
    return fg;
  }

  selectCategoryOption(option, field) {
    if (!this.selectedCategoryOptions[field._id]) {
      this.selectedCategoryOptions[field._id] = [];
    }
    if (field.options.choice === "Single choice") {
      if (this.selectedCategoryOptions[field._id][0] !== option.id) {
        this.selectedCategoryOptions[field._id][0] = option.id;
        this.appForm.controls[field.label].setValue(option.id);
        this.selectedCategoryMultipleOptions[field._id] = option.label;
        this.showCategoryDropdown = "";
      } else {
        this.appForm.controls[field.label].reset();
        this.selectedCategoryOptions[field._id] = [];
        this.selectedCategoryMultipleOptions[field._id] = "";
      }
    } else {
      if (!this.selectedCategoryOptions[field._id].includes(option.id)) {
        this.selectedCategoryOptions[field._id].push(option.id);
        this.appForm.controls[field.label].setValue(option.id);
      } else {
        this.selectedCategoryOptions[field._id].splice(
          this.selectedCategoryOptions[field._id].indexOf(option.id),
          1
        );
        if (!this.selectedCategoryOptions[field._id].length) {
          this.appForm.controls[field.label].reset();
        }
      }
      this.selectedCategoryMultipleOptions[
        field._id
      ] = this.selectedCategoryOptions[field._id].reduce(
        (result, optionId, ind) => {
          const optionData = field.options.selectOptions.find(
            (op) => op.id === optionId
          );
          result += ` ${optionData.label}${
            ind !== this.selectedCategoryOptions[field._id].length - 1
              ? ","
              : ""
          }`;
          return result;
        },
        ""
      );
      this.appForm.updateValueAndValidity();
    }
  }

  getGeoCode(event, field) {
    this.appViewService
      .getGeoCode(event.target.value)
      .then((jresponse: JReponse) => {
        if (jresponse.body.data[0]) {
          if (jresponse.body.data[0].address) {
            this.mapSuggestion[field.label] = jresponse.body.data;
          }
        }
        // this.helperService.setLocalStore("applications", this.workspaceAppsList);
      })
      .catch((err: any) => {
        // this.helperService.showErrorToast(err.error.message);
        throw err;
      });
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
          this.mapSuggestion = {};
          // this.addRecord(this.mapData[field.label], field, type);
        }
      })
      .catch((err: any) => {
        this.helperService.showErrorToast(err.error.message);
        throw err;
      });
  }

  goToLink() {
    this.shareableLink = this.shareableLink + "&type=sharable";
    window.open(this.shareableLink, "_blank");
  }
}
