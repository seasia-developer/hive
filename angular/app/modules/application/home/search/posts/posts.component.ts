import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import * as _ from "lodash";

import { SearchService } from "../search.service";
import { HelperService } from "src/app/services/helper.service";
import { JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
import { HomeService } from "../../home.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  mediaUrl = environment.MEDIA_URL;
  posts = [];
  imgModal: any;
  filterSettings: any = {};
  showMenu = "";
  organizationKey = "";
  organizationOptions = [];
  searchedOrgs = [];
  locationKey = "";
  locationOptions = [];
  searchedLocations = [];
  industryOptions = [];
  totalPost;
  loadMoreDataSubs = new Subscription();
  orgRole:string = 'light_member';

  constructor(private searchService: SearchService,
    public helperService: HelperService,
    public homeService: HomeService,
    private router: Router,) { }

  async ngOnInit() {
    this.orgRole = this.helperService.getLocalStore("orgRole")
    await this.getPost(0);
    this.loadMoreDataSubs = this.searchService.loadMoreData.subscribe((tab) => {

      if (tab === "posts") {
        this.getPost();
      }
    });
  }
  getPost(length = -1) {
    return new Promise((resolve, reject) => {
      const keyword = this.helperService.searchKeyword
        ? this.helperService.searchKeyword
        : "";
      const skipCount = length >= 0 ? length : this.posts.length;
    

      this.totalPost = skipCount > 0 ? this.totalPost : 0;
      if (this.totalPost == 0 || this.totalPost > this.posts.length) {


        this.searchService
          .getPost(skipCount, keyword)
          .then((jresponse: JReponse) => {
            if (jresponse.body && !_.isEmpty(jresponse.body)) {
              const postData = jresponse.body.data;
              this.totalPost = jresponse.body.totalRecord;
              if (length === 0) {
                this.posts = [];
              }
              this.posts = [...this.posts, ...postData];
            }

            resolve();
          })
          .catch((err: any) => {
            // this.helperService.showErrorToast(err.error.message);
            reject();
            throw err;
          });
      }
    });
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
    this.router.navigate(["/application/home/parent/public-profile"], {
      queryParams: {
        userId: id,
      },
    });
  }
}
