import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormArray,
  FormBuilder,
  FormControl,
  Validators,
} from "@angular/forms";

import { BusinessProfileService } from "./business-profile.service";
import { HelperService } from "src/app/services/helper.service";
import { JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
import { Constants } from "src/app/constants/constants";
import { CountryFlagPipe } from "src/app/pipes/country-flag.pipe";
import { HomeService } from "../../../home.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { ParentService } from "../parent.service";
import { UploadOrgContentComponent } from "../../organisation-setup/upload-org-content/upload-org-content.component";

declare let require: any;
const PhoneNumber = require("awesome-phonenumber");

@Component({
  selector: "app-business-profile",
  templateUrl: "./business-profile.component.html",
  styleUrls: ["./business-profile.component.scss"],
})
export class BusinessProfileComponent implements OnInit {
  businessProfileForm: FormGroup;
  industryList: any;
  updatedBusinessId: any;
  arr: FormArray;
  isSubmitted: boolean;
  businessProfileImageData: any;
  imagePreview: any;
  imagePrevOfRes = false;
  mediaURL;
  countryFlag = "";

  typeList = Constants.PHONE_TYPES;

  constructor(
    private businessProfileService: BusinessProfileService,
    private helperService: HelperService,
    private fb: FormBuilder,
    private countryPipe: CountryFlagPipe,
    private homeService: HomeService,
    private modalService: BsModalService,
    private parentService: ParentService
  ) {
    this.businessProfileService
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
    this.getBusinessAvatar();
    this.mediaURL = environment.MEDIA_URL;
    this.getBusinessProfileData();
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
    this.phoneArray.controls[index]
      .get("countryCode")
      .setValue(this.countryFlag);
  }

  tempFunc() {
    this.helperService.showErrorToast("Please enter valid country code");
    return "";
  }

  getRegionCodeForCountryCode(regionCode: string): string {
    return PhoneNumber.getRegionCodeForCountryCode(regionCode);
  }

  resetForm() {
    this.businessProfileForm = new FormGroup({
      name: new FormControl("", [Validators.required]),
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
      avatar: new FormControl(""),
      phone: new FormArray([this.createItem()]),
      phoneTicked: new FormControl(""),
    });
  }

  createItem() {
    return this.fb.group({
      type: ["", Validators.required],
      countryCode: ["🇦🇺 +61", Validators.required],
      number: ["", Validators.required],
    });
  }

  get phoneArray(): FormArray {
    return this.businessProfileForm.get("phone") as FormArray;
  }

  addAnotherPhone() {
    this.arr = this.businessProfileForm.get("phone") as FormArray;
    this.arr.push(this.createItem());
  }

  getBusinessProfileData() {
    this.businessProfileService
      .getBusinessProfileData()
      .then((jresponse: JReponse) => {
        if (jresponse.body) {
          this.setBusinessProfileForm(jresponse.body);
        } else {
          this.setInitialBusinessForm(this.helperService.loggedUser);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  setBusinessProfileForm(res) {

    this.updatedBusinessId = res._id;
    this.businessProfileForm.controls.name.setValue(res.businessName);
    this.businessProfileForm.controls.email.setValue(res.email);
    this.businessProfileForm.controls.emailTicked.setValue(res.emailTicked);
    this.businessProfileForm.controls.phoneTicked.setValue(res.phoneTicked);
    this.businessProfileForm.controls.industry.setValue(res.industry);
    this.businessProfileForm.controls.headline.setValue(res.headline);
    this.businessProfileForm.controls.about.setValue(res.businessDescription);
    this.businessProfileForm.controls.website.setValue(res.businessURL);
    this.businessProfileForm.controls.websiteTicked.setValue(res.websiteTicked);
    this.businessProfileForm.controls.orgTicked.setValue(!res.isHaveAddress);
    this.businessProfileForm.controls.address.setValue(res.address);
    // this.businessProfileForm.controls.addressTicked.setValue(res.addressTicked);
    this.businessProfileForm.controls.apt.setValue(res.aptSuite);
    this.businessProfileForm.controls.aptTicked.setValue(res.aptTicked);
    this.businessProfileForm.controls.city.setValue(res.city);
    // this.businessProfileForm.controls.cityTicked.setValue(res.cityTicked);
    this.businessProfileForm.controls.zipcode.setValue(res.zip);
    // this.businessProfileForm.controls.zipTicked.setValue(res.zipTicked);
    this.businessProfileForm.controls.state.setValue(res.state);
    // this.businessProfileForm.controls.stateTicked.setValue(res.stateTicked);
    this.businessProfileForm.controls.country.setValue(res.country);
    this.imagePreview = res.businessLogo;
    this.imagePrevOfRes = true;
    this.setPhoneArray(res);
    // this.setTextAreaLength("comment");
  }

  setPhoneArray(data) {
    while (this.phoneArray.length) {
      this.phoneArray.removeAt(0);
    }
    if (data.phone) {
      data.phone.forEach((phone) => {
        delete phone.phoneTicked;
        this.phoneArray.push(this.setItem(phone));
      });
    }
  }

  setInitialBusinessForm(userData) {
    this.businessProfileForm.controls.name.setValue(userData.name);
    this.businessProfileForm.controls.email.setValue(userData.email);
    this.setPhoneArray(userData);
  }

  setItem(obj) {
    return this.fb.group({
      type: obj.type,
      countryCode: obj.countryCode,
      number: obj.number,
      // phoneTicked: obj.phoneTicked,
    });
  }

  submitForm() {
    this.isSubmitted = true;
    const isValidForm = this.businessProfileForm.valid;
    const data = this.businessProfileForm.getRawValue();
    const formData = new FormData();
    formData.append("_id", this.updatedBusinessId || "");
    data.name=this.helperService.removeTags(data.name);
    formData.append("businessName", data.name);
    data.headline=this.helperService.removeTags(data.headline);
    formData.append(
      "headline",
      data.headline === undefined ? "" : data.headline
    );
    data.industry=this.helperService.removeTags(data.industry);
    formData.append("industry", data.industry);
    data.about=this.helperService.removeTags(data.about);
    formData.append(
      "businessDescription",
      data.about === undefined ? "" : data.about
    );
    data.email=this.helperService.removeTags(data.email);
    formData.append("email", data.email === undefined ? "" : data.email);
    formData.append("emailTicked", data.emailTicked || false);
    formData.append("phoneTicked", data.phoneTicked || false);
    data.website=this.helperService.removeTags(data.website);
    formData.append(
      "businessURL",
      data.website === undefined ? "" : data.website
    );
    formData.append("websiteTicked", data.websiteTicked || false);
    formData.append("isHaveAddress", JSON.stringify(!data.orgTicked));
    if (!data.orgTicked) {
      if(data.adress){
        data.adress=this.helperService.removeTags(data.adress);
      }
      formData.append(
        "address",
        data.address === undefined ? "" : data.address
      );
      // formData.append("addressTicked", data.addressTicked || false);
      data.apt=this.helperService.removeTags(data.apt);
      formData.append("aptSuite", data.apt === undefined ? "" : data.apt);
      formData.append("aptTicked", data.aptTicked || false);
      data.city=this.helperService.removeTags(data.city);
      formData.append("city", data.city === undefined ? "" : data.city);
      // formData.append("cityTicked", data.cityTicked || false);
      data.zipcode=this.helperService.removeTags(data.zipcode);
      formData.append("zip", data.zipcode === undefined ? "" : data.zipcode);
      // formData.append("zipTicked", data.zipTicked || false);
      formData.append("state", data.state === undefined ? "" : data.state);
      // formData.append("stateTicked", data.stateTicked || false);
      data.country=this.helperService.removeTags(data.country);
      formData.append(
        "country",
        data.country === undefined ? "" : data.country
      );
    }
    formData.append("phone", JSON.stringify(data.phone));
    formData.append("businessLogo", this.businessProfileImageData || "");
    if (isValidForm) {
      if (this.businessProfileForm.get("email").value) {
        const regexx = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$");
        if (!regexx.test(this.businessProfileForm.get("email").value)) {
          this.helperService.showErrorToast("Enter valid Email Id");
          return;
        }
      }
      this.isSubmitted = false;
      this.businessProfileService
        .updateBusinessProfileData(formData)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            this.getBusinessProfileData();
          }
        })
        .catch((err: Error) => {
          this.helperService.showErrorToast(err.message);
          throw err;
        });
    }
  }

  removeSelectedPhone(index) {
    if (this.arr) {
      this.arr.removeAt(index);
    } else {
      this.phoneArray.removeAt(index);
    }
  }

  openUploadModal() {
    const initialState = { caller: "business", uploadType: "single" };
    const modalParams = { initialState, class: "small-custom-modal",animated: true,
    keyboard: true,
    backdrop: false,
    ignoreBackdropClick: true };
    this.homeService.uploadModalRef = this.modalService.show(
      UploadOrgContentComponent,
      modalParams
    );
  }

  getBusinessAvatar() {
    this.parentService.businessAvatar.subscribe((image) => {
      this.fileupload(image);
      this.homeService.uploadModalRef.hide();
    });
  }

  fileupload(image) {
    this.imagePrevOfRes = false;
    this.businessProfileImageData = image;
    if (image) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(image);
    }
  }
}
