import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormControl } from "@angular/forms";

import { HomeService } from "../home.service";
import { JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
import { HelperService } from "src/app/services/helper.service";
@Component({
  selector: "app-market-detail",
  templateUrl: "./market-detail.component.html",
  styleUrls: ["./market-detail.component.scss"],
})
export class MarketDetailComponent implements OnInit, AfterViewInit {
  markets: [];
  mediaUrl = environment.MEDIA_URL;
  categorys = [];
  categories: any;
  categoryArray = [];
  marketDetail: any;
  organization: any;
  wsRole: any;
  marketIdFromURL;
  addCommentForm: FormGroup;
  allComment: [];
  commentCount = 0;
  avatar = "";
  rated = 0;
  rateImag = [];
  overallRating = 0;
  workspaceId = "";
  categoryId = "";
  org_id = "";
  applications = [];
  organizations = [];
  orgWsList = [];
  selectedWorkspace: any = {};
  selectedOrg: any = {};
  showOrgWsList = false;
  selectedWsOrg: any = {};
  avgRating = 0;
  followUser = false;
  parentId;
  orgInfo;
  marketInfo;
  showOrgList = false;
  testWorkspaceId;

  constructor(
    private homeService: HomeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private helperService: HelperService
  ) {
    this.marketIdFromURL = this.activatedRoute.snapshot.queryParams.marketId;
  }

  ngOnInit() {
    this.marketInfo = this.helperService.getLocalStore("wpMarket");
    this.getcategory();
    if (this.marketIdFromURL) {
      this.getMarketWorkspaceDetail(this.marketIdFromURL);
      this.getAllComment(this.marketIdFromURL);
      this.getOrgWsList();
    }
    this.addCommentForm = new FormGroup({
      comment_text: new FormControl(""),
    });
    this.organizations = this.helperService.getLocalStore("organizations");
    if (this.helperService.loggedUser.avatar) {
      this.avatar = this.mediaUrl + this.helperService.loggedUser.avatar;
    }
    this.getoverallRating(this.marketIdFromURL);
    this.getFollowingUser();
  }

  ngAfterViewInit() {
    if (this.marketInfo && this.marketInfo.marketId) {
      setTimeout(() => {
        document.getElementById("workspaceBtn").click();
      }, 500);
      this.helperService.setLocalStore("wpMarket", {});
    }
  }

  async getcategory() {
    await this.homeService
      .getCategory()
      .then((jresponse: JReponse) => {
        jresponse.body.forEach((element) => {
          if (element.totalWs > 0) {
            this.categorys.push(element);
          }
        });
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  toggleOrgWsList() {
    this.showOrgWsList = !this.showOrgWsList;
  }

  getOrgWsList() {
    this.homeService
      .getOrgWsListWithRole()
      .then((jresponse: JReponse) => {
        this.orgWsList = jresponse.body;
      })
      .catch((err: Error) => {
        throw err;
      });
  }
  getMarketWorkspace(categoryId) {
    this.router.navigate(["application/home/market"], {
      queryParams: {
        categoryId: categoryId,
      },
    });
  }

  goToMarket() {
    this.router.navigateByUrl("application/home/market");
  }

  selectWs(workspace, org) {
    this.selectedWorkspace = workspace;
    this.selectedWsOrg = org;
    this.showOrgWsList = false;
  }

  cloneWorkspace(type, organization_id = "", name = "") {
    if (type === "name") {
      const data = {
        workspace_id: this.marketIdFromURL,
        name,
        organization_id,
      };
      this.homeService
        .cloneWorkspaceByName(data)
        .then((jresponse: JReponse) => {
          document.getElementById("closeModal").click();
          this.helperService.showSuccessToast(jresponse.message);
        })
        .catch((err: Error) => {
          throw err;
        });
    } else {
      const data = {
        market_place_id: this.marketIdFromURL,
        workspace_id: this.selectedWorkspace._id,
        organization_id: this.selectedWsOrg._id,
      };
      this.homeService
        .cloneWorkspaceById(data)
        .then((jresponse: JReponse) => {
          document.getElementById("closeModal").click();
          this.helperService.showSuccessToast(jresponse.message);
        })
        .catch((err: Error) => {
          throw err;
        });
    }
  }

  getMarketWorkspaceDetail(marketId) {
    const userInfo = this.helperService.getLocalStore("userData");
    this.homeService
      .getMarketWorkspacesDetail(marketId, !userInfo)
      .then((jresponse: JReponse) => {
        this.applications = jresponse.body.applications;
        if (jresponse.body.data.clone) {
          this.testWorkspaceId = jresponse.body.data._id;
        } else {
          this.testWorkspaceId = jresponse.body.data.workspace_id;
        }
        this.marketDetail = jresponse.body.data;
        this.parentId = jresponse.body.data.parentId;
        this.getOrgProfile(this.parentId);
        this.organization = jresponse.body.organization;
        this.wsRole = jresponse.body.workspace.role;
        this.categories = jresponse.body.data.categories;
        if (jresponse.body.organization) {
          this.org_id = jresponse.body.organization._id;
        }
        this.categoryId = jresponse.body.data.categories[0]._id;
        this.workspaceId =
          jresponse.body.data.clone == true
            ? jresponse.body.data._id
            : jresponse.body.data.workspace_id;
        const sum = jresponse.body.data.usersRatings.map((x) => x.rating);
        const usersRat = jresponse.body.data.usersRatings.length;
        if (usersRat) {
          this.avgRating = eval(sum.join("+")) / usersRat;
        }
        const isRated = jresponse.body.data.usersRatings.find(
          (x) => x.user_id === userInfo.owner
        );
        if (isRated) {
          this.rated = isRated.rating;
        }
        let appData;
        if (this.marketDetail) {
          appData = {
            wsId: this.marketDetail ? this.marketDetail.workspace_id : "",
            appId: jresponse.body.applications.length
              ? jresponse.body.applications[0]._id
              : "",
            viewId: jresponse.body.applications.length
              ? jresponse.body.applications[0].viewId
                ? jresponse.body.applications[0].viewId
                : ""
              : "",
          };
        }
        this.helperService.setLocalStore("marketWorkplaceDetailData", appData);
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  consoleData(data){
    console.log('data',data)
    return false;
  }

  getOrgProfile(id) {
    this.homeService
      .getOrgProfile(id)
      .then((jresponse: JReponse) => {
        this.orgInfo = jresponse.body;
        this.getFollowingUser();
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  submitForm(event) {
    let comment=event.target.innerText.trim()
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 13 && event.shiftKey) {
      event.stopPropagation();
    } else if (charCode == 13 && comment) {
      event.preventDefault();
      const reqData = {
        market_id: this.marketIdFromURL,
        comment: event.target.innerText.trim(),
      };
      this.homeService
        .addComment(reqData)
        .then((jresponse: JReponse) => {
          this.helperService.showSuccessToast(jresponse.message);
          this.homeService
            .getAllComment(this.marketIdFromURL)
            .then((jresponse: JReponse) => {
              event.target.innerText="";
              this.allComment = jresponse.body;
              this.commentCount = this.allComment.length;
            })
            .catch((err: Error) => {
              throw err;
            });
          this.addCommentForm.get("comment_text").setValue("");
        })
        .catch((err: Error) => {
          throw err;
        });
    }
  }

  getAllComment(id) {
    this.homeService
      .getAllComment(id)
      .then((jresponse: JReponse) => {
        this.allComment = jresponse.body;
        if (this.allComment.length > 0) {
          this.commentCount = this.allComment.length;
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  profile() {
    this.router.navigate(["application/home/org-profile"], {
      queryParams: {
        workspaceId: this.workspaceId,
        categoryId: this.categoryId,
        organizationId: this.org_id,
        parentId: this.parentId,
        type: "market",
      },
    });
  }

  addRated(rate) {
    this.homeService
      .addRatingOnMarketPlace(this.marketIdFromURL, { rating: rate })
      .then((jresponse: JReponse) => {
        this.helperService.showSuccessToast(jresponse.message);
        this.getMarketWorkspaceDetail(this.marketIdFromURL);
        this.getoverallRating(this.marketIdFromURL);
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  getoverallRating(id) {
    this.homeService
      .overallRatingMarketPlace(id)
      .then((jresponse: JReponse) => {
        this.overallRating = jresponse.body.overallRating;
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  changeApp(app, index) {
    const data = {
      app: app,
      marketWsId: this.marketIdFromURL,
      wsId: this.testWorkspaceId,
    };
    this.homeService.sendAppIdForMarketPlcae(data);
    this.applications.forEach((element) => {
      element.isSelected = false;
    });
    this.applications[index].isSelected = true;
  }

  following(followingId, type) {
    if (followingId && type) {
      this.homeService
        .addFollowing({
          organization_id: this.orgInfo._id,
          followType: "organization",
          type: type,
        })
        .then((jresponse: JReponse) => {
          this.getFollowingUser();
          this.helperService.showSuccessToast(jresponse.message);
        })
        .catch((err: Error) => {
          throw err;
        });
    }
  }

  getFollowingUser() {
    if (this.orgInfo) {
      this.homeService
        .getFollowingUser({
          organization_id: this.orgInfo._id,
          followType: "organization",
        })
        .then((jresponse: JReponse) => {
          if (jresponse.body) {
            this.followUser = true;
          } else {
            this.followUser = false;
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    }
  }
}
