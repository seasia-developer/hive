import { Component, OnInit } from "@angular/core";
import { APIService, JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";

@Component({
  selector: "app-check-email",
  templateUrl: "./check-email.component.html",
  styleUrls: ["./check-email.component.scss"],
})
export class CheckEmailComponent implements OnInit {

  constructor(
    private helperService: HelperService,
    private apiService: APIService,
  ) {}

  disableButton = false;

  ngOnInit() {}

  resendSignUpVerification(){
    console.log(localStorage.getItem('signupUserData'))
    console.log(JSON.parse(localStorage.getItem('signupUserData')))
    const postData = JSON.parse(localStorage.getItem('signupUserData'))
    console.log(postData.email)
      this.disableButton = true;
      this.apiService
        .postWithContentTypeHeader("user/resendSignUpVerification", postData)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.helperService.showSuccessToast(jresponse.message);
            this.disableButton = false;
          }
        })
        .catch((err: any) => {
          this.helperService.showErrorToast(err.error.message);
          this.disableButton = false;
          throw err;
        });
  }
}
