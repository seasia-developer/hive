import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { HomeService } from "../../home.service";
import { JReponse } from "src/app/services/api.service";
import { environment } from "src/environments/environment";
import { HelperService } from "src/app/services/helper.service";
@Component({
  selector: "app-wp-market",
  templateUrl: "./wp-market.component.html",
  styleUrls: ["./wp-market.component.scss"],
})
export class WpMarketComponent implements OnInit {
  markets: [];
  mediaUrl = environment.MEDIA_URL;

  categoryArray = [];
  catIdFromURL;
  arrow = true;
  categorys = [];
  constructor(
    private homeService: HomeService,
    private activatedRoute: ActivatedRoute,
    private helperService: HelperService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getcategory();
    this.getMarketWorkspace("");
    this.catIdFromURL = this.activatedRoute.snapshot.queryParams.categoryId;
    if (this.catIdFromURL) {
      this.getMarketWorkspace(this.catIdFromURL);
    }
  }

  goToMarket() {
    this.router.navigateByUrl("wordpress/wp-market");
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
  async getMarketWorkspace(categoryId) {
    const userInfo = this.helperService.getLocalStore("userData");
    // this.homeService
    //   .getMarketWorkspacesDetail(marketId, !userInfo)
    await this.homeService
      .getCategory()
      .then((jresponse: JReponse) => {
        jresponse.body = jresponse.body.filter((element) => {
          return element.totalWs > 0;
        });
        jresponse.body.forEach((cat) => {
          if (cat._id === categoryId) {
            this.categoryArray = [];
            this.categoryArray.push(cat);
            this.homeService
              .getWpMarketWorkspace({
                category_id: cat._id,
                format: "all",
                type: "market",
                keyword: "",
              })
              .then((jresponse: JReponse) => {
                if (jresponse) {
                  this.arrow = false;
                  cat.markets = jresponse.body.workspaces;
                }
              })
              .catch((err: Error) => {
                throw err;
              });
          }
          if (!categoryId) {
            this.categoryArray.push(cat);
            this.homeService
              .getWpMarketWorkspace({
                category_id: cat._id,
                format: "3",
                type: "market",
                keyword: "",
              })
              .then((jresponse: JReponse) => {
                if (jresponse) {
                  cat.markets = jresponse.body.workspaces;
                }
              })
              .catch((err: Error) => {
                throw err;
              });
          }
        });
      })
      .catch((err: Error) => {
        throw err;
      });
  }
  // getMarketWorkspace(categoryId) {
  //   this.homeService
  //     .getCategory()
  //     .then((jresponse: JReponse) => {
  //       jresponse.body.forEach((cat) => {
  //         if (cat._id === categoryId) {
  //           this.categoryArray = [];
  //           this.categoryArray.push(cat);
  //           this.homeService
  //             .getWpMarketWorkspace({
  //               category_id: cat._id,
  //               format: "all",
  //               type: "market",
  //               keyword: "",
  //             })
  //             .then((jresponse: JReponse) => {
  //               if (jresponse) {
  //                 this.arrow = false;
  //                 cat.markets = jresponse.body.workspaces;
  //               }
  //             })
  //             .catch((err: Error) => {
  //               throw err;
  //             });
  //         }
  //         if (!categoryId) {
  //           this.categoryArray.push(cat);
  //           this.homeService
  //             .getWpMarketWorkspace({
  //               category_id: cat._id,
  //               format: "3",
  //               type: "market",
  //               keyword: "",
  //             })
  //             .then((jresponse: JReponse) => {
  //               if (jresponse) {
  //                 cat.markets = jresponse.body.workspaces;
  //               }
  //             })
  //             .catch((err: Error) => {
  //               throw err;
  //             });
  //         }
  //       });
  //     })
  //     .catch((err: Error) => {
  //       throw err;
  //     });
  // }

  marketDetailsRoute(marketId) {
    this.router.navigate(["wordpress/wp-market-detail"], {
      queryParams: {
        marketId: marketId,
      },
    });
  }
}
