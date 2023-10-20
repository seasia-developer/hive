import { Component, OnInit, HostListener } from "@angular/core";
import { Router } from "@angular/router";

import { HelperService } from "./services/helper.service";
import { HomeService } from "./modules/application/home/home.service";
import { SocketService } from './services/socketio.service';
import { SharedOnboardingService } from "./modules/onboarding/shared-onboarding.service";
import { APIService, JReponse } from "./services/api.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "voxxi-code";
  applyClass: any;
  showOrientationMessage: boolean;

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(event) {
    const o = window.orientation;
    if (o === 90 || o === -90) {
      this.showOrientationMessage = true;
    } else {
      this.showOrientationMessage = false;
    }
  }
  constructor(
    public config: HelperService,
    private router: Router,
    public helperService: HelperService,
    public homeService: HomeService,
    private socketService: SocketService,
    private sharedOnboardingService: SharedOnboardingService,
    private apiService: APIService,
  ) {}

  ngOnInit() {
    this.helperService.changeClass();
    if(localStorage.getItem('userData')){
      this.getOrganizations();
    }
    
    // this.socketService.connectSocket();
    //  this.applyClass=this.helperService.applyClass();
    // this.router.events.subscribe((el) => {

    //   if (el["url"]) {
    //     if (el["url"].includes("/auth") || el["url"].includes("/onboarding")) {
    //       this.applyClass = false;
    //     } else {
    //       this.applyClass = true;
    //     }
    //   }
    // });
  }

  getOrganizations() {
    this.apiService
      .getWithHeader("organization/getOrganizations")
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.helperService.setLocalStore("organizations", jresponse.body);
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  onActivate(event) {
    window.scroll(0, 0);
  }

}
