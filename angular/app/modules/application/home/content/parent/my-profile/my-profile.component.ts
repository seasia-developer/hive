import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  FormBuilder,
} from "@angular/forms";
import { MyProfileService } from "./my-profile.service";
import { HelperService } from "src/app/services/helper.service";
import { JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
import { CountryFlagPipe } from "src/app/pipes/country-flag.pipe";
import { Constants } from "src/app/constants/constants";
import { HomeService } from "../../../home.service";
import { UploadOrgContentComponent } from "../../organisation-setup/upload-org-content/upload-org-content.component";
import { ParentService } from "../parent.service";
import { Router } from "@angular/router";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UpgradePopupComponent } from '../../../../home/upgrade/upgrade-popup/upgrade-popup.component';
import { _ } from 'ag-grid-community';


declare let require: any;
const PhoneNumber = require("awesome-phonenumber");
@Component({
  selector: "app-my-profile",
  templateUrl: "./my-profile.component.html",
  styleUrls: ["./my-profile.component.scss"],
})
export class MyProfileComponent implements OnInit {
  currentpwPasswordType = "password";
  newpwPasswordType = "password";
  repeatpwPasswordType = "password";
  profileForm: FormGroup;
  industryList: any;
  updatedUserId: any;
  arr: FormArray;
  isSubmitted: boolean;
  imagePreview: any;
  imagePrevOfRes = false;
  profileImageData: any = "";
  typeList = Constants.PHONE_TYPES;
  mediaURL;
  model: any = {};
  countryFlag = "";
  selectedPlan = "";
  totalSize: any;
  usedSize: any;
  totalRecords:any;
  usedRecords:any;
  capacity = 0;
  modalRef: BsModalRef;
  password:any;
  passwordMinLength:any = 8;
  passwordLength:any = 25;
  passwordLengthError:any;
  disableButtonForInvalidPassword:boolean = false;

