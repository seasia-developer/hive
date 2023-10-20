import { Component, OnInit } from "@angular/core";
import { APIService, JReponse } from "src/app/services/api.service";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent implements OnInit {
  countData;
  showOverview = false;

  constructor(private apiService: APIService, private router: Router) {
    // get current route
    router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === "/application/home/admin") {
          this.showOverview = true;
        } else {
          this.showOverview = false;
        }
      });
  }

  async ngOnInit() {
    await this.getCounts();
  }

  async getCounts() {
    await this.apiService
      .getWithHeader("admin/get_homepage_count")
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.countData = jresponse.body;
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }
}
