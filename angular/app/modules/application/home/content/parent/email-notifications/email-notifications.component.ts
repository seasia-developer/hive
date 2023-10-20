import { Component, OnInit } from "@angular/core";
import { APIService, JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";

@Component({
  selector: "app-email-notifications",
  templateUrl: "./email-notifications.component.html",
  styleUrls: ["./email-notifications.component.scss"],
})
export class EmailNotificationsComponent implements OnInit {
  isSendMeAnEmail = false;
  mainObj = {};
  sendMeAnEmail = [
    { title: "Someone sends me a message", isChecked: false },
    {
      title: "I am given a task, @mentioned, or added to a project, etc.",
      isChecked: false,
    },
    {
      title: "Changes in Group membership occur (add, leave, join etc)",
      isChecked: false,
    },
    { title: "I am being reminded about something", isChecked: false },
    {
      title:
        "Something else happens on anything I follow, or have interacted with",
      isChecked: false,
    },
  ];
  isOnScreenNotification = false;
  onScreenNotification = [
    { title: "Enable sounds", isChecked: false },
    {
      title: "Enable web notifications (Notifications Center)",
      isChecked: false,
    },
  ];
  isDailyDigest = false;
  isSetupAccData;
  userData;

  constructor(
    private apiService: APIService,
    private helperService: HelperService
  ) {}

  ngOnInit() {
    this.userData = this.helperService.getLocalStore("userData");
    this.isSetupAccData = this.userData.isSetUpAccountData;
    this.isSetupAccData.tabEmailNotification.recMessageNotification.forEach(
      (element) => {
        if (Object.keys(element).length === 1) {
          if (Object.keys(element)[0] === "parent") {
            this.isSendMeAnEmail = true;
          }
          if (Object.keys(element)[0] === "children") {
            this.sendMeAnEmail[element.children].isChecked = true;
          }
        }
        if (Object.keys(element).length > 1) {
          this.isSendMeAnEmail = true;
          this.sendMeAnEmail[element.children].isChecked = true;
        }
      }
    );
    this.isSetupAccData.tabEmailNotification.onScreenNotification.forEach(
      (element) => {
        if (Object.keys(element).length === 1) {
          if (Object.keys(element)[0] === "parent") {
            this.isOnScreenNotification = true;
          }
          if (Object.keys(element)[0] === "children") {
            this.onScreenNotification[element.children].isChecked = true;
          }
        }
        if (Object.keys(element).length > 1) {
          this.isOnScreenNotification = true;
          this.onScreenNotification[element.children].isChecked = true;
        }
      }
    );
    if (this.isSetupAccData.tabEmailNotification.dailyDigest.length > 0) {
      this.isDailyDigest = true;
    }
  }

  selectAllForsendMeAnEmail() {
    this.isSendMeAnEmail = !this.isSendMeAnEmail;
    this.sendMeAnEmail.forEach((element) => {
      element.isChecked = this.isSendMeAnEmail;
    });
  }

  sendMeEmailChild(item, values) {
    item.isChecked = values.currentTarget.checked;
  }

  onScreenNotificationChild(item, values) {
    item.isChecked = values.currentTarget.checked;
  }

  selectAllForOnScreenNotification() {
    this.isOnScreenNotification = !this.isOnScreenNotification;
    this.onScreenNotification.forEach((element) => {
      element.isChecked = this.isOnScreenNotification;
    });
  }

  selectAllForDailyDigest() {
    this.isDailyDigest = !this.isDailyDigest;
  }

  onUpdate() {
    this.mainObj = {};

    // SEND ME AN EMAIL WHEN -- START

    const emailArray = [];
    if (this.isSendMeAnEmail) {
      emailArray.push({ parent: 0 });
    }
    this.sendMeAnEmail.forEach((e, index) => {
      if (e.isChecked) {
        if (!this.isSendMeAnEmail) {
          emailArray.push({ children: index });
        } else {
          emailArray.push({ parent: 0, children: index });
        }
      }
    });

    // SEND ME AN EMAIL WHEN -- END

    // ON-SCREEN NOTIFICATION SETTINGS -- START

    const onScreenNotArray = [];
    if (this.isOnScreenNotification) {
      onScreenNotArray.push({ parent: 0 });
    }

    this.onScreenNotification.forEach((element, index) => {
      if (element.isChecked) {
        if (!this.isOnScreenNotification) {
          onScreenNotArray.push({ children: index });
        } else {
          onScreenNotArray.push({ parent: 0, children: index });
        }
      }
    });

    // ON-SCREEN NOTIFICATION SETTINGS -- END

    // DAILY DIGEST -- START

    const dailyDigestArray = [];

    if (this.isDailyDigest) {
      dailyDigestArray.push({ parent: 0 });
    }

    // DAILY DIGEST -- END

    this.mainObj = {
      isSetUpAccountData: {
        tabEmailNotification: {
          recMessageNotification: emailArray,
          onScreenNotification: onScreenNotArray,
          dailyDigest: dailyDigestArray,
        },
      },
    };

    this.apiService
      .postWithHeader("user/email-setup", this.mainObj)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.helperService.showSuccessToast(jresponse.message);
          this.userData.isSetUpAccountData = jresponse.body.isSetUpAccountData;
          this.helperService.setLocalStore("userData", this.userData);
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }
}
