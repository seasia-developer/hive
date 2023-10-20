import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { BsModalService } from "ngx-bootstrap/modal";
import * as _ from "lodash";
import { MsalService } from "@azure/msal-angular";
import { Dropbox } from "dropbox";

import { GoogleAPIService } from "src/app/services/googleApi.service";
import { Constants } from "../../../../../../constants/constants";
import { ParentService } from "../parent.service";
import { JReponse } from "src/app/services/api.service";
import { environment } from "../../../../../../../environments/environment";
import { HomeService } from "../../../home.service";
import { UploadOrgContentComponent } from "../../organisation-setup/upload-org-content/upload-org-content.component";
import { HelperService } from "src/app/services/helper.service";

@Component({
  selector: "app-services",
  templateUrl: "./services.component.html",
  styleUrls: ["./services.component.scss"],
})
export class ServicesComponent implements OnInit {
  // googleClientId = environment.googleClientId;
  googleClientId = environment.GoogleKey;
  googleClientSecret = environment.googleSecret;
  oneDriveApplicationId = environment.oneDriveClientId;
  redirectUri = environment.redirectUri;
  // tslint:disable-next-line: max-line-length
  oneDriveLoginUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${this.oneDriveApplicationId}&scope=offline_access%20files.readwrite.all&response_type=token&redirect_uri=${this.redirectUri}`;
  logoutOD = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${this.redirectUri}`;
  dropboxClientId = environment.dropboxClientId;
  dropboxSecret = environment.dropboxSecret;
  // tslint:disable-next-line: max-line-length
  dropboxLoginUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${this.dropboxClientId}&response_type=code&redirect_uri=${this.redirectUri}`;
  odScopes = {
    scopes: ["offline_access", "files.readwrite.all"],
  };
  token: any;
  file: any;
  fileSrc: string;
  isIframe = false;
  loggedIn = false;
  credentials: any = { google: [], oneDrive: [], dropbox: [] };
  showMenu = "";
  url: string;
  dbx: Dropbox;
  base64DropboxKey = btoa(`${this.dropboxClientId}:${this.dropboxSecret}`);

  // dbx = new Dropbox({ clientId: this.dropboxClientId })

  constructor(
    private GAPIService: GoogleAPIService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private parentService: ParentService,
    private authService: MsalService,
    private homeService: HomeService,
    private modalService: BsModalService,
    private helperService: HelperService
  ) {}

  async ngOnInit() {
    if (this.activatedRoute.snapshot.fragment) {
      this.setAuthObject(this.activatedRoute.snapshot.fragment);
    }
    this.credentials = await this.parentService.getFormattedCredentials();
    if (this.activatedRoute.snapshot.queryParams.code) {
      this.getDbxToken(this.activatedRoute.snapshot.queryParams.code);
    }
    // this.isIframe = window !== window.parent && !window.opener;

    // this.checkoutAccount();

    // this.broadcastService.subscribe('msal:loginSuccess', () => {
    //   this.checkoutAccount();
    // });

    // this.authService.handleRedirectCallback((authError, response) => {
    //   if (authError) {
    //     console.error('Redirect Error: ', authError.errorMessage);
    //     return;
    //   }
    // });

    // this.authService.setLogger(new Logger((logLevel, message, piiEnabled) => {
    // }, {
    //   correlationId: CryptoUtils.createNewGuid(),
    //   piiLoggingEnabled: false
    // }));
  }

  // async getCredentials() {
  //   const creds: any = await this.parentService.refreshCredentials();
  //   this.credentials = { google: [], oneDrive: [], dropbox: []};
  //   creds.forEach(cred => {
  //     cred.platform === Constants.DRIVES.google ?
  //     this.credentials.google.push(cred) : cred.platform === Constants.DRIVES.dropbox ?
  //     this.credentials.dropbox.push(cred) : this.credentials.oneDrive.push(cred);
  //   });
  // }

  // One Drive start
  checkoutAccount() {
    this.loggedIn = !!this.authService.getAccount();
  }

  odLogin() {
    const isIE =
      window.navigator.userAgent.indexOf("MSIE ") > -1 ||
      window.navigator.userAgent.indexOf("Trident/") > -1;
    const odAuthObj: any = { platform: Constants.DRIVES.oneDrive };
    if (isIE) {
      this.authService.loginRedirect();
    } else {
      this.authService.loginPopup(this.odScopes).then((user) => {
        this.authService.acquireTokenSilent(this.odScopes).then((res) => {
          odAuthObj.email = res.account.userName;
          odAuthObj.token = res;
          this.addCredential(odAuthObj);
        });
      });
    }
  }

  logout() {
    this.authService.logout();
  }
  // One Drive end

  async googleSignIn(scope,type) {
    const auth = await this.GAPIService.signIn(scope);
    this.getGoogleRefreshToken(auth.code,type);
  }

  getGoogleRefreshToken(code,type) {
    const options = {
      client_id: this.googleClientId,
      code,
      grant_type: "authorization_code",
      client_secret: this.googleClientSecret,
      redirect_uri: environment.googleRedirectUri,
    };
    this.http
      .post("https://oauth2.googleapis.com/token", options)
      .subscribe((token) => {
        const user = this.GAPIService.userDetails;
        const keys = Object.keys(user);
        const googleAuthObj = {
          platform: type=='calendar'? Constants.DRIVES.calendar : Constants.DRIVES.google,
          email: user[keys[2]][Object.keys(user[keys[2]])[5]],
          token,
        };
        this.addCredential(googleAuthObj);
      });
  }

  authorize() {
    this.GAPIService.authorize({
      // tslint:disable-next-line: max-line-length
      access_token:
        "ya29.a0AfH6SMCLUb41KwECzZYQcwpqkeiwKqxd4aAjVXN8iZuBwJ-UZNmnxQfzj9M7E0Ajd4WpOp4BfEMKcdQKeO3tQE-XM1ZHC6Rr8Uz9gTEgfkHP6idWlFBtYqAsOq4VSLXs-WfpEbkrCaVmCS61ro6KO6uRhvFR8EUXGKPCGw",
      expires_at: 1597759401031,
      expires_in: 3599,
      first_issued_at: 1597755802031,
      // tslint:disable-next-line: max-line-length
      id_token:
        "eyJhbGciOiJSUzI1NiIsImtpZCI6IjZiYzYzZTlmMThkNTYxYjM0ZjU2NjhmODhhZTI3ZDQ4ODc2ZDgwNzMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNzA1MjM2MDQ4MDgxLW91ZmlxcmliMDFwdWV0bjNnZmEydDI4YnVnMGl1ODBrLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNzA1MjM2MDQ4MDgxLW91ZmlxcmliMDFwdWV0bjNnZmEydDI4YnVnMGl1ODBrLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAzODU4NzMzOTkzODg5OTIwMjgwIiwiZW1haWwiOiJhcmNoaXQubmF1dGl5YWwuc2FAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJWNlhoYzVqR3FfaEZ2SkppczdLbmh3IiwibmFtZSI6IkFyY2hpdCBOYXV0aXlhbCIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLWcxdHY1WGlzZTlFL0FBQUFBQUFBQUFJL0FBQUFBQUFBQUFBL0FNWnV1Y25oR0FhMTBadnVJRzJtUEJiUG9Jdkc3VURmQXcvczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IkFyY2hpdCIsImZhbWlseV9uYW1lIjoiTmF1dGl5YWwiLCJsb2NhbGUiOiJlbi1HQiIsImlhdCI6MTU5Nzc1NTgwMSwiZXhwIjoxNTk3NzU5NDAxLCJqdGkiOiIzOGE0ODQ5YWQ5MWRmMzhjNWNlYWYzZGY3OTU4YmMyZmJiMjhhNmVhIn0.Ix7dlpQJgREeghnbuJFNj0sQv-pKpcMRh94XyrKaxBG5J503oo_8YnxoIQvtGo0czDlZ23urefbYxnK-15sHyuUOEa2-9Xyd3r9TNB60aju3IOsYBz-Qh8mBEBpXIiZEtU2XOevdZdJq98s8wjHYedPzElwRjYL8JmoMblIOsn7iI_hCJ8Qi2j8FZcw9ZXXXU7h3N0qSZtYLlzu8loeFVxxfJJ5_t-L77ysMa8kHr0i4vUJxYZeJCCysTBInMKKBYn9nW69MUlxP71nHYKc1u3Y4Hfmduw532SO7ugd9XyCT7Zsq1VnRURC6yolok2ZHdK32PAIMKDmwxsW2J9QoGQ",
      idpId: "google",
      login_hint:
        "AJDLj6JUa8yxXrhHdWRHIV0S13cAYC48Dp5zBKr1P8GPVNEXEu4KQdLpsb7DPJ4P9atqsGtQTsnmmPb5vuUmpwR-D7CsGTR8QA",
      // tslint:disable-next-line: max-line-length
      scope:
        "email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
    });
  }

  async getParticularFile() {
    this.file = await this.GAPIService.getParticularFile(
      "1UW6_zKpCLEfRjSXeaxOXA7f6ptSrw65v"
    );
    // this.file.body = this.file.body.toString('base64');
    // document.getElementById("test")["src"] = this.file.body;
    const fr = new FileReader();
    fr.onload = (e: any) => {
      document.getElementById("test")["src"] = e.target.result;
      // this.fileSrc = fr.result;
    };
    const arrayBufferView = new Uint8Array(this.file.body);
    const blob = new Blob([arrayBufferView], { type: "image/jpeg" });
    fr.readAsDataURL(blob);
    // var urlCreator = window.URL;
    // var imageUrl = urlCreator.createObjectURL( blob );
  }

  authenticate() {
    this.GAPIService.loadDrive();
    // this.GAPIService.authorize();
  }

  // getToken() {
  //   // this.token = gapi.auth.getToken();
  // }

  async oneDriveSignIn() {
    const test = await this.http.get(this.oneDriveLoginUrl);
  }

  connectOneDrive() {
    window.open(this.oneDriveLoginUrl, "_blank");
  }

  // To generate object from url fragment
  setAuthObject(authFragment) {
    const token = authFragment.substring(
      authFragment.indexOf("=") + 1,
      authFragment.indexOf("&token_type")
    );
    authFragment = authFragment.substr(authFragment.indexOf("&token_type"));
    let authObj = {};
    if (!authFragment.includes("uid")) {
      const tokenType = authFragment.substring(
        authFragment.indexOf("=") + 1,
        authFragment.indexOf("&expires_in")
      );
      authFragment = authFragment.substr(authFragment.indexOf("&expires_in"));
      const expiresIn = authFragment.substring(
        authFragment.indexOf("=") + 1,
        authFragment.indexOf("&scope")
      );
      authFragment = authFragment.substr(authFragment.indexOf("&scope"));
      const scope = authFragment.substring(authFragment.indexOf("=") + 1);
      authObj = { token, tokenType, expiresIn, scope };
    } else {
      const tokenType = authFragment.substring(
        authFragment.indexOf("=") + 1,
        authFragment.indexOf("&uid")
      );
      authFragment = authFragment.substr(authFragment.indexOf("&uid"));
      const uId = authFragment.substring(
        authFragment.indexOf("=") + 1,
        authFragment.indexOf("&account_id")
      );
      authFragment = authFragment.substr(authFragment.indexOf("&account_id"));
      const accountId = authFragment.substring(authFragment.indexOf("=") + 1);
      authObj = { token, tokenType, uId, accountId };
      this.dropboxLogin(authObj);
    }
  }

  getDbxToken(code) {
    const body = {
      code,
      grant_type: "authorization_code",
      redirect_uri: this.redirectUri,
    };
    const formData = new FormData();
    formData.append("code", code);
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", this.redirectUri);

    this.http
      .post(`https://api.dropboxapi.com/oauth2/token`, formData, {
        headers: { Authorization: `Basic ${this.base64DropboxKey}` },
      })
      .subscribe((token) => {
        this.dropboxLogin(token);
      });
  }

  dropboxLogin(authObj) {
    const dbx = new Dropbox({
      accessToken: authObj.access_token,
    });
    dbx
      .usersGetCurrentAccount()
      .then((res) => {
        const obj = {
          email: res.email,
          platform: Constants.DRIVES.dropbox,
          token: authObj,
        };
        this.addCredential(obj);
      })
      .catch((err) => {});
  }

  dropbox() {
    const dbx = new Dropbox({ clientId: this.dropboxClientId });
    dbx
      .getAccessTokenFromCode(
        this.redirectUri,
        "6c8YfAHiJH8AAAAAAAAADZm3tE9BPZQWI8u7_lOs-qI"
      )
      .then((res) => console.log(res));
    // const code = "6c8YfAHiJH8AAAAAAAAADZm3tE9BPZQWI8u7_lOs-qI";
    //   this.dbx.getAccessTokenFromCode(this.redirectUri, code)
    //   .then(function(token) {
    //       // this.dbx.setRefreshToken(token.refreshToken);
    //       this.dbx.usersGetCurrentAccount()
    //         .then(function(response) {
    //         })
    //         .catch(function(error) {
    //           console.error(error, "err");
    //         });
    //   })
    //   .catch(function(error) {
    //   });
    // // const dbx = new Dropbox({ clientId: this.dropboxClientId });
    // this.url = dbx.getAuthenticationUrl(this.redirectUri, null, 'code');
    // document.getElementById("dbx-test").click();
    // document.getElementById("dbx-test")
    // setTimeout(() => {
    // }, 1000);
  }

  addCredential(data) {
    this.parentService
      .addCredential(data)
      .then(async (jresponse: JReponse) => {
        if (jresponse.success) {
          this.credentials = await this.parentService.getFormattedCredentials();
          this.setLocalStoreForConnectedUsers(this.credentials);
          const dbxConnection = this.helperService.getLocalStore(
            "dropboxConnection"
          );
          if (dbxConnection) {
            this.openUploadModal(dbxConnection);
          }
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  openUploadModal(data) {
    const initialState = {
      caller: data.caller,
      uploadType: data.uploadType,
      initializeDbx: true,
      driveType: "dropbox",
    };
    const modalParams = Object.assign(
      {},
      { initialState, class: "small-custom-modal",animated: true,
      keyboard: true,
      backdrop: false,
      ignoreBackdropClick: true }
    );
    this.helperService.clearStorageFor("dropboxConnection");
    this.homeService.uploadModalRef = this.modalService.show(
      UploadOrgContentComponent,
      modalParams
    );
  }

  removeCredential(cred) {
    this.parentService
      .removeCredential(cred._id)
      .then(async (jresponse: JReponse) => {
        if (jresponse.success) {
          this.credentials = await this.parentService.getFormattedCredentials();
          this.setLocalStoreForConnectedUsers(this.credentials);
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  updateCredential(data) {
    this.parentService
      .updateCredential(data)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  setLocalStoreForConnectedUsers(credentials) {
    const connectedUsersEmails = [];
    credentials.google.forEach((element) => {
      connectedUsersEmails.push(element.email);
    });
    this.helperService.setLocalStore(
      "connectedUsersEmails",
      connectedUsersEmails
    );
  }
}