  constructor(
    private myProfileService: MyProfileService,
    private helperService: HelperService,
    private fb: FormBuilder,
    private countryPipe: CountryFlagPipe,
    private homeService: HomeService,
    private modalService: BsModalService,
    private parentService: ParentService,
    private router: Router,

  ) {
    this.myProfileService
      .getIndustryList()
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.industryList = jresponse.body.data;
        }
      })
      .catch((err: Error) => {
        throw err;
      });
    this.resetForm();
  }

  ngOnInit() {
    this.getProfileImage();
    this.mediaURL = environment.MEDIA_URL;
    this.getProfileData();
  }

  checkPasswordLength(){
    // ENABLE PASSWORD SUBMIT BTN
    this.disableButtonForInvalidPassword = false;
    // ENABLE PASSWORD ERROR MSG
    this.passwordLengthError = false;
    // IF PASSWORD LENGTH EXCEEDS
    if(this.password.length < this.passwordMinLength || this.password.length > this.passwordLength){
      // DISABLE SUBMIT BTN
      this.disableButtonForInvalidPassword = true;
      // DISABLE ERROR MSG
      this.passwordLengthError = true;
    }
  }

  getCountryFlag(event, index) {
    let t;
    t = event.target.value;
    t = t.split("+");
    this.countryFlag = "";
    this.countryFlag =
      this.countryPipe.transform(
        this.getRegionCodeForCountryCode(t[1]),
        "countryFlag"
      ) === undefined
        ? this.tempFunc()
        : this.countryPipe.transform(
          this.getRegionCodeForCountryCode(t[1]),
          "countryFlag"
        ) +
        " +" +
        t[1];
    this.arrayControl[index].get("countryCode").setValue(this.countryFlag);
  }

  tempFunc() {
    this.helperService.showErrorToast("Enter valid country code");
    return "";
  }

  getRegionCodeForCountryCode(regionCode: string): string {
    return PhoneNumber.getRegionCodeForCountryCode(regionCode);
  }

  upgradePlan() {
    if (this.helperService.orgList) {
      this.router.navigateByUrl(
        `application/home/upgrade?orgId=${this.helperService.orgList[0]._id}`
      );
      // if (this.helperService.orgList.length > 1) {
      //   this.openUpgradeModal()
      //   //this.router.navigateByUrl("application/home/upgrade/popup");
      // } else {
      //   this.router.navigateByUrl(
      //     `application/home/upgrade?orgId=${this.helperService.orgList[0]._id}`
      //   );
      // }
    }
  }
  openUpgradeModal() {
    const modalParams = Object.assign(
      {},
      { class: "small-custom-modal custom-upgrade-modal",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
    this.modalRef = this.modalService.show(UpgradePopupComponent, modalParams);
  }
  resetForm() {
    this.profileForm = new FormGroup({
      name: new FormControl("", [Validators.required]),
      businessName: new FormControl(""),
      position: new FormControl(""),
      industry: new FormControl(""),
      headline: new FormControl(""),
      about: new FormControl(""),
      email: new FormControl(""),
      emailTicked: new FormControl(""),
      website: new FormControl(""),
      websiteTicked: new FormControl(""),
      orgTicked: new FormControl(""),
      address: new FormControl(""),
      // addressTicked: new FormControl(""),
      apt: new FormControl(""),
      aptTicked: new FormControl(""),
      city: new FormControl(""),
      // cityTicked: new FormControl(""),
      zipcode: new FormControl(""),
      // zipTicked: new FormControl(""),
      state: new FormControl(""),
      // stateTicked: new FormControl(""),
      country: new FormControl(""),
      currentpwd: new FormControl(""),
      newpwd: new FormControl("", [
        Validators.pattern(
          "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
        ),
      ]),
      repeatpwd: new FormControl(""),
      avatar: new FormControl(""),
      phone: new FormArray([this.createItem()]),
      phoneTicked: new FormControl(""),
    });
  }

  get form() {
    return this.profileForm.controls;
  }

  createItem() {
    return this.fb.group({
      type: ["", Validators.required],
      countryCode: ["🇦🇺 +61", Validators.required],
      number: ["", Validators.required],
    });
  }

  get arrayControl() {
    return (this.profileForm.get("phone") as FormArray).controls;
  }
  get array1(): FormArray {
    return this.profileForm.get("phone") as FormArray;
  }

  addAnotherPhone() {
    this.arr = this.profileForm.get("phone") as FormArray;
    this.arr.push(this.createItem());
  }

  removeSelectedPhone(index) {
    if (this.arr) {
      this.arr.removeAt(index);
    } else {
      this.array1.removeAt(index);
    }
  }

  getProfileData() {
    this.myProfileService
      .getProfileData()
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.setProfileForm(jresponse.body);
        }
      })
      .catch((err: Error) => {
        console.log(err, "getprofiledata errrrrrrr")
        throw err;
      
      });
  }

  setProfileForm(res) {
    this.updatedUserId = res._id;
    this.selectedPlan = res.plan;
    this.totalSize = res.totalSize.convertedSize;
    if(this.capacity){
      this.capacity = res.capacity.toFixed(2);
    }
    this.usedSize = res.usedSize;
    this.totalRecords=res.totalRecords;
    this.usedRecords=res.usedRecords;
    this.profileForm.controls.name.setValue(res.firstName + " " + res.lastName);
    this.profileForm.controls.businessName.setValue(res.businessName);
    this.profileForm.controls.position.setValue(res.position);
    this.profileForm.controls.email.setValue(res.email);
    this.profileForm.controls.emailTicked.setValue(res.emailTicked);
    this.profileForm.controls.phoneTicked.setValue(res.phoneTicked);
    this.profileForm.controls.industry.setValue(res.industry);
    this.profileForm.controls.headline.setValue(res.headline);
    this.profileForm.controls.about.setValue(res.about);
    this.profileForm.controls.website.setValue(res.website);
    this.profileForm.controls.websiteTicked.setValue(res.websiteTicked);
    this.profileForm.controls.orgTicked.setValue(!res.isHaveAddress);
    this.profileForm.controls.address.setValue(res.address);
    // this.profileForm.controls.addressTicked.setValue(res.addressTicked);
    this.profileForm.controls.apt.setValue(res.aptSuite);
    this.profileForm.controls.aptTicked.setValue(res.aptTicked);
    this.profileForm.controls.city.setValue(res.city);
    // this.profileForm.controls.cityTicked.setValue(res.cityTicked);
    this.profileForm.controls.zipcode.setValue(res.zip);
    // this.profileForm.controls.zipTicked.setValue(res.zipTicked);
    this.profileForm.controls.state.setValue(res.state);
    // this.profileForm.controls.stateTicked.setValue(res.stateTicked);
    this.profileForm.controls.country.setValue(res.country);
    this.imagePreview = res.avatar;
    this.profileImageData = res.avatar;
    this.imagePrevOfRes = true;
    while (this.array1.length) {
      this.array1.removeAt(0);
    }
    res.phone.forEach((phone) => {
      this.array1.push(this.setItem(phone));
    });
    // this.setTextAreaLength("comment");
  }

  setItem(obj) {
    return this.fb.group({
      type: obj.type,
      countryCode: obj.countryCode,
      number: obj.number,
    });
  }

  submitForm() {
    this.isSubmitted = true;
    let isValidForm = this.profileForm.valid;
    const data = this.profileForm.getRawValue();
    if(data.industry==""|| data.industry==null|| data.industry=='null'){
      this.helperService.showErrorToast('Please select Industry');
      return false
    }
    const formData = new FormData();
    this.updatedUserId=this.helperService.removeTags(this.updatedUserId);
    formData.append("_id", this.updatedUserId);
    data.name=this.helperService.removeTags(data.name);
    formData.append("firstName", data.name.split(" ")[0]);
    formData.append("lastName", data.name.split(" ")[1]);
    data.position=this.helperService.removeTags(data.position);
    formData.append("position", data.position);
    data.headline=this.helperService.removeTags(data.headline);
    formData.append("headline", data.headline);
    data.industry=this.helperService.removeTags(data.industry);
    formData.append("industry", data.industry);
    data.about=this.helperService.removeTags(data.about);
    formData.append("about", data.about);
    data.email=this.helperService.removeTags(data.email);
    formData.append("email", data.email);
    formData.append("emailTicked", data.emailTicked || false);
    formData.append("phoneTicked", data.phoneTicked || false);
    data.website=this.helperService.removeTags(data.website);
    formData.append("website", data.website);
    formData.append("websiteTicked", data.websiteTicked || false);
    formData.append("isHaveAddress", JSON.stringify(!data.orgTicked));
    if (!data.orgTicked) {
      if(data.adress){
        data.adress=this.helperService.removeTags(data.adress);
      }
      
      formData.append("address", data.address);
      // formData.append("addressTicked", data.addressTicked || false);
      data.apt=this.helperService.removeTags(data.apt);
      formData.append("aptSuite", data.apt);
      formData.append("aptTicked", data.aptTicked || false);
      data.city=this.helperService.removeTags(data.city);
      formData.append("city", data.city);
      // formData.append("cityTicked", data.cityTicked || false);
      data.zipcode=this.helperService.removeTags(data.zipcode);
      formData.append("zip", data.zipcode);
      // formData.append("zipTicked", data.zipTicked || false);
      data.state=this.helperService.removeTags(data.state);
      formData.append("state", data.state);
      // formData.append("stateTicked", data.stateTicked || false);
      data.country=this.helperService.removeTags(data.country);
      formData.append("country", data.country);
    }
    data.phone=this.helperService.removeTags(data.phone);
    formData.append("phone", JSON.stringify(data.phone));
    formData.append("avatar", this.profileImageData);
    if (!data.currentpwd && (data.newpwd || data.reapeatpwd)) {
      isValidForm = false;
    }
    if (data.changepwd !== "" && data.newpwd === data.repeatpwd) {
      formData.append("currentpwd", data.currentpwd);
      formData.append("newpwd", data.newpwd);
    }
    if (isValidForm) {
      if (this.profileForm.get("currentpwd").value) {
        if (!this.profileForm.get("newpwd").value) {
          this.helperService.showErrorToast("New Password is required");
          return;
        }
        if (!this.profileForm.get("repeatpwd").value) {
          this.helperService.showErrorToast("Repeat Password is required");
          return;
        }
        if (
          this.profileForm.get("newpwd").value &&
          this.profileForm.get("repeatpwd").value
        ) {
          if (
            this.profileForm.get("newpwd").value !==
            this.profileForm.get("repeatpwd").value
          ) {
            this.helperService.showErrorToast(
              "New password and Repeat password must be match."
            );
            return;
          }
        }
      }
      if (this.profileForm.get("email").value) {

        // ^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$

        const regexx = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$");
        if (!regexx.test(this.profileForm.get("email").value)) {
          this.helperService.showErrorToast("Enter valid Email Id");
          return;
        }
      } else {
        this.helperService.showErrorToast("Email Id is required");
        return;
      }
      this.isSubmitted = false;
      const token = this.helperService.loggedUser.token;
      this.myProfileService
        .updateProfileData(formData)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            const userData = this.helperService.getLocalStore("userData");
            userData.name =
              jresponse.body.firstName + " " + jresponse.body.lastName;
            userData.avatar = jresponse.body.avatar;
            userData.email = jresponse.body.email;
            userData.stripeCustomerId = jresponse.body.stripeCustomerId;
            this.helperService.setLocalStore("userData", userData);
            this.helperService.showSuccessToast(jresponse.message);
            this.profileForm.get("currentpwd").setValue("");
            this.profileForm.get("newpwd").setValue("");
            this.profileForm.get("repeatpwd").setValue("");
          } else {
            this.helperService.showErrorToast(jresponse.message);
          }
        })
        .catch((err: Error) => {
          this.helperService.showErrorToast(err.message);
          throw err;
        });
    }
  }

  openUploadModal() {
    const initialState = { caller: "profile", uploadType: "single" };
    const modalParams = { initialState, class: "small-custom-modal",animated: true,
    keyboard: true,
    backdrop: false,
    ignoreBackdropClick: true };
    this.homeService.uploadModalRef = this.modalService.show(
      UploadOrgContentComponent,
      modalParams
    );
  }

  getProfileImage() {
    this.parentService.profileImage.subscribe((image) => {
      this.fileupload(image);
      this.homeService.uploadModalRef.hide();
    });
  }

  fileupload(image) {
    this.imagePrevOfRes = false;
    this.profileImageData = image;
    if (image) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(image);
    }
  }
}
