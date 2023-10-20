import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { HelperService } from "./helper.service";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

export class JReponse {
  message: string;
  body: any;
  success: boolean;
  statusCode: number;
}

@Injectable({
  providedIn: "root",
})
export class APIService {
  API_URL: string;
  serverDownMsg =
    'Process Failed due to "Time Out Error"! Please try again later.';
  toastMsg = true;
  members: any;
  private subjectForComment = new Subject<any>();
  private subjectForMention= new Subject<any>();
  constructor(
    public http: HttpClient,
    public config: HelperService,
    private router: Router
  ) {
    this.API_URL = environment.API_URL;
  }
  sendTaskCommentData(data) {
    this.subjectForComment.next(data);
  }
  getTaskCommentFlag() {
    return this.subjectForComment.asObservable();
  }
  sendMentionData(data) {
    this.subjectForMention.next(data);
  }
  getMentionFlag() {
    return this.subjectForMention.asObservable();
  }
  /**
   * post(URL, data) => http post method without header
   * @param URL in api routing url after 'http://18.218.209.117/api/v1'
   * @param data in api request param
   */
  post(URL, data) {
    return new Promise((resolve, reject) => {
      this.http.post(this.API_URL + URL, data).subscribe(
        (res) => {
          this.config.printLog("inside ", res);
          if (res && res["statusCode"] !== 400) {
            resolve(res);
          } else {
            // this.config.showAlert(res);
            reject(res);
          }
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
getSingleUSer(data){
 return this.http.get(`${this.API_URL}/subscriptions/list/user/${data}`)
}
  postWithContentTypeHeader(URL, data) {
    return new Promise((resolve, reject) => {
      this.http.post(this.API_URL + URL, data, {
        headers: { "Content-Type": 'application/json' },
      }).subscribe(
        (res) => {
          this.config.printLog("inside ", res);
          if (res && res["statusCode"] !== 400) {
            resolve(res);
          } else {
            // this.config.showAlert(res);
            reject(res);
          }
        },
        (err) => {
          this.redirectUnauthorizedUser(err)
          reject(err);
        }
      );
    });
  }

  get(URL) {
    return new Promise((resolve, reject) => {
      this.http.get(this.API_URL + URL).subscribe(
        (res) => {
          this.config.printLog("inside ", res);
          resolve(res);
        },
        (err) => {
          // reject(err);
          reject(this.getErrorResponse(err));
        }
      );
    });
  }

  /**
   * getWithHeader(URL, xAuthToken) => http get method with header
   * @param URL in api routing url after 'http://18.218.209.117/api/v1'
   * @param xAuthToken in logged user token
   */
  getWithHeader(URL) {
    const xAuthToken = this.config.loggedUser.token;
    return new Promise((resolve, reject) => {
      let headerParams = {};
      if (URL.includes("admin/user/export") === true) {
        headerParams = {
          headers: { "x-auth-token": xAuthToken },
          responseType: "text",
        };
      } else {
        headerParams = { headers: { "x-auth-token": xAuthToken } };
      }
      this.http.get(this.API_URL + URL, headerParams).subscribe(
        (res) => {
          this.config.printLog("inside ", res);
          resolve(res);
        },
        (err) => {
          // reject(err);
          this.redirectUnauthorizedUser(err)
          reject(this.getErrorResponse(err));
        }
      );
    });
  }

  /**
   * postWithHeader(URL, data, xAuthToken) => http post method with header
   * @param URL in api routing url after 'http://18.218.209.117/api/v1'
   * @param data in api request param
   * @param xAuthToken in logged user token
   */
  postWithHeader(URL, data, xAuthToken = "") {
    if (!xAuthToken) {
      xAuthToken = this.config.loggedUser.token;
    }
    return new Promise((resolve, reject) => {
      this.http
        .post(this.API_URL + URL, data, {
          headers: { "x-auth-token": xAuthToken },
        })
        .subscribe(
          (res) => {
            this.config.printLog("inside", res);
            if (res["success"]) {
              resolve(res);
            } else {
              // this.config.showAlert(res["message"]);
              reject(res);
            }
          },
          (err) => {
            this.redirectUnauthorizedUser(err)
            reject(this.getErrorResponse(err));
            // reject(err);
          }
        );
    });
  }

  postWithAuthHeader(URL, data, authToken) {
    return new Promise((resolve, reject) => {
        this.http.post(URL, data, {
          headers: {
            Authorization: `Bearer ${authToken}`
          },
        })
        .subscribe(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }

  postWithHeaderAndUrl(URL, data, xAuthToken = "") {
    if (!xAuthToken) {
      xAuthToken = this.config.loggedUser.token;
    }
    return new Promise((resolve, reject) => {
      this.http
        .post(URL, data, {
          headers: { "x-auth-token": xAuthToken },
        })
        .subscribe(
          (res) => {
            this.config.printLog("inside", res);
            if (res["success"]) {
              resolve(res);
            } else {
              // this.config.showAlert(res["message"]);
              reject(res);
            }
          },
          (err) => {
            this.redirectUnauthorizedUser(err)
            reject(this.getErrorResponse(err));
            // reject(err);
          }
        );
    });
  }

  /**
   * putWithHeader(URL, data, xAuthToken) => http post method with header
   * @param URL in api routing url after 'http://18.218.209.117/api/v1'
   * @param data in api request param
   * @param xAuthToken in logged user token
   */
  putWithHeader(URL, data, xAuthToken = "") {
    if (!xAuthToken) {
      xAuthToken = this.config.loggedUser.token;
    }
    return new Promise((resolve, reject) => {
      this.http
        .put(this.API_URL + URL, data, {
          headers: { "x-auth-token": xAuthToken },
        })
        .subscribe(
          (res) => {
            this.config.printLog("inside", res);
            if (res["success"]) {
              resolve(res);
            } else {
              reject(res);
            }
          },
          (err) => {
            this.redirectUnauthorizedUser(err)
            reject(this.getErrorResponse(err));
            // reject(err);
          }
        );
    });
  }

  /**
   * deleteWithHeader(URL, xAuthToken) => http delete method with header
   * @param URL in api routing url after 'http://18.218.209.117/api/v1'
   * @param xAuthToken in logged user token
   */

  deleteWithHeader(URL, xAuthToken = "") {
    if (!xAuthToken) {
      xAuthToken = this.config.loggedUser.token;
    }
    return new Promise((resolve, reject) => {
      this.http
        .delete(this.API_URL + URL, { headers: { "x-auth-token": xAuthToken } })
        .subscribe(
          (res) => {
            this.config.printLog("inside ", res);
            resolve(res);
          },
          (err) => {
            this.redirectUnauthorizedUser(err)
            reject(this.getErrorResponse(err));
          }
        );
    });
  }

  /**
   * getErrorResponse(err, showAlert?, showToast?) => get error and return error message
   * @param err in error
   * @param showAlert in
   * @param showToast in
   */
  getErrorResponse(err, showAlert?: boolean, showToast?: boolean) {
    let error: JReponse = new JReponse();
    if (err && (err.status === 0 || err.status === 500 || err.status === 504)) {
      // if (!showToast) this.config.showErrorToast(this.serverDownMsg);
    } else if (err && err.status === 401) {
      if (this.toastMsg) {
        this.toastMsg = false;
        // this.config.onLogout();
        // this.config.clearStorage();
        // this.router.navigate(['/login']);
      }
    } else {
      error = err.error;
      if (showAlert) {
        // this.config.showErrorToast(error.message ? error.message : error);
      } else if (!showToast) {
        // this.config.showErrorToast(error.message ? error.message : error);
      }
    }

    error = err.error;
    error.statusCode = err.status;

    return error;
  }

  redirectUnauthorizedUser(err:any){
    if(err.status === 401){
      setTimeout(() => {
        this.config.searchKeyword = "";
        this.config.clearStorage();
        this.config.notificationCount = 0;
        document.getElementById("mainBody").classList.value = "";
        this.router.navigateByUrl("/auth/sign-in");
      }, 50);
    }
  }
}
