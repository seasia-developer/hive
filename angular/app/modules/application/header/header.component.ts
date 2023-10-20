import { Component, OnInit, Renderer2, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { HelperService } from "src/app/services/helper.service";
import { environment } from "../../../../environments/environment";
import { AppViewService } from "../../application/home/application-view/application-view.service";
import { HomeService } from "../../application/home/home.service";
import { APIService, JReponse } from "src/app/services/api.service";
import { SocketService } from "src/app/services/socketio.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { UpgradePopupComponent } from "../home/upgrade/upgrade-popup/upgrade-popup.component";
import { isNgTemplate } from "@angular/compiler";
import { flatMap } from "rxjs/operators";
import { SharedOnboardingService } from "../../../modules/onboarding/shared-onboarding.service";
//import { _ } from 'ag-grid-community';
@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  showProfile = false;
  isSuperAdmin = false;
  env = environment;
  showSearchOptions = false;
  showSearchOptionsDesk = false;
  showSearchResult = false;
  showHeaderOption = true;
  showMobileOption = false;
  searchData;
  mediaUrl;
  generalData;
  notificationCount;
  modalRef: BsModalRef;
  upgradeFlag: boolean = false;
  activeOrgId: string;
  currentURL = "";
  paramOrgId;
  paramPlan;
  paramType;
  showHeaderWithLogoOnly = false;
  showHeaderWithAllOptions = true;
  is_search: boolean = true;

  constructor(
    public helperService: HelperService,
    private router: Router,
    private renderer: Renderer2,
    private appViewService: AppViewService,
    private socketService: SocketService,
    public homeService: HomeService,
    private modalService: BsModalService,
    private apiService: APIService,
    private route: ActivatedRoute,
    private sharedOnboardingService: SharedOnboardingService
  ) {}

  ngOnInit() {
    this.currentURL = this.router.url;
    this.route.queryParams.subscribe((params) => {
      this.paramOrgId = params.orgId;
      this.paramPlan = params.plan;
      this.paramType = params.type;
    });
    if (
      this.currentURL ===
        `/application/home/upgrade?orgId=${this.paramOrgId}` ||
      this.currentURL ===
        `/application/home/upgrade/payment?orgId=${this.paramOrgId}&plan=${this.paramPlan}&type=${this.paramType}`
    ) {
      this.showHeaderWithLogoOnly = true;
      this.showHeaderWithAllOptions = false;
    } else {
      this.showHeaderWithLogoOnly = false;
      this.showHeaderWithAllOptions = true;
    }

    if (!this.helperService.notificationCount) {
      this.helperService.notificationCount =
        this.helperService.getLocalStore("notificationCount");
    }
    this.mediaUrl = environment.MEDIA_URL;
    this.helperService.searchKeyword = !this.helperService.searchKeyword
      ? ""
      : this.helperService.searchKeyword;
    this.renderer.listen("window", "click", (event) => {
      if (event.target.id !== "avatar" && event.target.id !== "default-image") {
        this.showProfile = false;
      }
    });
    this.getNotificationCount();
    this.socketService.connectSocket();

    // HIDE / SHOW UPGRATE BTN
    this.getUpgradeHideFlag();
  }

  // HIDE / SHOW UPGRATE BTN
  async getUpgradeHideFlag() {
    const userData = this.helperService.getLocalStore("userData");
    await this.apiService
      .getWithHeader(`user/${userData.owner}/getUpgradeHideFlag`)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          if (jresponse.body) {
            if (jresponse.body.orgRole && jresponse.body.orgRole[0]) {
              this.activeOrgId = jresponse.body.orgRole[0].organization_id;
            }
            if (jresponse.body.upgradeFlag) {
              this.upgradeFlag = true;
            }
          }
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  redirectUrl() {
    console.log('redirectUrl works', this.homeService.activeWorkspaceId)
    if (
      this.helperService.searchKeyword &&
      this.helperService.searchKeyword != ""
    ) {
      this.showSearchOptions = false;
      this.showSearchResult = false;
      this.showSearchOptionsDesk = false;
      this.router.navigateByUrl("/", { skipLocationChange: true }).then(() =>
        this.router.navigate(["application/home/search"], {
          queryParams: {
            keyword: this.helperService.searchKeyword,
          },
        })
      );

      // this.router.navigateByUrl(
      //   `/application/home/search?keyword=${this.helperService.searchKeyword}`
      // );
    }
  }

  redirectHome() {
    this.homeService.activityWsId = "";
    this.homeService.activityOrgId = "";
    this.homeService.activeWorkspaceId = "";
    this.homeService.applicationList = [];
    this.homeService.sendOrgIdForPost({
      organization_id: "",
      workspace_id: "",
    });
    this.router.navigateByUrl("application/home");
  }

  goToTask() {
    this.router.navigateByUrl("application/home/task");
  }

  onLogout() {
    // this.socketService.disconnectSocket();
    setTimeout(() => {
      this.helperService.searchKeyword = "";
      this.helperService.clearStorage();
      this.helperService.notificationCount = 0;
      document.getElementById("mainBody").classList.value = "";
      this.router.navigateByUrl("/auth/sign-in");
    }, 50);
  }

  openUpgradeModal() {
    const modalParams = Object.assign(
      {},
      {
        class: "small-custom-modal custom-upgrade-modal",
        animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true,
      }
    );
    this.modalRef = this.modalService.show(UpgradePopupComponent, modalParams);
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
    if (this.helperService.loggedUser) {
      this.isSuperAdmin = this.helperService.loggedUser.isSuperAdmin;
    }
  }

  upgradePlan() {
    if (this.helperService.orgList) {
      this.router.navigateByUrl(
        `application/home/upgrade?orgId=${this.activeOrgId}`
      );
      // if (this.helperService.orgList.length > 1) {
      //   this.openUpgradeModal();
      // } else {
      //   this.router.navigateByUrl(
      //     `application/home/upgrade?orgId=${this.helperService.orgList[0]._id}`
      //   );
      // }
    }
  }

  toggleMenu() {
    this.showHeaderOption = false;
    this.showMobileOption = true;
  }

  mainMenuHide() {
    this.showHeaderOption = true;
    this.showMobileOption = false;
    this.showSearchResult = false;
  }

  search(event) {
    if (event.target.value.length) {
      this.helperService.searchKeyword = event.target.value;
      this.showSearchOptions = false;
      this.showSearchOptionsDesk = false;
      this.showSearchResult = true;
      this.appViewService
        .searchResult(0, event.target.value)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.searchData = jresponse.body.data;
            // this.showSearchResult = false;
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    } else {
      this.helperService.searchKeyword = "";
      this.showSearchOptions = true;
      this.showSearchOptionsDesk = true;
      this.showSearchResult = false;
    }
  }

  hideOptions() {
    setTimeout(() => {
      this.showSearchOptions = false;
      this.showSearchOptionsDesk = false;
    }, 500);
  }

  clickedOutside(event) {
    if (event.target.id !== "filter-options") {
      this.showSearchResult = false;
    }
  }

  async getNotificationCount() {
    await this.homeService
      .getNotificationCount()
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.helperService.notificationCount =
            jresponse.body.notificationCount;
          this.helperService.setLocalStore(
            "notificationCount",
            this.helperService.notificationCount
          );
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }
  redirectToLocation(item) {
    if (item.type == "user") {
      this.router.navigate(["/application/home/parent/public-profile"], {
        queryParams: {
          userId: item._id,
        },
      });
    }
  }
  redirectProfile(item) {
    console.log(item , this.homeService.activeWorkspaceId, "iteemmmmmmmmmmmmm");
    if (item.type == "organization") {
      this.router.navigateByUrl("/", { skipLocationChange: true }).then(() =>
        this.router.navigate(["application/home/org-profile"], {
          queryParams: {
            organizationId: item._id,
            type: "profile",
        },
        })
      );
    } else {
      console.log('redirectProfile else worked')
      this.router.navigateByUrl("/", { skipLocationChange: true }).then(() =>
        this.router.navigate(["application/home/parent/public-profile"], {
          queryParams: {
            userId: item._id,
            workspace_id : this.homeService.activeWorkspaceId,
          },
        })
      );
    }
  }

  ngOnDestroy() {
    this.socketService.disconnectSocket();
  }
}
