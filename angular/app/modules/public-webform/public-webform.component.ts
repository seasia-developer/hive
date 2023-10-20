import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Constants } from "src/app/constants/constants";
import {
  FormGroup,
  FormArray,
  FormControl,
  Validators,
  FormBuilder,
} from "@angular/forms";
import { environment } from "src/environments/environment";
import { APIService, JReponse } from "src/app/services/api.service";
import { AppViewService } from "../application/home/application-view/application-view.service";
import { HelperService } from "src/app/services/helper.service";
import { v4 as uuid } from "uuid";

@Component({
  selector: "app-public-webform",
  templateUrl: "./public-webform.component.html",
  styleUrls: ["./public-webform.component.scss"],
})
export class PublicWebformComponent implements OnInit {
  appId = "";
  appFieldData = [];
  appFieldTypes = Constants.APP_FIELD_TYPES;
  phoneArray: FormArray;
  appForm: FormGroup;
  emailArray: FormArray;
  phoneTypes = Constants.PHONE_TYPES;
  emailTypes = Constants.EMAIL_TYPES;
  moneyTypes = Constants.CURRENCY_TYPES;
  linkPreviewData = {};
  membersList: any = {};
  mapSuggestion: any = {};
  mapData: any = {};
  dpValue: { event: any; field: any; type: any };
  dpValueChanged = false;
  dpShown = false;
  selectedCategoryOptions: any = {};
  selectedCategoryMultipleOptions: any = {};
  showCategoryDropdown = "";
  invalidMemberFields = [];
  invalidDurationFields = [];
  invalidImageFields = [];
  membersListMenu: string;
  memberFields = [];
  imageDisplayData: any = {};
  fileTypes = Constants.FILE_TYPES;
  selectedFiles: any = {};
  selectedMembers: any = {};
  mediaUrl = environment.MEDIA_URL;
  progressData: any = {};
  numberFields = [];
  calculationFields = [];
  isFormInactive = true;
  settings: any = {};
  workspaceId: any;
  orgId: any;
  recordId: any;
  uniqueId: any;
  showFields = [];
  isAllowedDomain = true;
  showHelpText;
  showValidationErrors = false;
  type = "";
  submitted=false;
  isWebformSubmitted:any = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: APIService,
    private appViewService: AppViewService,
    private fb: FormBuilder,
    private helperService: HelperService
  ) {
    this.appForm = this.fb.group({});
  }

  ngOnInit() {
    this.appId = this.activatedRoute.snapshot.queryParams.appId;
    this.workspaceId = this.activatedRoute.snapshot.queryParams.workspaceId;
    this.orgId = this.activatedRoute.snapshot.queryParams.orgId;
    this.type = this.activatedRoute.snapshot.queryParams.type;
    if (this.appId) {
      this.getConfiguration(this.appId);
      // this.getAppFields(this.appId);
    }

    if(localStorage.getItem('isWebformSubmitted')){
      const localWebFormSubmittedData = JSON.parse(localStorage.getItem('isWebformSubmitted'));
      if(
        localWebFormSubmittedData.appId === this.appId 
        && 
        localWebFormSubmittedData.workspaceId === this.workspaceId 
        &&
        localWebFormSubmittedData.orgId === this.orgId 
        && 
        localWebFormSubmittedData.type === this.type
        ){
          this.isWebformSubmitted = true;
        }
    }
    
  }

  getConfiguration(appId) {
    this.apiService
      .get(`/application/getWebform/${appId}`)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.settings = jresponse.body;
          let invalidDomain = true;
          for (const domain of this.settings.domains) {
            if (domain.includes(window.location.host)) {
              invalidDomain = false;
            }
          }
          if (this.type && (this.type === "sharable" || this.type[0] === "sharable")) {
            if (this.settings.form_status) {
              this.showFields = this.settings.configuration.active;
              this.isFormInactive = false;
              this.getAppFields(this.appId);
              this.uniqueId = uuid();
            }
          } else {
            if (this.settings.form_status && !invalidDomain) {
              this.showFields = this.settings.configuration.active;
              this.isFormInactive = false;
              this.getAppFields(this.appId);
              this.uniqueId = uuid();
            }
          }
        }
      })
      .catch((err: any) => {
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

  async getAppFields(appId) {
    return new Promise((resolve, reject) => {
      this.appViewService
        .getFields(appId, true)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.appFieldData = jresponse.body.filter((field) => {
              return this.settings.configuration.active.includes(field._id);
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

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
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
  }

  addMember(user, field) {
    if (!this.selectedMembers[field.label]) {
      this.selectedMembers[field.label] = [];
    }
    this.selectedMembers[field.label].push(user);
    this.membersList[field.label].splice(this.membersList[field.label].findIndex(u => u._id === user._id), 1);
    this.membersListMenu = "";
  }

  removeMember(field, i) {
    this.membersList[field.label].push(...
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
          // case this.fileTypes.zip:
          // case "application/x-zip-compressed":
          //   this.imageDisplayData[field._id].push(
          //     "../../../../../../assets/images/file-types/Zip.svg"
          //   );
          //   break;
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

  getRecordId() {
    this.appViewService
      .getRecordId({ application_id: this.appId, data: [] }, true)
      .then(async (jresponse: JReponse) => {
        if (jresponse.success) {
          this.recordId = jresponse.body.record_id;
        }
      })
      .catch((err: Error) => {
        throw err;
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

  setTextAreaLength(label) {
    if (document.getElementById(label)) {
      const element = document.getElementById(label);
      element.style.height = "1px";
      element.style.height = 2 + element.scrollHeight + "px";
    }
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
      .getLinkPreview(url, true)
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
        // tslint:disable-next-line: max-line-length
        this.selectedCategoryOptions[field._id].splice(
          this.selectedCategoryOptions[field._id].indexOf(option.id),
          1
        );
        if (!this.selectedCategoryOptions[field._id].length) {
          this.appForm.controls[field.label].reset();
        }
      }
      // tslint:disable-next-line: max-line-length
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
      .getGeoCode(event.target.value, true)
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
      .getMap(item.coordinate, true)
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

  async getMembers() {
    return new Promise((resolve, reject) => {
      this.appViewService
        .getMembers(this.orgId, "", true)
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

   addRecord() {

    this.submitted=true;
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      const requestArray = [];
      this.appFieldData.forEach((field) => {
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
            if (this.selectedMembers[field.label]) {
              const members = this.selectedMembers[field.label].map(
                (member) => member.user_id._id
              );
              const memberData = {
                fieldType: field.type,
                field_id: field._id,
                value: { members },
              };
              requestArray.push(memberData);
            }

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
            if (this.selectedCategoryOptions[field._id]) {
              let categoryVal = "";
              if (field.options.choice === "Single choice") {
                categoryVal = this.selectedCategoryOptions[field._id][0];
              } else {
                categoryVal = this.selectedCategoryOptions[field._id];
              }
              const categoryData = {
                fieldType: field.type,
                field_id: field._id,
                value: { select: categoryVal },
              };
              requestArray.push(categoryData);
            }

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
              durationData.value["hours"] = this.appForm.controls[field.label][
                "controls"
              ].hours.value;
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
            if (this.mapData[field.label]) {
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
                  city: this.appForm.controls[field.label]["controls"].city.value,
                  state: this.appForm.controls[field.label]["controls"].state
                    .value,
                  country: this.appForm.controls[field.label]["controls"].country
                    .value,
                  postal: this.appForm.controls[field.label]["controls"]
                    .postalCode.value,
                  street: this.mapData[field.label].street,
                };
                // formData.append("value", JSON.stringify(result));
              }
              requestArray.push(locationData);
            }
            break;
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
      
      // changes  
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
      // changes end
      setTimeout(()=>{
        this.submitted = false;
      },500)

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
      .post("application/addApplicationWebform", data)
      .then((jresponse: JReponse) => {
        this.helperService.showSuccessToast(jresponse.message);
        // To reset for and other relevant data
        this.appForm.reset();
        this.mapData = {};
        this.selectedCategoryOptions = {};
        this.selectedCategoryMultipleOptions = {};
        this.progressData = {};
        this.linkPreviewData = {};
        this.imageDisplayData = {};
        this.selectedMembers = {};

        let webFormData = {
          appId: this.appId,
          workspaceId: this.workspaceId,
          orgId: this.orgId,
          type: this.type,
        }
        localStorage.setItem('isWebformSubmitted',JSON.stringify(webFormData));
        this.isWebformSubmitted = true;
      })
      .catch((err: any) => {
        throw err;
      });
  }
}
