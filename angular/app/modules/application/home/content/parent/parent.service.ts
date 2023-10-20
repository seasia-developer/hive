import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { Dropbox } from "dropbox";
import { MsalService } from "@azure/msal-angular";

import { APIService, JReponse } from "src/app/services/api.service";
import { Constants } from "src/app/constants/constants";
import { GoogleAPIService } from "src/app/services/googleApi.service";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ParentService {
  // googleClientId = environment.googleClientId;
  googleClientId = environment.GoogleKey;
  googleClientSecret = environment.googleSecret;
  redirectUri = environment.redirectUri;
  dropboxClientId = environment.dropboxClientId;
  dropboxSecret = environment.dropboxSecret;
  odScopes = {
    scopes: ["offline_access", "files.readwrite.all"],
  };
  base64DropboxKey = btoa(`${this.dropboxClientId}:${this.dropboxSecret}`);
  driveAuthCredentials = [];
  credentials: { google: any[]; oneDrive: any[]; dropbox: any[]; calendar:any[]};
  currentDbxUserToken: any;
  currentOdUserToken: any;
  profileImage = new Subject();
  businessAvatar = new Subject();
  banners = new Subject();

  constructor(
    private apiservice: APIService,
    private http: HttpClient,
    private GAPIService: GoogleAPIService,
    private authService: MsalService
  ) {}

  refreshCredentials() {
    return new Promise((resolve, reject) => {
      this.getCredentials()
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.driveAuthCredentials = jresponse.body;
            resolve(this.driveAuthCredentials);
          }
        })
        .catch((err: Error) => {
          reject();
          throw err;
        });
    });
  }

  async getFormattedCredentials() {
    return new Promise(async (resolve) => {
      const creds: any = await this.refreshCredentials();
      this.credentials = { google: [], oneDrive: [], dropbox: [] ,calendar:[]};
      creds.forEach((cred) => {
        cred.platform === Constants.DRIVES.google
          ? this.credentials.google.push(cred)
          : cred.platform === Constants.DRIVES.dropbox
          ? this.credentials.dropbox.push(cred)
          : cred.platform === Constants.DRIVES.oneDrive 
          ? this.credentials.oneDrive.push(cred)
          :this.credentials.calendar.push(cred);
      });
      resolve(this.credentials);
    });
  }

  getCredentials() {
    return this.apiservice.getWithHeader(`/user/getToken`);
  }

  removeCredential(id) {
    return this.apiservice.deleteWithHeader(`/user/${id}/removeToken`);
  }

  addCredential(data) {
    return this.apiservice.postWithHeader(`/user/addToken`, data);
  }

  updateCredential(data) {
    return this.apiservice.postWithHeader(`/user/editToken`, data);
  }

  googleSignIn(scope) {
    return new Promise(async (resolve, reject) => {
      const auth = await this.GAPIService.signIn(scope);
      await this.getGoogleRefreshToken(auth.code,scope);
      resolve();
    });
  }

  getGoogleRefreshToken(code,scope) {
    return new Promise((resolve, reject) => {
      const options = {
        scope:scope,
        client_id: this.googleClientId,
        code,
        grant_type: "authorization_code",
        client_secret: this.googleClientSecret,
        redirect_uri: environment.googleRedirectUri,
      };
      this.http
        .post("https://oauth2.googleapis.com/token", options)
        .subscribe(async (token) => {
          const user = this.GAPIService.userDetails;
          const keys = Object.keys(user);
          const googleAuthObj = {
            platform: Constants.DRIVES.google,
            email: user[keys[2]][Object.keys(user[keys[2]])[5]],
            token,
          };
          await this.addCredential(googleAuthObj);
          this.getFormattedCredentials();
          resolve();
        });
    });
  }

  getDbxToken(code) {
    return new Promise((resolve, reject) => {
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
        .subscribe(async (token) => {
          await this.dropboxLogin(token);
          resolve();
        });
    });
  }

  dropboxLogin(authObj) {
    return new Promise((resolve, reject) => {
      const dbx = new Dropbox({
        accessToken: authObj.access_token,
      });
      dbx
        .usersGetCurrentAccount()
        .then(async (res) => {
          const obj = {
            email: res.email,
            platform: Constants.DRIVES.dropbox,
            token: authObj,
          };
          await this.addCredential(obj);
          this.getFormattedCredentials();
          resolve();
        })
        .catch((err) => {});
    });
  }

  odLogin() {
    return new Promise((resolve, reject) => {
      const isIE =
        window.navigator.userAgent.indexOf("MSIE ") > -1 ||
        window.navigator.userAgent.indexOf("Trident/") > -1;
      const odAuthObj: any = { platform: Constants.DRIVES.oneDrive };
      if (isIE) {
        this.authService.loginRedirect();
      } else {
        this.authService.loginPopup().then((user) => {
          this.authService
            .acquireTokenSilent(this.odScopes)
            .then(async (res) => {
              odAuthObj.email = res.account.userName;
              odAuthObj.token = res;
              await this.addCredential(odAuthObj);
              resolve();
            });
        });
      }
    });
  }

  dropBoxFiles(tokenObj, path = ""): any {
    return new Promise((resolve, reject) => {
      const dbx = new Dropbox({
        accessToken: tokenObj.access_token,
      });
      // To get all the files and folders
      dbx
        .filesListFolder({ path })
        .then((response) => {
          resolve(response.entries);
        })
        .catch((error) => {
          reject(error);
          console.error(error);
        });
    });
  }

  dbxGetParticularFile(token, path): any {
    return new Promise((resolve, reject) => {
      const dbx = new Dropbox({
        accessToken: token,
      });
      dbx
        .filesGetTemporaryLink({ path })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  oneDriveFiles(token, path = ""): any {
    return new Promise((resolve, reject) => {
      let url = "https://graph.microsoft.com/v1.0/me/drive/root/children";
      if (path) {
        url = `https://graph.microsoft.com/v1.0/me/drive/items/${path}/children`;
      }
      this.http
        .get(url, { headers: { Authorization: `bearer ${token}` } })
        .subscribe(
          (res: any) => {
            resolve(res.value);
          },
          (err) => {
            // reject(err);
            resolve(err);
            // reject(err);
          }
        );
    });
  }

  oneDriveParticularFile(token, id): any {
    return new Promise((resolve, reject) => {
      this.http
        .get(`https://graph.microsoft.com/v1.0/me/drive/items/${id}/content`, {
          headers: { Authorization: `bearer ${token}` },
        })
        .subscribe(
          (res: any) => {
            resolve(res);
          },
          (err) => {
            // reject(err);
            reject(err);
          }
        );
    });
  }

  refreshExpiredGoogleToken(cred,scope) {
    
    return new Promise((resolve, reject) => {
      const refreshToken = cred.token.refresh_token;
      const options = {
        scope:scope,
        client_id:
          "705236048081-oufiqrib01puetn3gfa2t28bug0iu80k.apps.googleusercontent.com",
        grant_type: "refresh_token",
        client_secret: "kg6oqvLxbF0DeG_Ppkf5Wdlx",
        refresh_token: refreshToken,
      };
      this.http
        .post("https://oauth2.googleapis.com/token", options)
        .subscribe((token) => {
          cred.tokenId = cred._id;
          cred.token = token;
          cred.token.refresh_token = refreshToken;
          cred.updatedAt = new Date();
          resolve(cred);
        });
    });
  }
}
