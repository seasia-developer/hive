import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";

import { HelperService } from "src/app/services/helper.service";
import { AppViewService } from "../../../application/home/application-view/application-view.service";
import { JReponse } from "src/app/services/api.service";
import { environment } from "../../../../../environments/environment";
import { SearchService } from "./search.service";
import { HomeService } from "../home.service";
import { _ } from 'ag-grid-community';

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit, OnDestroy {
  caller=true;
  selectedTab = "";
  generalData = [];
  imgModal: any;
  totalResult;
  mediaUrl;
  env = environment;
  routerSubscription = new Subscription();
  workspace_Id: any;
  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public helperService: HelperService,
    private appViewService: AppViewService,
    private searchService: SearchService,
    public homeService: HomeService

  ) { }

  scroll(event) {

      // event.target.scrollTop ===
      // event.target.scrollHeight - event.target.clientHeight
    if (
      event.target.scrollTop + event.target.clientHeight >= event.target.scrollHeight-50
    ) {
      if (!this.selectedTab) {
        this.getAllData(0, "scroll");
      } else {
        this.searchService.loadMoreData.next(this.selectedTab);
      }
    }
  }

  async ngOnInit() {
     this.workspace_Id = this.homeService.activeWorkspaceId
    this.mediaUrl = environment.MEDIA_URL;
    if (this.activatedRoute.snapshot["_urlSegment"].segments[3]) {
      this.changeTab(
        this.activatedRoute.snapshot["_urlSegment"].segments[3].path
      );
    } else {
      this.selectedTab = "";
      this.generalData = [];
      await this.getAllData(0, "all");
    }
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event["url"]) {
        const url = event["url"].substring(event["url"].lastIndexOf("/"));
        if (url.includes("search")) {
          this.selectedTab = "";
          this.generalData = [];
          this.getAllData(0, "all");
        }
      }
    });
  }

  getAllData(length = -1, type) {
    return new Promise<void>((resolve, reject) => {
      let keyword = this.helperService.searchKeyword
        ? this.helperService.searchKeyword
        : "";
      const skipCount = this.generalData.length ? this.generalData.length : 0;
      if (this.caller===true) {
        this.caller=false;
      
      this.appViewService
        .searchResult(skipCount, keyword)
        .then((jresponse: JReponse) => {
          this.caller=true;
          if (jresponse.success) {
            if (type == "all") {
              this.generalData = jresponse.body.data;
            } else {
              this.generalData = [...this.generalData, ...jresponse.body.data];
            }
            this.generalData.forEach((e) => {
              let city = e.city && e.city != "" ? e.city + ', ' : "";
              let country = e.country && e.country != "" ? e.country : "";
              e.address = city + country;
            })
            this.totalResult = jresponse.body.totalResult;
          }
          resolve();
        })
        .catch((err: Error) => {
          // this.helperService.showErrorToast(err.message);
          reject();
          throw err;
        });
      }
    });
  }

  changeTab(tab) {
    this.selectedTab = tab;
  }
  following(item) {
    let data = {};
    if (item.type == 'organization') {
      data['organization_id'] = item._id;
      data['followType'] = "organization";
      data['type'] = item.follow && item.follow == 'true' ? 'unfollow' : 'follow';
    } else if (item.type == 'user') {
      data['following'] = item._id;
      data['followType'] = "people";
      data['type'] = item.follow && item.follow == 'true' ? 'unfollow' : 'follow';;
    }
    this.homeService.addFollowing(data)
      .then((jresponse: JReponse) => {
        item.follow = item.follow && item.follow == 'true' ? 'false' : 'true';
        item.totalFollow = item.follow == 'false' ? item.totalFollow - 1 : item.totalFollow + 1;
        this.helperService.showSuccessToast(jresponse.message);
      })
      .catch((err: Error) => {
        throw err;
      });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }
  openImgModal(images, type) {
    this.imgModal = [];
    if (type == 1) {
      this.imgModal = images[0];
    } else if (type == 2) {
      this.imgModal = images.slice(0, 2);
    } else if (type == 3) {
      this.imgModal = images.slice(0, 3);
    } else if (type == 24) {
      this.imgModal = images.slice(0, 4);
    } else {
      this.imgModal = images;
    }
    document.getElementById("imgModalBtn").click();
  }
  goToPublicProfile(id) {
    console.log("goToPublicProfile")
    this.router.navigate(["/application/home/parent/public-profile"], {
      queryParams: {
        userId: id,
      },
    });
  }
}
