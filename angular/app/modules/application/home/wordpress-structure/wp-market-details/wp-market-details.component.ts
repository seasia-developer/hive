import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormControl } from "@angular/forms";

import { HomeService } from "../../home.service";
import { JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
import { HelperService } from "src/app/services/helper.service";
@Component({
  selector: "app-wp-market-details",
  templateUrl: "./wp-market-details.component.html",
  styleUrls: ["./wp-market-details.component.scss"],
})
export class WpMarketDetailsComponent implements OnInit {
  markets: [];
  mediaUrl = environment.MEDIA_URL;

  categories: any;
  categoryArray = [];
  marketDetail: any;
  organization: any;
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
  showOrgWsList = false;
  selectedOrg: any = {};
  avgRating = 0;
  followUser = false;
  parentId;
  orgInfo;
  auth;
  addClass;
  categorys = [];
  constructor(
    private homeService: HomeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private helperService: HelperService,
    private helper: HelperService
  ) {
    this.marketIdFromURL = this.activatedRoute.snapshot.queryParams.marketId;
    this.auth = this.activatedRoute.snapshot.queryParams.auth;
  }

  ngOnInit() {
    this.getcategory();
    if (this.marketIdFromURL) {
      this.getMarketWorkspaceDetail(this.marketIdFromURL);
      this.getAllComment(this.marketIdFromURL);
    }
    this.addCommentForm = new FormGroup({
      comment_text: new FormControl(""),
    });
    this.organizations = this.helperService.getLocalStore("organizations");
    if (this.helperService.loggedUser && this.helperService.loggedUser.avatar) {
      this.avatar = this.mediaUrl + this.helperService.loggedUser.avatar;
    }
    this.getoverallRating(this.marketIdFromURL);
    this.getFollowingUser();
    // this.helperService.setLocalStore("userData", {restrictedDomain: false});
    // this.helperService.setLocalStore("wpMarket", {
    //   marketAuth: false
    // });
  }
  getcategory() {
    this.homeService
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
  // getcategory() {
  //   this.homeService
  //     .getCategory()
  //     .then((jresponse: JReponse) => {
  //       jresponse.body.forEach((element) => {
  //         if (element.totalWs > 0) {
  //           this.categorys.push(element);
  //         }
  //       });
  //      // this.categorys = jresponse.body;
  //     })
  //     .catch((err: Error) => {
  //       throw err;
  //     });
  // }

  toggleOrgWsList() {
    this.showOrgWsList = !this.showOrgWsList;
  }

  getMarketWorkspace(categoryId) {
    this.router.navigate(["wordpress/wp-market"], {
      queryParams: {
        categoryId,
      },
    });
  }

  selectWs(workspace, org) {
    this.selectedWorkspace = workspace;
    this.selectedOrg = org;
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
        organization_id: this.selectedOrg._id,
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
        this.marketDetail = jresponse.body.data;
        this.parentId = jresponse.body.data.parentId;
        this.getOrgProfile(this.parentId);
        this.organization = jresponse.body.organization;
        this.categories = jresponse.body.data.categories;
        if (jresponse.body.organization) {
          this.org_id = jresponse.body.organization._id;
        }
        this.categoryId = jresponse.body.data.categories[0]._id;
        this.workspaceId = jresponse.body.data.workspace_id;
        const sum = jresponse.body.data.usersRatings.map((x) => x.rating);
        const usersRat = jresponse.body.data.usersRatings.length;
        if (usersRat) {
          this.avgRating = eval(sum.join("+")) / usersRat;
        }
        if (userInfo) {
          const isRated = jresponse.body.data.usersRatings.find(
            (x) => x.user_id === userInfo.owner
          );
          if (isRated) {
            this.rated = isRated.rating;
          }
        }
        let appData;
        if (this.marketDetail) {
          appData = {
            wsId: this.marketDetail ? this.marketDetail.workspace_id : "",
            appId: jresponse.body.applications
              ? jresponse.body.applications[0]._id
              : "",
            viewId: jresponse.body.applications
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

  submitForm(event) {
    if (event.key === "Enter" && event.target.value) {
      const reqData = {
        market_id: this.marketIdFromURL,
        comment: this.addCommentForm.get("comment_text").value,
      };
      this.homeService
        .addComment(reqData)
        .then((jresponse: JReponse) => {
          this.helperService.showSuccessToast(jresponse.message);
          this.homeService
            .getAllComment(this.marketIdFromURL)
            .then((jresponse: JReponse) => {
              this.allComment = jresponse.body;
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
      app,
      marketWsId: this.marketIdFromURL,
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
          type,
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

  getOrgProfile(id) {
    this.homeService
      .getOrgProfile(id)
      .then((jresponse: JReponse) => {
        this.orgInfo = jresponse.body;
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  goToMarket() {
    this.router.navigateByUrl("wordpress/wp-market");
    // this.router.navigateByUrl("application/home/market");
  }

  checkAuth() {
    const user = this.helper.loggedUser;
    if (user && user.token) {
      this.helperService.setLocalStore("wpMarket", {
        marketAuth: true,
        marketId: this.marketIdFromURL,
      });

      // this.router.navigateByUrl(
      //   `application/home/market-detail?marketId=${this.marketIdFromURL}&auth=true`
      // );
      // http://localhost:4200/application/home/market-detail?marketId=5f71e39944b04f109c6a6713&auth=true
      // http://localhost:4200/application/home/market-detail?marketId=5f71e39944b04f109c6a6713&auth=true
      // window.location.href = "http://localhost:4200/application/home/market-detail?auth=true&marketId=" + this.marketIdFromURL;
      window.open(
        environment.googleRedirectUri + "/application/home/market-detail?auth=true&marketId=" +
        this.marketIdFromURL,
        "_blank"
      );
    } else {
      this.helperService.setLocalStore("wpMarket", {
        marketAuth: false,
        marketId: this.marketIdFromURL,
      });

      // window.location.href = "http://localhost:4200/auth/sign-in?marketAuth=false&marketId=" + this.marketIdFromURL;
      window.open(
        environment.googleRedirectUri + "/auth/sign-in?auth=false&marketId=" +
        this.marketIdFromURL,
        "_blank"
      );

      // this.router.navigate(["auth/sign-in"], {
      //   queryParams: {
      //     marketAuth: false,
      //     marketId: this.marketIdFromURL
      //   },
      // });
    }
  }
}
