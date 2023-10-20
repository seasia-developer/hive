import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { ToastrService } from "ngx-toastr";

import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class HelperService {
  orgRole = "";
  selectedItemId = "";
  selectedOrgId = "";
  selectedOrgUserRole = "";
  orgList = [];
  orgName: string;
  orgImage: any;
  orgImagePreview: any;
  onboardingImg: any;
  updateImg: any;
  applyClass = false;
  wsName: string;
  categories: any;
  wsdescription: string;
  searchKeyword;
  showCalendarClass = false;
  showContacts = false;
  userActiveStatuses: any = {};
  editOrgId: any;
  // enJSON = require("../language/translation.en.json");
  constructor(
    // private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router,
    // private apiService: APIService,
    // public homeService: HomeService,
    private http: HttpClient
  ) { }
  private subjectForPublicProfile = new Subject<any>();
  selectedRecipient = "";
  followers = [];
  messages = {};
  openedChat = [];
  showChat = [];
  notificationCount = 0;
  notificationApiCalled = false;
  openedMobileChat: any = {};
  showMobileChat = true;
  orgEvent:any = {};
  groupEvent:any = {};


  getOrgEvent(data){
    this.orgEvent = data;
  }

  getGroupEvent(data){
    this.groupEvent = data;
  }

  sendUserIdForPublicProfile(data) {
    this.subjectForPublicProfile.next(data);
  }

  getUserIdForPublicProfile() {
    return this.subjectForPublicProfile.asObservable();
  }

   removeTags(str:any) {
    if ((str !== null) || (str !== '' )){
      str = str? str.toString() : '';
      return str.replace( /(<([^>]+)>)/ig, '');
    }
  }


  //  removeTags(str) {
  //   if (str !== null && str !== '') {
  //     str = str.toString();
  //     return str.replace(/(<([^>]+)>)/ig, '');
  //   }
  // }
  

  checkCommentUrl(str:string) {
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
      return str.replace(urlRegex, function(url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
      })
      }

returnRichLink(url , i :any){
  let endpont = `https://api.linkpreview.net/?key=cb25f8374243b248ff494225f428b05a&q=${url}`
  return this.http.get(endpont);
}


  changeClass() {
    this.router.events.subscribe((el) => {
      if (el["url"]) {
        if (el["url"].includes("/auth") || el["url"].includes("/onboarding")) {
          this.applyClass = false;
        } else {
          this.applyClass = true;
        }
      }
      return this.applyClass;
    });
  }
  /**
   * loggedUser() => logged user info return
   */
  get loggedUser() {
    return this.getLocalStore("userData");
  }

  printLog(message: any, values?: any) {
    if (!environment.production) {
    }
  }

  setLocalStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getLocalStore(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  clearStorageFor(key) {
    return localStorage.removeItem(key);
  }

  clearStorage() {
    localStorage.clear();
  }

  // check whether password and confirm password is same
  confirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors.confirmedValidator
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  showSuccessToast(msg) {
    this.toastr.success(msg);
  }

  showErrorToast(msg) {
    this.toastr.error(msg);
  }

  showInfoToast(msg) {
    this.toastr.info(msg);
  }

  showNotifyToast(message, title, config) {
    return this.toastr.success(message, title, config);
  }

  clearNotifyToast(toastId) {
    setTimeout(() => {
      this.toastr.clear(toastId);
    }, 500);
  }

  showAlert(error) {
    this.showInfoToast(error);
  }
}
